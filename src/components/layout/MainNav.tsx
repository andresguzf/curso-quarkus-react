import { NavLink } from 'react-router'
import type { NavItem } from '@/components/layout/navItems'
import { cn } from '@/utils/cn'

type Props = {
  items: NavItem[]
  // Vertical en el menú móvil
  orientation?: 'horizontal' | 'vertical'
  onNavigate?: () => void
}

export function MainNav({ items, orientation = 'horizontal', onNavigate }: Props) {
  return (
    <ul className={cn('flex gap-1', orientation === 'vertical' && 'flex-col')}>
      {items.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
              )
            }
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
