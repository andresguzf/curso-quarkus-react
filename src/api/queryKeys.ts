import type { CustomerQuery } from '@/schemas/customer.schema'
import type { UserQuery } from '@/schemas/user.schema'

// Claves de React Query en un solo lugar: invalidar ['customers'] refresca todas sus páginas
export const queryKeys = {
  me: ['auth', 'me'] as const,
  customers: {
    all: ['customers'] as const,
    list: (query: CustomerQuery) => ['customers', 'list', query] as const,
    detail: (id: number) => ['customers', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: (query: UserQuery) => ['users', 'list', query] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
  },
}
