import { useId, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useCurrentUser, useLogout } from '@/hooks/useAuth'
import { useDismiss } from '@/hooks/useDismiss'
import { roleLabels } from '@/utils/format'

export function UserMenu() {
  const user = useCurrentUser()
  const logout = useLogout()
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false))
  const initial = user.email.charAt(0).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Menú de usuario"
        className="flex items-center gap-2 rounded-full p-1 pr-2 text-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800"
      >
        <span className="grid size-8 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
          {initial}
        </span>
        <span className="hidden max-w-48 truncate text-slate-700 lg:inline dark:text-slate-200">{user.email}</span>
        <ChevronDown aria-hidden="true" className="size-4 text-slate-400" />
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-40 mt-2 w-64 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg transition-[opacity,scale] duration-100 starting:scale-95 starting:opacity-0 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
            <div className="mt-1.5">
              <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>{roleLabels[user.role]}</Badge>
            </div>
          </div>
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {logout.isPending ? <Spinner /> : <LogOut aria-hidden="true" className="size-4" />}
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
