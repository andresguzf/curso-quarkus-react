import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link } from 'react-router'
import { MainNav } from '@/components/layout/MainNav'
import { navItemsFor } from '@/components/layout/navItems'
import { UserMenu } from '@/components/layout/UserMenu'
import { BrandMark } from '@/components/ui/BrandMark'
import { useCurrentUser } from '@/hooks/useAuth'

export function AppHeader() {
  const user = useCurrentUser()
  const items = navItemsFor(user.role)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="-ml-1 grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {mobileOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          <BrandMark />
          <span className="hidden font-semibold sm:inline">Gestión de clientes</span>
        </Link>

        <nav aria-label="Principal" className="ml-4 hidden md:block">
          <MainNav items={items} />
        </nav>

        <div className="ml-auto">
          <UserMenu />
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Principal" className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
          <MainNav items={items} orientation="vertical" onNavigate={() => setMobileOpen(false)} />
        </nav>
      )}
    </header>
  )
}
