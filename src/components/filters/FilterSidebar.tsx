import type { ReactNode } from 'react'
import { PanelLeftClose, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/store/useUiStore'
import { cn } from '@/utils/cn'

type Props = {
  activeCount: number
  onClear?: () => void
  children: ReactNode
}

// Un solo árbol para escritorio y móvil, así los filtros no se montan dos veces:
// - escritorio (lg): columna de w-72 que se colapsa en un riel de w-12 y deja la tabla a lo ancho
// - móvil: drawer desde la izquierda que se abre con <FilterToggleButton>
export function FilterSidebar({ activeCount, onClear, children }: Props) {
  const collapsed = useUiStore((state) => state.filtersCollapsed)
  const toggle = useUiStore((state) => state.toggleFilters)
  const mobileOpen = useUiStore((state) => state.mobileFiltersOpen)
  const closeMobile = useUiStore((state) => state.closeMobileFilters)

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar filtros"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        aria-label="Filtros"
        onKeyDown={(event) => {
          if (event.key === 'Escape') closeMobile()
        }}
        className={cn(
          // Móvil: drawer fijo; invisible cuando está cerrado para que no reciba el foco
          'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto overscroll-contain bg-white shadow-xl transition-transform duration-200 dark:bg-slate-900',
          mobileOpen ? 'translate-x-0' : '-translate-x-full max-lg:invisible',
          // Escritorio: columna fija junto a la tabla
          'lg:sticky lg:top-24 lg:z-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:bg-transparent lg:shadow-none lg:transition-none dark:lg:bg-transparent',
          collapsed ? 'lg:w-12' : 'lg:w-72',
        )}
      >
        {/* Riel del escritorio colapsado */}
        <div className={cn('hidden', collapsed && 'lg:block')}>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={false}
            aria-label={activeCount > 0 ? `Mostrar filtros (${activeCount} activos)` : 'Mostrar filtros'}
            title="Mostrar filtros"
            className="relative grid size-12 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <SlidersHorizontal aria-hidden="true" className="size-5" />
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Panel con los filtros */}
        <div
          className={cn(
            'flex min-h-full flex-col lg:min-h-0 lg:rounded-xl lg:border lg:border-slate-200 lg:bg-white lg:shadow-sm dark:lg:border-slate-800 dark:lg:bg-slate-900',
            collapsed && 'lg:hidden',
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal aria-hidden="true" className="size-4 text-slate-500" />
              Filtros
              {activeCount > 0 && (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                  {activeCount}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={toggle}
              aria-expanded={true}
              aria-label="Ocultar filtros"
              title="Ocultar filtros"
              className="hidden size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:grid dark:hover:bg-slate-800"
            >
              <PanelLeftClose aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Cerrar filtros"
              className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden dark:hover:bg-slate-800"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 p-4">{children}</div>

          {onClear && (
            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
              <Button variant="secondary" size="sm" className="w-full" onClick={onClear} disabled={activeCount === 0}>
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
