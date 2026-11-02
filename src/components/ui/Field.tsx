import type { ReactNode } from 'react'

type Props = {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

// Etiqueta, control y mensaje. El control debe usar el mismo id y aria-describedby={describedBy(...)} de utils/a11y
export function Field({ id, label, error, hint, children }: Props) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

