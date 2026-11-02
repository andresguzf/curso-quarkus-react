import { Outlet } from 'react-router'
import { FlashArea } from '@/components/flash/FlashArea'
import { AppHeader } from '@/components/layout/AppHeader'

// Topbar fija, mensajes flash bajo ella y el contenido de la ruta
export function AppLayout() {
  return (
    <div className="min-h-dvh">
      {/* Primer elemento con Tab: salta la navegación y va directo al contenido */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <AppHeader />
      <FlashArea />
      <main id="contenido" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 focus:outline-none sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
