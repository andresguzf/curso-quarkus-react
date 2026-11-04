import { Navigate, Outlet, useLocation } from 'react-router'
import { useMe } from '@/hooks/useAuth'
import { redirectTarget } from '@/utils/redirect'

// Login y registro: con sesión iniciada redirige a la ruta de origen (o al resumen).
// Así, tras un login exitoso la redirección se deriva del usuario en cache, sin navegar a mano
export function GuestOnly() {
  const location = useLocation()
  const { data: user } = useMe()
  if (user) return <Navigate to={redirectTarget(location.state)} replace />
  return <Outlet />
}
