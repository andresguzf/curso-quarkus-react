import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

type Props = ComponentProps<'input'> & {
  invalid?: boolean
}

export const inputClasses =
  'block h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800'

// En React 19 ref llega como prop: register() de React Hook Form funciona sin forwardRef
export function Input({ invalid = false, className, ...props }: Props) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        inputClasses,
        invalid
          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30 dark:border-rose-500'
          : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/30 dark:border-slate-700',
        className,
      )}
      {...props}
    />
  )
}
