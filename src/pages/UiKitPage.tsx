import { useId, useState } from 'react'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { FilterToggleButton } from '@/components/filters/FilterToggleButton'
import { ListLayout } from '@/components/layout/ListLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Select } from '@/components/ui/Select'
import { SkeletonRows, SortableTh, Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import type { SortDir } from '@/schemas/common.schema'
import { flash } from '@/store/useFlashStore'

// Catálogo de componentes solo para desarrollo (ruta /ui-kit, no existe en el build de producción)
type DemoRow = { id: number; name: string; email: string; role: 'user' | 'admin' }
type DemoSort = 'name' | 'email'

const demoRows: DemoRow[] = [
  { id: 1, name: 'Ana Pérez', email: 'ana@ejemplo.com', role: 'admin' },
  { id: 2, name: 'Luis Soto', email: 'luis@ejemplo.com', role: 'user' },
  { id: 3, name: 'Marta Gómez', email: 'marta@ejemplo.com', role: 'user' },
]

export function UiKitPage() {
  const id = useId()
  const [sort, setSort] = useState<DemoSort>('name')
  const [dir, setDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(4)
  const [size, setSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const rows = [...demoRows].sort((a, b) => (dir === 'asc' ? 1 : -1) * a[sort].localeCompare(b[sort]))

  function handleSort(field: DemoSort, nextDir: SortDir) {
    setSort(field)
    setDir(nextDir)
  }

  function handleConfirm() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setConfirmOpen(false)
      flash.success('Cliente eliminado')
    }, 1200)
  }

  return (
    <>
      <title>UI kit · Gestión de clientes</title>
      <PageHeader
        title="UI kit"
        description="Componentes base de la app (solo en desarrollo)"
        actions={
          <>
            <FilterToggleButton activeCount={2} />
            <Button>
              <Plus aria-hidden="true" className="size-4" />
              Nuevo
            </Button>
          </>
        }
      />

      <ListLayout
        sidebar={
          <FilterSidebar activeCount={2} onClear={() => undefined}>
            <Field id={`${id}-name`} label="Nombre">
              <Input id={`${id}-name`} placeholder="Ej. Ana" />
            </Field>
            <Field id={`${id}-role`} label="Rol">
              <Select id={`${id}-role`} defaultValue="">
                <option value="">Todos</option>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </Select>
            </Field>
          </FilterSidebar>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="danger">Peligro</Button>
            <Button variant="ghost">Fantasma</Button>
            <Button loading>Guardando</Button>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Abrir modal
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 aria-hidden="true" className="size-4" />
              Confirmar borrado
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => flash.success('Cliente creado')}>
              Flash éxito
            </Button>
            <Button variant="secondary" size="sm" onClick={() => flash.error('No puedes eliminar al único administrador.')}>
              Flash error
            </Button>
            <Button variant="secondary" size="sm" onClick={() => flash.info('Tus cambios se guardaron como borrador')}>
              Flash info
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="brand">Administrador</Badge>
            <Badge tone="success">Activo</Badge>
            <Badge tone="warning">Pendiente</Badge>
            <Badge tone="danger">Error</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Alert tone="info">Mensaje informativo.</Alert>
            <Alert tone="success">Operación exitosa.</Alert>
            <Alert tone="warning">Revisa este dato.</Alert>
            <Alert tone="error">Algo salió mal.</Alert>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Table>
              <THead>
                <tr>
                  <SortableTh field="name" sort={sort} dir={dir} onSort={handleSort}>
                    Nombre
                  </SortableTh>
                  <SortableTh field="email" sort={sort} dir={dir} onSort={handleSort}>
                    Email
                  </SortableTh>
                  <Th>Rol</Th>
                  <Th className="text-right">
                    <span className="sr-only">Acciones</span>
                  </Th>
                </tr>
              </THead>
              <TBody>
                {rows.map((row) => (
                  <Tr key={row.id}>
                    <Td className="font-medium text-slate-900 dark:text-white">{row.name}</Td>
                    <Td>{row.email}</Td>
                    <Td>
                      <Badge tone={row.role === 'admin' ? 'brand' : 'neutral'}>{row.role}</Badge>
                    </Td>
                    <Td className="text-right">
                      <Button variant="ghost" size="sm" aria-label={`Editar a ${row.name}`}>
                        <Pencil aria-hidden="true" className="size-4" />
                      </Button>
                    </Td>
                  </Tr>
                ))}
                <SkeletonRows rows={2} columns={4} />
              </TBody>
            </Table>
            <Pagination page={page} size={size} totalElements={157} totalPages={Math.ceil(157 / size)} onPageChange={setPage} onSizeChange={setSize} />
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <EmptyState
              icon={Users}
              title="No hay resultados"
              description="Prueba con otros filtros o crea un registro nuevo."
              action={<Button variant="secondary">Limpiar filtros</Button>}
            />
          </div>
        </div>
      </ListLayout>

      <Modal
        open={modalOpen}
        title="Nuevo cliente"
        description="Completa los datos del cliente."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalOpen(false)}>Guardar</Button>
          </>
        }
      >
        <Field id={`${id}-modal-name`} label="Nombre">
          <Input id={`${id}-modal-name`} data-autofocus />
        </Field>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar cliente"
        confirmLabel="Eliminar"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      >
        ¿Eliminar a <strong className="text-slate-900 dark:text-white">Ana Pérez</strong>? Esta acción no se puede deshacer.
      </ConfirmDialog>
    </>
  )
}
