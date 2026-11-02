import { Users } from 'lucide-react'
import { cn } from '@/utils/cn'

type Props = {
  className?: string
}

export function BrandMark({ className }: Props) {
  return (
    <span className={cn('grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm', className)}>
      <Users aria-hidden="true" className="size-5" />
    </span>
  )
}
