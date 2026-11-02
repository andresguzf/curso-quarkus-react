import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/api/ApiError'
import { queryKeys } from '@/api/queryKeys'
import { useSessionStore } from '@/store/useSessionStore'

declare module '@tanstack/react-query' {
  interface Register {
    // ignoreUnauthorized: el 401 es una respuesta esperada (login con credenciales incorrectas)
    mutationMeta: { ignoreUnauthorized?: boolean }
  }
}

const isUnauthorized = (error: unknown) => isApiError(error) && error.status === 401

// Un 401 en cualquier petición con sesión significa que el JWT venció: se borra el usuario de la
// cache y RequireAuth lleva al login, donde se avisa que la sesión expiró
function handleUnauthorized() {
  useSessionStore.getState().markExpired()
  queryClient.setQueryData(queryKeys.me, null)
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isUnauthorized(error)) handleUnauthorized()
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      if (isUnauthorized(error) && !mutation.meta?.ignoreUnauthorized) handleUnauthorized()
    },
  }),
  defaultOptions: {
    queries: {
      // Reintentar solo fallos de red o del servidor: un 4xx no cambia por repetir la petición
      retry: (failureCount, error) =>
        isApiError(error) && (error.status === 0 || error.status >= 500) && failureCount < 2,
    },
  },
})
