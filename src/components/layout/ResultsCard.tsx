import type { ReactNode } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

type Props = {
  busy: boolean
  // Error al cargar: reemplaza el contenido por el mensaje y un botón para reintentar
  error: Error | null
  onRetry: () => void
  children: ReactNode
}

// Tarjeta que envuelve el resultado de un listado (tabla, vacío o error)
export function ResultsCard({ busy, error, onRetry, children }: Props) {
  return (
    <div
      aria-busy={busy}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {error ? (
        <div className="space-y-4 p-6">
          <Alert tone="error">{error.message}</Alert>
          <Button variant="secondary" onClick={onRetry} loading={busy}>
            Reintentar
          </Button>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
