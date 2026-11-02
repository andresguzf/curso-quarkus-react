import { useId } from 'react'
import { Input } from '@/components/ui/Input'

type Props = {
  label: string
  from: string
  to: string
  onChange: (range: { createdFrom?: string; createdTo?: string }) => void
}

// Fechas YYYY-MM-DD (input date nativo). min y max impiden un rango invertido
export function DateRangeFilter({ label, from, to, onChange }: Props) {
  const id = useId()

  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${id}-from`} className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
            Desde
          </label>
          <Input
            id={`${id}-from`}
            name="createdFrom"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => onChange({ createdFrom: event.target.value })}
            className="px-2"
          />
        </div>
        <div>
          <label htmlFor={`${id}-to`} className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
            Hasta
          </label>
          <Input
            id={`${id}-to`}
            name="createdTo"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => onChange({ createdTo: event.target.value })}
            className="px-2"
          />
        </div>
      </div>
    </fieldset>
  )
}
