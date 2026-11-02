import { useState } from 'react'
import { CustomerSummary } from '@/components/dashboard/CustomerSummary'
import { UserSummary } from '@/components/dashboard/UserSummary'
import { PageHeader } from '@/components/layout/PageHeader'
import { useCurrentUser } from '@/hooks/useAuth'

export function DashboardPage() {
  const user = useCurrentUser()
  // La fecha de referencia se fija al montar: el render queda puro y las claves de las queries, estables
  const [today] = useState(() => new Date())

  return (
    <>
      <title>Resumen · Gestión de clientes</title>
      <PageHeader
        title="Resumen"
        description={user.role === 'admin' ? 'Clientes y usuarios de un vistazo' : 'Los clientes de un vistazo'}
      />
      <div className="space-y-10">
        <CustomerSummary today={today} />
        {user.role === 'admin' && <UserSummary today={today} />}
      </div>
    </>
  )
}
