import { useState } from 'react'
import { Contact, Plus, SearchX } from 'lucide-react'
import { CustomerFilters } from '@/components/customers/CustomerFilters'
import { CustomerFormModal } from '@/components/customers/CustomerFormModal'
import { CustomerTable } from '@/components/customers/CustomerTable'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { FilterToggleButton } from '@/components/filters/FilterToggleButton'
import { ListLayout } from '@/components/layout/ListLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResultsCard } from '@/components/layout/ResultsCard'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { useCurrentUser } from '@/hooks/useAuth'
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers'
import { useListSearch } from '@/hooks/useListSearch'
import { customerFilterKeys, customerSearchSchema, type Customer } from '@/schemas/customer.schema'
import { cn } from '@/utils/cn'

type FormState = { open: boolean; customer?: Customer }

// Página contenedora: lee el estado del listado de la URL, obtiene los datos y compone los componentes
export function CustomersPage() {
  const user = useCurrentUser()
  const canManage = user.role === 'admin'
  const { search, activeCount, setFilters, setPage, setSize, setSort, clearFilters } = useListSearch(
    customerSearchSchema,
    customerFilterKeys,
  )
  const { data, isPending, error, isFetching, isPlaceholderData, refetch } = useCustomers(search)
  const remove = useDeleteCustomer()
  const [form, setForm] = useState<FormState>({ open: false })
  const [deleting, setDeleting] = useState<Customer | null>(null)

  function handleConfirmDelete() {
    if (!deleting) return
    remove.mutate(deleting, {
      onSuccess: () => {
        // Era el último de la página: vuelve a la anterior para no quedar en una página vacía
        if (data?.content.length === 1 && search.page > 0) setPage(search.page - 1)
      },
      onSettled: () => setDeleting(null),
    })
  }

  return (
    <>
      <title>Clientes · Gestión de clientes</title>
      <PageHeader
        title="Clientes"
        description={data ? `${data.totalElements} ${data.totalElements === 1 ? 'cliente' : 'clientes'}` : 'Cargando…'}
        actions={
          <>
            <FilterToggleButton activeCount={activeCount} />
            {canManage && (
              <Button onClick={() => setForm({ open: true })}>
                <Plus aria-hidden="true" className="size-4" />
                Nuevo cliente
              </Button>
            )}
          </>
        }
      />

      <ListLayout
        sidebar={
          <FilterSidebar activeCount={activeCount} onClear={clearFilters}>
            <CustomerFilters values={search} onChange={setFilters} />
          </FilterSidebar>
        }
      >
        <ResultsCard busy={isFetching} error={error} onRetry={() => void refetch()}>
          {data?.totalElements === 0 ? (
            activeCount > 0 ? (
              <EmptyState
                icon={SearchX}
                title="Sin resultados"
                description="Ningún cliente coincide con los filtros. Prueba con otros valores."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Contact}
                title="Aún no hay clientes"
                description={canManage ? 'Crea el primero para empezar.' : 'Cuando se registren clientes aparecerán aquí.'}
                action={
                  canManage && (
                    <Button onClick={() => setForm({ open: true })}>
                      <Plus aria-hidden="true" className="size-4" />
                      Nuevo cliente
                    </Button>
                  )
                }
              />
            )
          ) : (
            <>
              {/* Mientras llega la página nueva se ven los datos anteriores atenuados */}
              <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
                <CustomerTable
                  customers={data?.content ?? []}
                  loading={isPending}
                  sort={search.sort}
                  dir={search.dir}
                  onSort={setSort}
                  canManage={canManage}
                  onEdit={(customer) => setForm({ open: true, customer })}
                  onDelete={setDeleting}
                />
              </div>
              {data && (
                <Pagination
                  page={data.page}
                  size={data.size}
                  totalElements={data.totalElements}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                  onSizeChange={setSize}
                />
              )}
            </>
          )}
        </ResultsCard>
      </ListLayout>

      <CustomerFormModal
        key={form.customer?.id ?? 'new'}
        open={form.open}
        customer={form.customer}
        onClose={() => setForm({ open: false })}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar cliente"
        confirmLabel="Eliminar"
        loading={remove.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      >
        ¿Eliminar a{' '}
        <strong className="text-slate-900 dark:text-white">
          {deleting?.name} {deleting?.lastName}
        </strong>
        ? Esta acción no se puede deshacer.
      </ConfirmDialog>
    </>
  )
}
