import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert } from '@/components/ui/Alert'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { customerFormSchema, type CustomerFormValues } from '@/schemas/customer.schema'
import { describedBy } from '@/utils/a11y'
import { applyApiErrors } from '@/utils/formErrors'

type Props = {
  // id del <form>: el botón de guardar vive en el pie del modal y lo enlaza con form={formId}
  formId: string
  defaultValues?: CustomerFormValues
  // El padre decide si crea o actualiza; si la promesa falla, el error se muestra en el formulario
  onSubmit: (values: CustomerFormValues) => Promise<unknown>
}

const EMPTY: CustomerFormValues = { name: '', lastName: '', email: '' }

export function CustomerForm({ formId, defaultValues = EMPTY, onSubmit }: Props) {
  const id = useId()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
  })

  async function submit(values: CustomerFormValues) {
    try {
      await onSubmit(values)
    } catch (error) {
      applyApiErrors(error, setError, ['name', 'lastName', 'email'], 'email')
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {errors.root?.server && <Alert tone="error">{errors.root.server.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-name`} label="Nombre" error={errors.name?.message}>
          <Input
            id={`${id}-name`}
            autoComplete="off"
            invalid={!!errors.name}
            aria-describedby={describedBy(`${id}-name`, errors.name?.message)}
            data-autofocus
            {...register('name')}
          />
        </Field>
        <Field id={`${id}-lastName`} label="Apellido" error={errors.lastName?.message}>
          <Input
            id={`${id}-lastName`}
            autoComplete="off"
            invalid={!!errors.lastName}
            aria-describedby={describedBy(`${id}-lastName`, errors.lastName?.message)}
            {...register('lastName')}
          />
        </Field>
      </div>

      <Field id={`${id}-email`} label="Email" error={errors.email?.message}>
        <Input
          id={`${id}-email`}
          type="email"
          spellCheck={false}
          autoComplete="off"
          placeholder="cliente@ejemplo.com"
          invalid={!!errors.email}
          aria-describedby={describedBy(`${id}-email`, errors.email?.message)}
          {...register('email')}
        />
      </Field>
    </form>
  )
}
