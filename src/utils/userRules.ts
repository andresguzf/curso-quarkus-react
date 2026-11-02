import type { User } from '@/schemas/user.schema'

export type UserRules = {
  canDelete: boolean
  // false: el rol queda fijo en admin
  canChangeRole: boolean
  // Motivo para mostrar cuando algo está bloqueado
  reason?: string
}

// Las mismas reglas que aplica la API (responde 409 si se incumplen). La UI las adelanta para no
// ofrecer acciones que van a fallar; la API sigue siendo la que decide
export function userRules(target: User, currentUser: User, adminCount: number): UserRules {
  const isSelf = target.id === currentUser.id
  const isLastAdmin = target.role === 'admin' && adminCount <= 1

  if (isLastAdmin) {
    return { canDelete: false, canChangeRole: false, reason: 'Debe quedar al menos un administrador.' }
  }
  if (isSelf) {
    return { canDelete: false, canChangeRole: true, reason: 'No puedes eliminar tu propio usuario.' }
  }
  return { canDelete: true, canChangeRole: true }
}
