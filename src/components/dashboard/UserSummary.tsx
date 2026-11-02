import { ShieldCheck, UserPlus, Users } from 'lucide-react'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { RecentList } from '@/components/dashboard/RecentList'
import { RoleBreakdown } from '@/components/dashboard/RoleBreakdown'
import { SeeAllLink } from '@/components/dashboard/SeeAllLink'
import { StatTile } from '@/components/dashboard/StatTile'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { useUserSummary } from '@/hooks/useDashboard'
import { roleLabels } from '@/utils/format'

type Props = {
  today: Date
}

// Solo se monta para admin: la API no deja listar usuarios a otros roles
export function UserSummary({ today }: Props) {
  const summary = useUserSummary(today)

  return (
    <section aria-labelledby="resumen-usuarios" className="space-y-4">
      <h2 id="resumen-usuarios" className="text-lg font-semibold">
        Usuarios
      </h2>
      {summary.isError && <Alert tone="error">No pudimos cargar parte del resumen de usuarios. Recarga la página para reintentar.</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={Users} label="Total de usuarios" value={summary.total} />
        <StatTile icon={ShieldCheck} label="Administradores" value={summary.admins} />
        <StatTile icon={UserPlus} label="Nuevos en 7 días" value={summary.lastWeek} hint="Desde hace una semana" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <DashboardCard title="Usuarios por rol" className="lg:col-span-2">
          <RoleBreakdown admins={summary.admins} users={summary.users} />
        </DashboardCard>
        <DashboardCard title="Últimos usuarios" action={<SeeAllLink to="/users" label="Ver todos los usuarios" />} className="lg:col-span-3">
          <RecentList
            items={summary.recent?.map((user) => ({
              id: user.id,
              primary: user.email,
              createdAt: user.createdAt,
              badge: <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>{roleLabels[user.role]}</Badge>,
            }))}
            emptyText="Aún no hay usuarios."
          />
        </DashboardCard>
      </div>
    </section>
  )
}
