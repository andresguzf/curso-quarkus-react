import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  label: string
  // undefined mientras carga
  value: number | undefined
  hint?: ReactNode
}

const numberFormatter = new Intl.NumberFormat('es')

// Un número destacado con su etiqueta: el resumen no necesita un gráfico para un solo valor
export function StatTile({ icon: Icon, label, value, hint }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </div>
      {value === undefined ? (
        <span aria-label="Cargando" className="mt-3 block h-9 w-16 animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none dark:bg-slate-800" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums dark:text-white">{numberFormatter.format(value)}</p>
      )}
      {hint && <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  )
}
