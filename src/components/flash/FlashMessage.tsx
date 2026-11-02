import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import type { FlashMessage as Message, FlashType } from '@/store/useFlashStore'
import { cn } from '@/utils/cn'

type Props = {
  message: Message
  onDismiss: (id: string) => void
}

const styles: Record<FlashType, { box: string; bar: string; Icon: typeof Info }> = {
  success: {
    box: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
    bar: 'bg-emerald-500',
    Icon: CheckCircle2,
  },
  error: {
    box: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100',
    bar: 'bg-rose-500',
    Icon: XCircle,
  },
  info: {
    box: 'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-100',
    bar: 'bg-brand-500',
    Icon: Info,
  },
}

// Dura 5 s: el tiempo lo lleva la animación de la barra (sin setTimeout ni effects) y se pausa
// mientras el mouse o el foco están sobre el mensaje. La X lo cierra antes
export function FlashMessage({ message, onDismiss }: Props) {
  const { box, bar, Icon } = styles[message.type]

  return (
    <div
      role={message.type === 'error' ? 'alert' : 'status'}
      className={cn(
        'group pointer-events-auto relative overflow-hidden rounded-xl border shadow-lg',
        'transition-[opacity,translate] duration-200 starting:-translate-y-2 starting:opacity-0',
        box,
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p className="flex-1 text-sm font-medium">{message.text}</p>
        <button
          type="button"
          onClick={() => onDismiss(message.id)}
          aria-label="Cerrar"
          className="-mt-0.5 -mr-1.5 grid size-7 shrink-0 place-items-center rounded-lg opacity-70 transition-[opacity,background-color] hover:bg-black/5 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
      <span
        aria-hidden="true"
        onAnimationEnd={() => onDismiss(message.id)}
        className={cn(
          'absolute inset-x-0 bottom-0 h-1 origin-left animate-flash-timer opacity-60',
          'group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]',
          bar,
        )}
      />
    </div>
  )
}
