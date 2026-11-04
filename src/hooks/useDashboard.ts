import { useQueries, useQuery } from '@tanstack/react-query'
import { fetchCustomers } from '@/api/customerApi'
import { queryKeys } from '@/api/queryKeys'
import { fetchUsers } from '@/api/userApi'
import type { CustomerQuery } from '@/schemas/customer.schema'
import type { UserQuery } from '@/schemas/user.schema'
import { daysAgo, lastMonths } from '@/utils/dates'

// La API no tiene un endpoint de estadísticas: cada número es el totalElements de una página de 1
// con el filtro que corresponde. Las claves van bajo ['customers'] y ['users'], así que crear,
// editar o eliminar refresca el resumen igual que los listados
const RECENT_SIZE = 5
const MONTHS = 6

function customerCountQuery(query: CustomerQuery) {
  const countQuery = { ...query, size: 1 }
  return {
    queryKey: queryKeys.customers.list(countQuery),
    queryFn: () => fetchCustomers(countQuery),
  }
}

function userCountQuery(query: UserQuery) {
  const countQuery = { ...query, size: 1 }
  return {
    queryKey: queryKeys.users.list(countQuery),
    queryFn: () => fetchUsers(countQuery),
  }
}

export type MonthCount = ReturnType<typeof lastMonths>[number] & { count: number | undefined }

export function useCustomerSummary(today: Date) {
  const recentQuery: CustomerQuery = { size: RECENT_SIZE, sort: 'createdAt', dir: 'desc' }
  const recent = useQuery({ queryKey: queryKeys.customers.list(recentQuery), queryFn: () => fetchCustomers(recentQuery) })
  const lastWeek = useQuery({ ...customerCountQuery({ createdFrom: daysAgo(today, 6) }), select: (page) => page.totalElements })

  const months = lastMonths(today, MONTHS)
  const monthly = useQueries({
    queries: months.map((month) => ({
      ...customerCountQuery({ createdFrom: month.from, createdTo: month.to }),
      select: (page: { totalElements: number }) => page.totalElements,
    })),
    combine: (results) => ({
      counts: results.map((result) => result.data),
      isError: results.some((result) => result.isError),
    }),
  })

  return {
    total: recent.data?.totalElements,
    recent: recent.data?.content,
    lastWeek: lastWeek.data,
    monthly: months.map((month, index): MonthCount => ({ ...month, count: monthly.counts[index] })),
    isError: recent.isError || lastWeek.isError || monthly.isError,
  }
}

// Solo para admin: la API responde 403 a los demás roles
export function useUserSummary(today: Date) {
  const recentQuery: UserQuery = { size: RECENT_SIZE, sort: 'createdAt', dir: 'desc' }
  const recent = useQuery({ queryKey: queryKeys.users.list(recentQuery), queryFn: () => fetchUsers(recentQuery) })
  const admins = useQuery({ ...userCountQuery({ role: 'admin' }), select: (page) => page.totalElements })
  const lastWeek = useQuery({ ...userCountQuery({ createdFrom: daysAgo(today, 6) }), select: (page) => page.totalElements })

  const total = recent.data?.totalElements
  return {
    total,
    admins: admins.data,
    users: total !== undefined && admins.data !== undefined ? total - admins.data : undefined,
    recent: recent.data?.content,
    lastWeek: lastWeek.data,
    isError: recent.isError || admins.isError || lastWeek.isError,
  }
}
