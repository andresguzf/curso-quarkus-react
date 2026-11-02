import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function FullPageMessage({ children }: Props) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center text-slate-600 dark:text-slate-300">
      {children}
    </main>
  )
}
