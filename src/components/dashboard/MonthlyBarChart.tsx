import type { MonthCount } from '@/hooks/useDashboard'

type Props = {
  data: MonthCount[]
  // Sustantivo para el tooltip y la tabla: "clientes"
  unit: string
}

// Barras verticales de una sola serie (un color, sin leyenda: el título de la tarjeta la nombra).
// Solo se rotulan el máximo y el mes actual; el resto se lee con el tooltip o en la tabla para lectores
export function MonthlyBarChart({ data, unit }: Props) {
  const loading = data.some((month) => month.count === undefined)
  const max = Math.max(1, ...data.map((month) => month.count ?? 0))
  const maxIndex = data.findIndex((month) => month.count === max)
  const lastIndex = data.length - 1

  return (
    <figure>
      <div aria-hidden="true" className="flex h-44 items-end gap-2 border-b border-slate-200 pt-6 sm:gap-4 dark:border-slate-800">
        {data.map((month, index) => {
          const count = month.count ?? 0
          const height = loading ? 30 + ((index * 23) % 50) : (count / max) * 100
          const labeled = !loading && (index === lastIndex || index === maxIndex)
          return (
            <div key={month.key} className="group relative flex h-full flex-1 items-end justify-center">
              {loading ? (
                <div className="w-full max-w-12 animate-pulse rounded-t bg-slate-200 motion-reduce:animate-none dark:bg-slate-800" style={{ height: `${height}%` }} />
              ) : (
                <>
                  {labeled && (
                    <span className="absolute text-xs font-medium text-slate-700 tabular-nums dark:text-slate-300" style={{ bottom: `calc(${height}% + 4px)` }}>
                      {count}
                    </span>
                  )}
                  <div className="w-full max-w-12 rounded-t bg-chart-1 group-hover:opacity-85" style={{ height: `${height}%` }} />
                  <div className="pointer-events-none absolute -top-2 z-10 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-700">
                    <span className="capitalize">{month.longLabel}</span>: <span className="font-semibold tabular-nums">{count}</span> {unit}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
      <div aria-hidden="true" className="mt-2 flex gap-2 sm:gap-4">
        {data.map((month) => (
          <span key={month.key} className="flex-1 text-center text-xs text-slate-500 capitalize dark:text-slate-400">
            {month.label}
          </span>
        ))}
      </div>

      {!loading && (
        <table className="sr-only">
          <caption>Altas de {unit} por mes</caption>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              <th scope="col">Altas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((month) => (
              <tr key={month.key}>
                <th scope="row">{month.longLabel}</th>
                <td>{month.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </figure>
  )
}
