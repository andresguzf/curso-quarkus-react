import { Alert } from '@/components/ui/Alert'
import { cn } from '@/utils/cn'

type Props = {
  admins: number | undefined
  users: number | undefined
}

const percentFormatter = new Intl.NumberFormat('es', { style: 'percent', maximumFractionDigits: 0 })

// Barra apilada de dos segmentos con hueco de 2px y leyenda con números: el rol no depende solo del color
export function RoleBreakdown({ admins, users }: Props) {
  if (admins === undefined || users === undefined) {
    return <div className="h-24 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none dark:bg-slate-800" />
  }

  const total = admins + users
  const segments = [
    { key: 'admin', label: 'Administradores', count: admins, color: 'bg-chart-1' },
    { key: 'user', label: 'Usuarios', count: users, color: 'bg-chart-2' },
  ]

  return (
    <div className="space-y-4">
      <div aria-hidden="true" className="flex h-3 gap-0.5">
        {segments
          .filter((segment) => segment.count > 0)
          .map((segment) => (
            <div key={segment.key} className="group relative h-full" style={{ flexGrow: segment.count }}>
              <div className={cn('h-full rounded', segment.color)} />
              <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-700">
                {segment.label}: <span className="font-semibold tabular-nums">{segment.count}</span>
              </div>
            </div>
          ))}
      </div>

      <ul className="space-y-2 text-sm">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn('size-2.5 rounded-sm', segment.color)} />
            <span className="text-slate-700 dark:text-slate-300">{segment.label}</span>
            <span className="ml-auto font-medium text-slate-900 tabular-nums dark:text-white">{segment.count}</span>
            <span className="w-10 text-right text-slate-500 tabular-nums dark:text-slate-400">
              {percentFormatter.format(total ? segment.count / total : 0)}
            </span>
          </li>
        ))}
      </ul>

      {admins <= 1 ? (
        <Alert tone="warning">Hay un solo administrador: no se puede eliminar ni quitarle el rol hasta que haya otro.</Alert>
      ) : (
        <Alert tone="success">Hay {admins} administradores: la administración no depende de una sola cuenta.</Alert>
      )}
    </div>
  )
}
