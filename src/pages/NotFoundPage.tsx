import { Link } from 'react-router'
import { FullPageMessage } from '@/components/auth/FullPageMessage'

export function NotFoundPage() {
  return (
    <FullPageMessage>
      <title>Página no encontrada · Gestión de clientes</title>
      <p className="text-5xl font-bold text-brand-600">404</p>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">No encontramos esta página</h1>
      <Link to="/" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        Volver al inicio
      </Link>
    </FullPageMessage>
  )
}
