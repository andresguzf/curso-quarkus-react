import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

type Tone = 'error' | 'warning' | 'success' | 'info'

type Props = {
  tone?: Tone
  children: ReactNode
}

const tones: Record<Tone, { classes: string; Icon: typeof Info }> = {
  error: { classes: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200', Icon: XCircle },
  warning: { classes: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200', Icon: AlertTriangle },
  success: { classes: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-200', Icon: CheckCircle2 },
  info: { classes: 'border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-900/60 dark:bg-brand-950/50 dark:text-brand-200', Icon: Info },
}

// Aviso dentro de la página (no flash): errores de formulario, sesión expirada, etc.
export function Alert({ tone = 'info', children }: Props) {
  const { classes, Icon } = tones[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm', classes)}>
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
