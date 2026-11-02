import { useId, useState } from 'react'
import { errorMessage } from '@/api/ApiError'
import { UserForm } from '@/components/users/UserForm'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import type { User, UserFormValues } from '@/schemas/user.schema'
import { flash } from '@/store/useFlashStore'

type Props = {
  open: boolean
  // Con usuario edita; sin usuario crea
  user?: User
  currentUser: User
  roleLockedReason?: string
  onClose: () => void
}

// Contenedor: crea o edita y cierra al guardar. Si el admin se quita su propio rol admin, pide una
// confirmación extra antes de enviar, porque pierde el acceso a esta pantalla
export function UserFormModal({ open, user, currentUser, roleLockedReason, onClose }: Props) {
  const formId = useId()
  const create = useCreateUser()
  const update = useUpdateUser()
  const saving = create.isPending || update.isPending
  const [pendingDemotion, setPendingDemotion] = useState<UserFormValues | null>(null)

  async function save(values: UserFormValues) {
    if (user) await update.mutateAsync({ id: user.id, values })
    else await create.mutateAsync(values)
    onClose()
  }

  async function handleSubmit(values: UserFormValues) {
    const demotesSelf = user?.id === currentUser.id && user.role === 'admin' && values.role === 'user'
    if (demotesSelf) {
      setPendingDemotion(values)
      return
    }
    await save(values)
  }

  // Desde la confirmación no hay formulario que muestre el error: va a un flash
  function handleConfirmDemotion() {
    if (!pendingDemotion) return
    save(pendingDemotion)
      .catch((error: unknown) => flash.error(errorMessage(error)))
      .finally(() => setPendingDemotion(null))
  }

  return (
    <>
      <Modal
        open={open}
        title={user ? 'Editar usuario' : 'Nuevo usuario'}
        description={user ? user.email : 'El usuario podrá iniciar sesión con este email y contraseña.'}
        onClose={onClose}
        dismissible={!saving}
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form={formId} loading={saving}>
              {user ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </>
        }
      >
        <UserForm
          formId={formId}
          mode={user ? 'edit' : 'create'}
          defaultValues={user && { email: user.email, password: '', role: user.role }}
          roleLockedReason={roleLockedReason}
          onSubmit={handleSubmit}
        />
      </Modal>

      <ConfirmDialog
        open={pendingDemotion !== null}
        title="Quitarte el rol de administrador"
        confirmLabel="Sí, cambiar mi rol"
        tone="danger"
        loading={update.isPending}
        onConfirm={handleConfirmDemotion}
        onCancel={() => setPendingDemotion(null)}
      >
        Perderás el acceso a la administración de usuarios. Para recuperarlo, otro administrador tendrá
        que devolverte el rol.
      </ConfirmDialog>
    </>
  )
}
