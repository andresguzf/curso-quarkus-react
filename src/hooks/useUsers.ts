import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/api/ApiError'
import { queryKeys } from '@/api/queryKeys'
import { createUser, deleteUser, fetchUsers, updateUser } from '@/api/userApi'
import type { User, UserCreateValues, UserQuery, UserUpdateValues } from '@/schemas/user.schema'
import { flash } from '@/store/useFlashStore'

export function useUsers(query: UserQuery) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => fetchUsers(query),
    placeholderData: keepPreviousData,
  })
}

// Cantidad de admins: la API la entrega como totalElements de una página de 1 filtrada por rol.
// Vive bajo ['users'], así que cualquier cambio de usuarios la refresca
export function useAdminCount() {
  return useQuery({
    queryKey: queryKeys.users.list({ role: 'admin', size: 1 }),
    queryFn: () => fetchUsers({ role: 'admin', size: 1 }),
    select: (page) => page.totalElements,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UserCreateValues) => createUser(values),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      flash.success(`Usuario ${user.email} creado`)
    },
  })
}

// Si el usuario editado es el de la sesión, se actualiza también `me`: al quitarse el rol admin,
// RequireRole lo saca de /users solo
export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: UserUpdateValues }) => updateUser(id, values),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      if (queryClient.getQueryData<User | null>(queryKeys.me)?.id === user.id) {
        queryClient.setQueryData(queryKeys.me, user)
      }
      flash.success(`Usuario ${user.email} actualizado`)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (user: User) => deleteUser(user.id),
    onSuccess: (_, user) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      flash.success(`Usuario ${user.email} eliminado`)
    },
    // 409 de la API (por ejemplo, el único admin): su mensaje explica el motivo
    onError: (error) => flash.error(errorMessage(error)),
  })
}
