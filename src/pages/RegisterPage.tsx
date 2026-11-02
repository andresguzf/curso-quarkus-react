import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useRegister } from '@/hooks/useAuth'
import { AuthLayout } from '@/layouts/AuthLayout'
import { registerSchema, type RegisterValues } from '@/schemas/auth.schema'
import { describedBy } from '@/utils/a11y'
import { applyApiErrors } from '@/utils/formErrors'

const PASSWORD_HINT = 'Entre 8 y 72 caracteres.'

// El registro deja la sesión iniciada; GuestOnly redirige a clientes al recibir el usuario
export function RegisterPage() {
  const id = useId()
  const registerUser = useRegister()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  function onSubmit(values: RegisterValues) {
    registerUser.mutate(values, {
      onError: (error) => applyApiErrors(error, setError, ['email', 'password']),
    })
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      description="Podrás consultar los clientes registrados"
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Inicia sesión
          </Link>
        </>
      }
    >
      <title>Crear cuenta · Gestión de clientes</title>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {errors.root?.server && <Alert tone="error">{errors.root.server.message}</Alert>}

        <Field id={`${id}-email`} label="Email" error={errors.email?.message}>
          <Input
            id={`${id}-email`}
            type="email"
            spellCheck={false}
            autoComplete="email"
            placeholder="tu-correo@ejemplo.com"
            invalid={!!errors.email}
            aria-describedby={describedBy(`${id}-email`, errors.email?.message)}
            {...register('email')}
          />
        </Field>

        <Field id={`${id}-password`} label="Contraseña" error={errors.password?.message} hint={PASSWORD_HINT}>
          <PasswordInput
            id={`${id}-password`}
            autoComplete="new-password"
            invalid={!!errors.password}
            aria-describedby={describedBy(`${id}-password`, errors.password?.message, PASSWORD_HINT)}
            {...register('password')}
          />
        </Field>

        <Field id={`${id}-confirm`} label="Repite la contraseña" error={errors.confirmPassword?.message}>
          <PasswordInput
            id={`${id}-confirm`}
            autoComplete="new-password"
            invalid={!!errors.confirmPassword}
            aria-describedby={describedBy(`${id}-confirm`, errors.confirmPassword?.message)}
            {...register('confirmPassword')}
          />
        </Field>

        <Button type="submit" loading={registerUser.isPending} className="w-full">
          Crear cuenta
        </Button>
      </form>
    </AuthLayout>
  )
}
