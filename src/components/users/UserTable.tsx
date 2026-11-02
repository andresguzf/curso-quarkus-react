import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkeletonRows, SortableTh, Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table'
import type { SortDir } from '@/schemas/common.schema'
import type { User, UserSortField } from '@/schemas/user.schema'
import { formatDate, roleLabels } from '@/utils/format'
import type { UserRules } from '@/utils/userRules'

type Props = {
  users: User[]
  loading: boolean
  currentUserId: number
  rulesFor: (user: User) => UserRules
  sort: UserSortField
  dir: SortDir
  onSort: (field: UserSortField, dir: SortDir) => void
  onView: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserTable({ users, loading, currentUserId, rulesFor, sort, dir, onSort, onView, onEdit, onDelete }: Props) {
  return (
    <Table>
      <caption className="sr-only">Usuarios</caption>
      <THead>
        <tr>
          <SortableTh field="email" sort={sort} dir={dir} onSort={onSort}>
            Email
          </SortableTh>
          <SortableTh field="role" sort={sort} dir={dir} onSort={onSort}>
            Rol
          </SortableTh>
          <SortableTh field="createdAt" sort={sort} dir={dir} onSort={onSort}>
            Alta
          </SortableTh>
          <Th className="text-right">
            <span className="sr-only">Acciones</span>
          </Th>
        </tr>
      </THead>
      <TBody>
        {loading ? (
          <SkeletonRows columns={4} />
        ) : (
          users.map((user) => {
            const rules = rulesFor(user)
            return (
              <Tr key={user.id}>
                <Td className="font-medium text-slate-900 dark:text-white">
                  <span className="block max-w-72 truncate">
                    {user.email}
                    {user.id === currentUserId && <span className="ml-1.5 font-normal text-slate-500 dark:text-slate-400">(tú)</span>}
                  </span>
                </Td>
                <Td>
                  <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>{roleLabels[user.role]}</Badge>
                </Td>
                <Td className="whitespace-nowrap tabular-nums">
                  <time dateTime={user.createdAt}>{formatDate(user.createdAt)}</time>
                </Td>
                <Td className="text-right whitespace-nowrap">
                  <Button variant="ghost" size="sm" onClick={() => onView(user)} aria-label={`Ver a ${user.email}`} title="Ver detalle">
                    <Eye aria-hidden="true" className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(user)} aria-label={`Editar a ${user.email}`} title="Editar">
                    <Pencil aria-hidden="true" className="size-4" />
                  </Button>
                  {/* Bloqueado para ti mismo o el único admin. El tooltip va en el span porque un botón
                      deshabilitado no lo muestra en todos los navegadores */}
                  <span title={rules.canDelete ? 'Eliminar' : rules.reason} className="inline-block">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(user)}
                      disabled={!rules.canDelete}
                      aria-label={rules.canDelete ? `Eliminar a ${user.email}` : `Eliminar a ${user.email}: ${rules.reason}`}
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </span>
                </Td>
              </Tr>
            )
          })
        )}
      </TBody>
    </Table>
  )
}
