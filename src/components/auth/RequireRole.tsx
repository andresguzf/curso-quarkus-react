import { Navigate, Outlet } from 'react-router'
import { useCurrentUser } from '@/hooks/useAuth'
import type { Role } from '@/schemas/user.schema'

type Props = {
  role: Role
}

// Va dentro de RequireAuth. Ocultar una ruta no reemplaza la autorización: la API también la valida
export function RequireRole({ role }: Props) {
  const user = useCurrentUser()
  if (user.role !== role) return <Navigate to="/customers" replace />
  return <Outlet />
}
