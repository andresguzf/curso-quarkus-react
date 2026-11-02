import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isApiError } from '@/api/ApiError'
import { fetchMe, login, logout, register } from '@/api/authApi'
import { queryKeys } from '@/api/queryKeys'
import type { RegisterValues } from '@/schemas/auth.schema'
import type { User } from '@/schemas/user.schema'
import { useFlashStore } from '@/store/useFlashStore'
import { useSessionStore } from '@/store/useSessionStore'

// Usuario de la sesión: null si no hay sesión (la API responde 204). Un 401 solo llega con un token
// inválido o vencido
export function useMe() {
  const queryClient = useQueryClient()
  const markExpired = useSessionStore((state) => state.markExpired)
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async (): Promise<User | null> => {
      const hadUser = queryClient.getQueryData(queryKeys.me) != null
      const user = await fetchMe().catch((error: unknown) => {
        if (isApiError(error) && error.status === 401) return null
        throw error
      })
      // Había un usuario en cache y la API ya no lo reconoce: el JWT venció
      if (hadUser && !user) markExpired()
      return user
    },
    staleTime: 5 * 60_000,
  })
}

// Solo para componentes dentro de RequireAuth, donde el usuario siempre existe
export function useCurrentUser(): User {
  const { data } = useMe()
  if (!data) throw new Error('useCurrentUser se usa fuera de una ruta protegida')
  return data
}

export function useLogin() {
  const queryClient = useQueryClient()
  const clearExpired = useSessionStore((state) => state.clearExpired)
  return useMutation({
    mutationFn: login,
    meta: { ignoreUnauthorized: true },
    onSuccess: (user) => {
      clearExpired()
      queryClient.setQueryData(queryKeys.me, user)
    },
  })
}

// Registra y deja la sesión iniciada, para no pedir las credenciales dos veces
export function useRegister() {
  const queryClient = useQueryClient()
  const clearExpired = useSessionStore((state) => state.clearExpired)
  return useMutation({
    mutationFn: async (values: RegisterValues) => {
      await register(values)
      return login(values)
    },
    onSuccess: (user) => {
      clearExpired()
      queryClient.setQueryData(queryKeys.me, user)
    },
  })
}

// Deja la sesión en null y borra los datos y mensajes del usuario anterior. El orden importa: con la
// sesión en null RequireAuth desmonta las páginas protegidas antes de que se queden sin datos
export function useLogout() {
  const queryClient = useQueryClient()
  const clearFlash = useFlashStore((state) => state.clear)
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(queryKeys.me, null)
      queryClient.removeQueries({ predicate: (query) => query.queryKey !== queryKeys.me })
      clearFlash()
    },
  })
}
