import type { ReactNode } from 'react'

type Props = {
  // Normalmente un <FilterSidebar>
  sidebar: ReactNode
  children: ReactNode
}

// Página de listado: filtros a la izquierda y contenido (tabla y paginación) a la derecha.
// min-w-0 deja que la tabla haga scroll propio en vez de ensanchar la página
export function ListLayout({ sidebar, children }: Props) {
  return (
    <div className="flex items-start gap-6">
      {sidebar}
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  )
}
