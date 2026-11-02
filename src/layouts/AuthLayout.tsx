import type { ReactNode } from 'react'
import { BrandMark } from '@/components/ui/BrandMark'

type Props = {
  title: string
  description: string
  footer: ReactNode
  children: ReactNode
}

// Marco de las páginas públicas: tarjeta centrada con la marca arriba y un enlace alternativo abajo
export function AuthLayout({ title, description, footer, children }: Props) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-brand-50 to-slate-50 px-4 py-12 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark className="size-12 [&_svg]:size-6" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</p>
      </div>
    </main>
  )
}
