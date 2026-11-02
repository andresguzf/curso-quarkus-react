import { useId, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

type Size = 'sm' | 'md' | 'lg'

type Props = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  // false mientras hay una operación en curso: Esc, el fondo y la X no cierran
  dismissible?: boolean
  size?: Size
  children: ReactNode
  footer?: ReactNode
}

const sizes: Record<Size, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

// Cerrado no se monta; al montarse, el ref callback abre el <dialog> nativo con showModal(), que
// atrapa el foco, bloquea el resto de la página y devuelve el foco al cerrarse.
// Para elegir el foco inicial usa data-autofocus (autoFocus de React corre antes de showModal y se pierde)
export function Modal(props: Props) {
  if (!props.open) return null
  return <ModalDialog {...props} />
}

function ModalDialog({ title, description, onClose, dismissible = true, size = 'md', children, footer }: Props) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <dialog
      ref={(node) => {
        if (!node || node.open) return
        node.showModal()
        node.querySelector<HTMLElement>('[data-autofocus]')?.focus()
      }}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Esc: React decide si se cierra, no el navegador
      onCancel={(event) => {
        event.preventDefault()
        if (dismissible) onClose()
      }}
      // Clic en el fondo (fuera del contenido)
      onClick={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose()
      }}
      className={cn(
        'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overscroll-contain rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl',
        'dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100',
        'backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm',
        'transition-[opacity,scale] duration-150 starting:scale-95 starting:opacity-0',
        sizes[size],
      )}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={!dismissible}
          aria-label="Cerrar"
          className="-mt-1 -mr-2 grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="flex flex-col-reverse gap-2 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-900/60">
          {footer}
        </div>
      )}
    </dialog>
  )
}
