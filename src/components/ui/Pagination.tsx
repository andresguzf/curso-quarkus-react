import { useId } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { PAGE_SIZES, pageWindow, visibleRange } from '@/utils/pagination'

type Props = {
  page: number
  size: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

const pageButton =
  'grid h-8 tabular-nums min-w-8 place-items-center rounded-lg px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40'

// page empieza en 0 (como la API); en pantalla se muestra desde 1
export function Pagination({ page, size, totalElements, totalPages, onPageChange, onSizeChange }: Props) {
  const sizeId = useId()
  const { from, to } = visibleRange(page, size, totalElements)

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <p className="text-slate-600 tabular-nums dark:text-slate-400" aria-live="polite">
        Mostrando <span className="font-medium text-slate-900 dark:text-white">{from}–{to}</span> de{' '}
        <span className="font-medium text-slate-900 dark:text-white">{totalElements}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor={sizeId} className="text-slate-600 dark:text-slate-400">
            Por página
          </label>
          <select
            id={sizeId}
            value={size}
            onChange={(event) => onSizeChange(Number(event.target.value))}
            className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
          >
            {PAGE_SIZES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <nav aria-label="Paginación" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            aria-label="Página anterior"
            className={cn(pageButton, 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800')}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          {pageWindow(page, totalPages).map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Página ${item + 1}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  pageButton,
                  item === page
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                {item + 1}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label="Página siguiente"
            className={cn(pageButton, 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800')}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </nav>
      </div>
    </div>
  )
}
