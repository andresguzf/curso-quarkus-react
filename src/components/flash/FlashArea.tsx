import { FlashMessage } from '@/components/flash/FlashMessage'
import { useFlashStore } from '@/store/useFlashStore'

// Pila de mensajes justo bajo la topbar. Es sticky y de alto 0: se mantiene visible al hacer scroll
// y se superpone al contenido sin empujarlo (ni moverlo al desaparecer)
export function FlashArea() {
  const messages = useFlashStore((state) => state.messages)
  const dismiss = useFlashStore((state) => state.dismiss)

  return (
    <div className="pointer-events-none sticky top-16 z-20 h-0">
      <div aria-live="polite" aria-label="Notificaciones" className="mx-auto flex max-w-7xl flex-col items-end gap-2 px-4 pt-3">
        {messages.map((message) => (
          <div key={message.id} className="w-full sm:w-96">
            <FlashMessage message={message} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </div>
  )
}
