import type { ReactNode } from 'react'
import { formatDate } from '@/utils/format'

export type RecentItem = {
  id: number
  primary: string
  secondary?: string
  createdAt: string
  badge?: ReactNode
}

type Props = {
  // undefined mientras carga
  items: RecentItem[] | undefined
  emptyText: string
}

export function RecentList({ items, emptyText }: Props) {
  if (!items) {
    return (
      <ul aria-hidden="true" className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} className="h-9 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none dark:bg-slate-800" />
        ))}
      </ul>
    )
  }

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>
  }

  return (
    <ul className="-my-2 divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 py-2.5">
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {item.primary.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.primary}</p>
            {item.secondary && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.secondary}</p>}
          </div>
          {item.badge}
          <time dateTime={item.createdAt} className="shrink-0 text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {formatDate(item.createdAt)}
          </time>
        </li>
      ))}
    </ul>
  )
}
