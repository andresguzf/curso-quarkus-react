import { useState } from 'react'
import { Plus, SearchX, ShieldCheck } from 'lucide-react'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { FilterToggleButton } from '@/components/filters/FilterToggleButton'
import { ListLayout } from '@/components/layout/ListLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResultsCard } from '@/components/layout/ResultsCard'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { UserDetailModal } from '@/components/users/UserDetailModal'
import { UserFilters } from '@/components/users/UserFilters'
import { UserFormModal } from '@/components/users/UserFormModal'
import { UserTable } from '@/components/users/UserTable'
import { useCurrentUser } from '@/hooks/useAuth'
import { useListSearch } from '@/hooks/useListSearch'
import { useAdminCount, useDeleteUser, useUsers } from '@/hooks/useUsers'
import { userFilterKeys, userSearchSchema, type User } from '@/schemas/user.schema'
import { cn } from '@/utils/cn'
import { userRules } from '@/utils/userRules'

type FormState = { open: boolean; user?: User }

// Solo admin (RequireRole). Mismo patrón que clientes, más las reglas del último admin
export function UsersPage() {
  const currentUser = useCurrentUser()
  const { search, activeCount, setFilters, setPage, setSize, setSort, clearFilters } = useListSearch(
    userSearchSchema,
    userFilterKeys,
  )
  const { data, isPending, error, isFetching, isPlaceholderData, refetch } = useUsers(search)
  // Mientras no se sabe cuántos admins hay, se asume 1: es el caso que más bloquea
  const { data: adminCount = 1 } = useAdminCount()
  const remove = useDeleteUser()
  const [form, setForm] = useState<FormState>({ open: false })
  const [viewing, setViewing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)

  const rulesFor = (user: User) => userRules(user, currentUser, adminCount)

  function openEdit(user: User) {
    setViewing(null)
    setForm({ open: true, user })
  }

  function handleConfirmDelete() {
    if (!deleting) return
    remove.mutate(deleting, {
      onSuccess: () => {
        if (data?.content.length === 1 && search.page > 0) setPage(search.page - 1)
      },
      onSettled: () => setDeleting(null),
    })
  }

  return (
    <>
      <title>Usuarios · Gestión de clientes</title>
      <PageHeader
        title="Usuarios"
        description={
          data
            ? `${data.totalElements} ${data.totalElements === 1 ? 'usuario' : 'usuarios'} · ${adminCount} ${adminCount === 1 ? 'administrador' : 'administradores'}`
            : 'Cargando…'
        }
        actions={
          <>
            <FilterToggleButton activeCount={activeCount} />
            <Button onClick={() => setForm({ open: true })}>
              <Plus aria-hidden="true" className="size-4" />
              Nuevo usuario
            </Button>
          </>
        }
      />

      <ListLayout
        sidebar={
          <FilterSidebar activeCount={activeCount} onClear={clearFilters}>
            <UserFilters values={search} onChange={setFilters} />
          </FilterSidebar>
        }
      >
        <ResultsCard busy={isFetching} error={error} onRetry={() => void refetch()}>
          {data?.totalElements === 0 ? (
            <EmptyState
              icon={activeCount > 0 ? SearchX : ShieldCheck}
              title="Sin resultados"
              description="Ningún usuario coincide con los filtros. Prueba con otros valores."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <>
              <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
                <UserTable
                  users={data?.content ?? []}
                  loading={isPending}
                  currentUserId={currentUser.id}
                  rulesFor={rulesFor}
                  sort={search.sort}
                  dir={search.dir}
                  onSort={setSort}
                  onView={setViewing}
                  onEdit={openEdit}
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

      <UserDetailModal user={viewing} onClose={() => setViewing(null)} onEdit={openEdit} />

      <UserFormModal
        key={form.user?.id ?? 'new'}
        open={form.open}
        user={form.user}
        currentUser={currentUser}
        roleLockedReason={form.user && !rulesFor(form.user).canChangeRole ? rulesFor(form.user).reason : undefined}
        onClose={() => setForm({ open: false })}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar usuario"
        confirmLabel="Eliminar"
        loading={remove.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleting(null)}
      >
        ¿Eliminar a <strong className="break-all text-slate-900 dark:text-white">{deleting?.email}</strong>? Ya no podrá
        iniciar sesión. Esta acción no se puede deshacer.
      </ConfirmDialog>
    </>
  )
}
