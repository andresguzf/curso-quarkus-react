import type { ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { User } from '@/schemas/user.schema'
import { formatDateTime, roleLabels } from '@/utils/format'

type Props = {
  user: User | null
  onClose: () => void
  onEdit: (user: User) => void
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="col-span-2 text-sm text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  )
}

export function UserDetailModal({ user, onClose, onEdit }: Props) {
  return (
    <Modal
      open={user !== null}
      title="Detalle del usuario"
      onClose={onClose}
      footer={
        user && (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={() => onEdit(user)}>
              <Pencil aria-hidden="true" className="size-4" />
              Editar
            </Button>
          </>
        )
      }
    >
      {user && (
        <dl className="-my-3 divide-y divide-slate-100 dark:divide-slate-800">
          <Row label="Email">
            <span className="break-all">{user.email}</span>
          </Row>
          <Row label="Rol">
            <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>{roleLabels[user.role]}</Badge>
          </Row>
          <Row label="Alta">{formatDateTime(user.createdAt)}</Row>
          <Row label="Última edición">{user.updatedAt ? formatDateTime(user.updatedAt) : 'Sin cambios'}</Row>
          <Row label="ID">{user.id}</Row>
        </dl>
      )}
    </Modal>
  )
}
