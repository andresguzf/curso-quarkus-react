import { cn } from '@/utils/cn'

type Props = {
  className?: string
}

export function Spinner({ className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent', className)}
    />
  )
}
