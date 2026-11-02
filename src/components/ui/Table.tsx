import type { ComponentProps, ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { SortDir } from '@/schemas/common.schema'
import { cn } from '@/utils/cn'

// Tabla con scroll horizontal propio: en móvil no desborda la página. relative contiene los textos
// sr-only (position: absolute) de las cabeceras, que si no ensanchan el documento
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="relative overflow-x-auto">
      <table className={cn('w-full text-left text-sm', className)} {...props} />
    </div>
  )
}

export function THead(props: ComponentProps<'thead'>) {
  return (
    <thead
      className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
      {...props}
    />
  )
}

export function TBody(props: ComponentProps<'tbody'>) {
  return <tbody className="divide-y divide-slate-100 dark:divide-slate-800" {...props} />
}

export function Tr({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40', className)} {...props} />
}

export function Th({ className, ...props }: ComponentProps<'th'>) {
  return <th scope="col" className={cn('px-4 py-3 whitespace-nowrap', className)} {...props} />
}

export function Td({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 text-slate-700 dark:text-slate-300', className)} {...props} />
}

type SortableThProps<K extends string> = {
  field: K
  sort: K
  dir: SortDir
  onSort: (field: K, dir: SortDir) => void
  children: ReactNode
  className?: string
}

// Cabecera ordenable: un clic ordena por esa columna; otro clic invierte la dirección
export function SortableTh<K extends string>({ field, sort, dir, onSort, children, className }: SortableThProps<K>) {
  const active = sort === field
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown
  const nextDir: SortDir = active && dir === 'asc' ? 'desc' : 'asc'

  return (
    <th
      scope="col"
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn('px-4 py-3 whitespace-nowrap', className)}
    >
      <button
        type="button"
        onClick={() => onSort(field, nextDir)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded uppercase hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:text-white',
          active && 'text-slate-900 dark:text-white',
        )}
      >
        {children}
        <Icon aria-hidden="true" className={cn('size-3.5', !active && 'opacity-40')} />
      </button>
    </th>
  )
}

type SkeletonRowsProps = {
  rows?: number
  columns: number
}

export function SkeletonRows({ rows = 5, columns }: SkeletonRowsProps) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} aria-hidden="true">
      {Array.from({ length: columns }, (_, column) => (
        <td key={column} className="px-4 py-3.5">
          <span className="block h-4 animate-pulse rounded motion-reduce:animate-none bg-slate-200 dark:bg-slate-800" style={{ width: `${60 + ((row + column) % 4) * 10}%` }} />
        </td>
      ))}
    </tr>
  ))
}
