import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Select } from '@/components/ui/Select'
import { roles, userCreateSchema, userUpdateSchema, type UserFormValues } from '@/schemas/user.schema'
import { describedBy } from '@/utils/a11y'
import { roleLabels } from '@/utils/format'
import { applyApiErrors } from '@/utils/formErrors'

type Props = {
  formId: string
  // create exige password; edit lo deja opcional (vacío conserva el actual)
  mode: 'create' | 'edit'
  defaultValues?: UserFormValues
  // Motivo por el que el rol no se puede cambiar (el único admin); sin motivo, el rol es editable
  roleLockedReason?: string
  onSubmit: (values: UserFormValues) => Promise<unknown>
}

const EMPTY: UserFormValues = { email: '', password: '', role: 'user' }

export function UserForm({ formId, mode, defaultValues = EMPTY, roleLockedReason, onSubmit }: Props) {
  const id = useId()
  const schema: z.ZodType<UserFormValues, UserFormValues> = mode === 'create' ? userCreateSchema : userUpdateSchema
  const passwordHint = mode === 'create' ? 'Entre 8 y 72 caracteres.' : 'Déjala vacía para mantener la actual.'
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({ resolver: zodResolver(schema), defaultValues })

  async function submit(values: UserFormValues) {
    try {
      await onSubmit(values)
    } catch (error) {
      applyApiErrors(error, setError, ['email', 'password', 'role'], 'email')
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {errors.root?.server && <Alert tone="error">{errors.root.server.message}</Alert>}

      <Field id={`${id}-email`} label="Email" error={errors.email?.message}>
        <Input
          id={`${id}-email`}
          type="email"
          spellCheck={false}
          autoComplete="off"
          placeholder="usuario@ejemplo.com"
          invalid={!!errors.email}
          aria-describedby={describedBy(`${id}-email`, errors.email?.message)}
          data-autofocus
          {...register('email')}
        />
      </Field>

      <Field id={`${id}-password`} label="Contraseña" error={errors.password?.message} hint={passwordHint}>
        <PasswordInput
          id={`${id}-password`}
          autoComplete="new-password"
          invalid={!!errors.password}
          aria-describedby={describedBy(`${id}-password`, errors.password?.message, passwordHint)}
          {...register('password')}
        />
      </Field>

      {roleLockedReason ? (
        // Rol fijo: un select deshabilitado llegaría como undefined, así que el valor viaja oculto
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Rol</p>
          <div className="flex items-center gap-2">
            <Badge tone="brand">{roleLabels.admin}</Badge>
            <span className="text-sm text-slate-500 dark:text-slate-400">{roleLockedReason}</span>
          </div>
          <input type="hidden" {...register('role')} />
        </div>
      ) : (
        <Field id={`${id}-role`} label="Rol" error={errors.role?.message}>
          <Select
            id={`${id}-role`}
            invalid={!!errors.role}
            aria-describedby={describedBy(`${id}-role`, errors.role?.message)}
            {...register('role')}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </Select>
        </Field>
      )}
    </form>
  )
}
