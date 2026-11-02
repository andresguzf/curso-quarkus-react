import type { ComponentProps } from 'react'
import { ChevronDown } from 'lucide-react'
import { inputClasses } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

type Props = ComponentProps<'select'> & {
  invalid?: boolean
}

export function Select({ invalid = false, className, children, ...props }: Props) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          inputClasses,
          'appearance-none pr-9',
          invalid
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30'
            : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/30 dark:border-slate-700',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}
