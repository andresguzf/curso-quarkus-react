import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SkeletonRows, SortableTh, Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import type { SortDir } from '@/schemas/common.schema'
import type { Customer, CustomerSortField } from '@/schemas/customer.schema'
import { formatDate } from '@/utils/format'

type Props = {
  customers: Customer[]
  loading: boolean
  sort: CustomerSortField
  dir: SortDir
  onSort: (field: CustomerSortField, dir: SortDir) => void
  // Solo admin edita y elimina; el rol user ve la tabla sin acciones
  canManage: boolean
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

export function CustomerTable({ customers, loading, sort, dir, onSort, canManage, onEdit, onDelete }: Props) {
  const columns = canManage ? 5 : 4

  return (
    <Table>
      <caption className="sr-only">Clientes</caption>
      <THead>
        <tr>
          <SortableTh field="name" sort={sort} dir={dir} onSort={onSort}>
            Nombre
          </SortableTh>
          <SortableTh field="lastName" sort={sort} dir={dir} onSort={onSort}>
            Apellido
          </SortableTh>
          <SortableTh field="email" sort={sort} dir={dir} onSort={onSort}>
            Email
          </SortableTh>
          <SortableTh field="createdAt" sort={sort} dir={dir} onSort={onSort}>
            Alta
          </SortableTh>
          {canManage && (
            <Th className="text-right">
              <span className="sr-only">Acciones</span>
            </Th>
          )}
        </tr>
      </THead>
      <TBody>
        {loading ? (
          <SkeletonRows columns={columns} />
        ) : (
          customers.map((customer) => (
            <Tr key={customer.id}>
              <Td className="font-medium text-slate-900 dark:text-white">{customer.name}</Td>
              <Td>{customer.lastName}</Td>
              <Td className="max-w-64 truncate">{customer.email}</Td>
              <Td className="whitespace-nowrap tabular-nums">
                <time dateTime={customer.createdAt}>{formatDate(customer.createdAt)}</time>
              </Td>
              {canManage && (
                <Td className="text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(customer)}
                    aria-label={`Editar a ${customer.name} ${customer.lastName}`}
                    title="Editar"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(customer)}
                    aria-label={`Eliminar a ${customer.name} ${customer.lastName}`}
                    title="Eliminar"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </Td>
              )}
            </Tr>
          ))
        )}
      </TBody>
    </Table>
  )
}
