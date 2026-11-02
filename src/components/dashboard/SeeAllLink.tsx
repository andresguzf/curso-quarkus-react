import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

type Props = {
  to: string
  label: string
}

export function SeeAllLink({ to, label }: Props) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg text-sm font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
    >
      Ver todos
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  )
}
