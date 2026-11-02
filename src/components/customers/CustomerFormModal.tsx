import { useId } from 'react'
import { CustomerForm } from '@/components/customers/CustomerForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers'
import type { Customer, CustomerFormValues } from '@/schemas/customer.schema'

type Props = {
  open: boolean
  // Con cliente edita; sin cliente crea
  customer?: Customer
  onClose: () => void
}

// Contenedor: decide qué mutation usar y cierra al guardar. El padre lo monta con
// key={customer?.id ?? 'new'} para que cada apertura empiece con un formulario limpio
export function CustomerFormModal({ open, customer, onClose }: Props) {
  const formId = useId()
  const create = useCreateCustomer()
  const update = useUpdateCustomer()
  const saving = create.isPending || update.isPending

  async function handleSubmit(values: CustomerFormValues) {
    if (customer) await update.mutateAsync({ id: customer.id, values })
    else await create.mutateAsync(values)
    onClose()
  }

  return (
    <Modal
      open={open}
      title={customer ? 'Editar cliente' : 'Nuevo cliente'}
      description={customer ? `${customer.name} ${customer.lastName}` : 'Completa los datos del cliente.'}
      onClose={onClose}
      dismissible={!saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={saving}>
            {customer ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </>
      }
    >
      <CustomerForm
        formId={formId}
        defaultValues={customer && { name: customer.name, lastName: customer.lastName, email: customer.email }}
        onSubmit={handleSubmit}
      />
    </Modal>
  )
}
