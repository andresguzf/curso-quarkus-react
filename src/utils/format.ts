import type { Role } from '@/schemas/user.schema'

export const roleLabels: Record<Role, string> = {
  user: 'Usuario',
  admin: 'Administrador',
}

const dateFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })

// Las fechas de la API vienen sin zona (LocalDateTime): new Date las interpreta como hora local
export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value))
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value))
}
