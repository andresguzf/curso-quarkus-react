// Fechas locales en formato YYYY-MM-DD, el que esperan los filtros createdFrom y createdTo de la API
export function toLocalDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// Hace n días (hoy cuenta como el día 0): daysAgo(hoy, 6) abarca los últimos 7 días
export function daysAgo(today: Date, days: number): string {
  return toLocalDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days))
}

export type MonthRange = {
  // YYYY-MM: identifica el mes en keys y en la tabla
  key: string
  label: string
  longLabel: string
  from: string
  to: string
}

const shortMonth = new Intl.DateTimeFormat('es', { month: 'short' })
const longMonth = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' })

// Los últimos n meses, del más antiguo al actual; el mes actual termina hoy
export function lastMonths(today: Date, count: number): MonthRange[] {
  return Array.from({ length: count }, (_, index) => {
    const start = new Date(today.getFullYear(), today.getMonth() - (count - 1 - index), 1)
    const end = index === count - 1 ? today : new Date(start.getFullYear(), start.getMonth() + 1, 0)
    return {
      key: toLocalDate(start).slice(0, 7),
      label: shortMonth.format(start).replace('.', ''),
      longLabel: longMonth.format(start),
      from: toLocalDate(start),
      to: toLocalDate(end),
    }
  })
}
