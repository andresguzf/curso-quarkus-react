import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useLogin } from '@/hooks/useAuth'
import { AuthLayout } from '@/layouts/AuthLayout'
import { loginSchema, type LoginValues } from '@/schemas/auth.schema'
import { useSessionStore } from '@/store/useSessionStore'
import { describedBy } from '@/utils/a11y'
import { applyApiErrors } from '@/utils/formErrors'

// Al iniciar sesión, GuestOnly redirige solo a la ruta de origen: aquí no se navega
export function LoginPage() {
  const id = useId()
  const expired = useSessionStore((state) => state.expired)
  const login = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(values: LoginValues) {
    login.mutate(values, {
      onError: (error) => applyApiErrors(error, setError, ['email', 'password']),
    })
  }

  return (
    <AuthLayout
      title="Inicia sesión"
      description="Accede a la gestión de clientes"
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Regístrate
          </Link>
        </>
      }
    >
      <title>Iniciar sesión · Gestión de clientes</title>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {expired && <Alert tone="warning">Tu sesión expiró. Vuelve a iniciar sesión para continuar.</Alert>}
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

        <Field id={`${id}-password`} label="Contraseña" error={errors.password?.message}>
          <PasswordInput
            id={`${id}-password`}
            autoComplete="current-password"
            invalid={!!errors.password}
            aria-describedby={describedBy(`${id}-password`, errors.password?.message)}
            {...register('password')}
          />
        </Field>

        <Button type="submit" loading={login.isPending} className="w-full">
          Iniciar sesión
        </Button>
      </form>
    </AuthLayout>
  )
}
