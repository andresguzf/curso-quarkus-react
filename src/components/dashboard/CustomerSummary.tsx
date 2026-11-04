import { CalendarDays, Contact, UserPlus } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart'
import { RecentList } from '@/components/dashboard/RecentList'
import { SeeAllLink } from '@/components/dashboard/SeeAllLink'
import { StatTile } from '@/components/dashboard/StatTile'
import { Alert } from '@/components/ui/Alert'
import { useCustomerSummary, type MonthCount } from '@/hooks/useDashboard'

type Props = {
  today: Date
}

// Variación del mes actual frente al anterior, en texto: "+2 vs oct"
function monthTrend(current: MonthCount | undefined, previous: MonthCount | undefined): string | undefined {
  if (current?.count === undefined || previous?.count === undefined) return undefined
  const diff = current.count - previous.count
  if (diff === 0) return `Igual que ${previous.label}`
  return `${diff > 0 ? '+' : '−'}${Math.abs(diff)} vs ${previous.label}`
}

export function CustomerSummary({ today }: Props) {
  const summary = useCustomerSummary(today)
  const current = summary.monthly.at(-1)
  const previous = summary.monthly.at(-2)

  return (
    <section aria-labelledby="resumen-clientes" className="space-y-4">
      <h2 id="resumen-clientes" className="text-lg font-semibold">
        Clientes
      </h2>
      {summary.isError && <Alert tone="error">No pudimos cargar parte del resumen de clientes. Recarga la página para reintentar.</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={Contact} label="Total de clientes" value={summary.total} />
        <StatTile icon={UserPlus} label="Nuevos en 7 días" value={summary.lastWeek} hint="Desde hace una semana" />
        <StatTile icon={CalendarDays} label="Altas este mes" value={current?.count} hint={monthTrend(current, previous)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <DashboardCard title="Altas por mes" description="Clientes creados en los últimos 6 meses" className="lg:col-span-3">
          <MonthlyBarChart data={summary.monthly} unit="clientes" />
        </DashboardCard>
        <DashboardCard title="Últimos clientes" action={<SeeAllLink to="/customers" label="Ver todos los clientes" />} className="lg:col-span-2">
          <RecentList
            items={summary.recent?.map((customer) => ({
              id: customer.id,
              primary: `${customer.name} ${customer.lastName}`,
              secondary: customer.email,
              createdAt: customer.createdAt,
            }))}
            emptyText="Aún no hay clientes."
          />
        </DashboardCard>
      </div>
    </section>
  )
}
