import { Contact, LayoutDashboard, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { Role } from '@/schemas/user.schema'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

// Enlaces del menú principal según el rol; la API igual valida cada petición
export function navItemsFor(role: Role): NavItem[] {
  const items: NavItem[] = [
    { to: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
    { to: '/customers', label: 'Clientes', icon: Contact },
  ]
  return role === 'admin' ? [...items, { to: '/users', label: 'Usuarios', icon: ShieldCheck }] : items
}
