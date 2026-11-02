import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type Props = {
  title: string
  description?: string
  // Acción en la cabecera, por ejemplo un enlace "Ver todos"
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function DashboardCard({ title, description, action, className, children }: Props) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
