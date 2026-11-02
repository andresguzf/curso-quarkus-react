import { Navigate, Outlet, useLocation } from 'react-router'
import { FullPageMessage } from '@/components/auth/FullPageMessage'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useMe } from '@/hooks/useAuth'

// Rutas con sesión: sin usuario lleva al login y recuerda a dónde volver
export function RequireAuth() {
  const location = useLocation()
  const { data: user, isPending, isError, error, refetch, isFetching } = useMe()

  if (isPending) {
    return (
      <FullPageMessage>
        <Spinner className="size-6 text-brand-600" />
        <span className="sr-only">Cargando…</span>
      </FullPageMessage>
    )
  }

  if (isError) {
    return (
      <FullPageMessage>
        <Alert tone="error">{error.message}</Alert>
        <Button variant="secondary" loading={isFetching} onClick={() => refetch()}>
          Reintentar
        </Button>
      </FullPageMessage>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}
