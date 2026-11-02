import { create } from 'zustand'

export type FlashType = 'success' | 'error' | 'info'

export type FlashMessage = {
  id: string
  type: FlashType
  text: string
}

// Más mensajes que estos tapan el contenido: se descartan los más antiguos
const MAX_MESSAGES = 4

type FlashState = {
  messages: FlashMessage[]
  push: (type: FlashType, text: string) => void
  dismiss: (id: string) => void
  clear: () => void
}

export const useFlashStore = create<FlashState>()((set) => ({
  messages: [],
  push: (type, text) =>
    set((state) => ({
      messages: [...state.messages, { id: crypto.randomUUID(), type, text }].slice(-MAX_MESSAGES),
    })),
  dismiss: (id) => set((state) => ({ messages: state.messages.filter((message) => message.id !== id) })),
  clear: () => set({ messages: [] }),
}))

// Atajo para usar fuera de componentes, por ejemplo en onSuccess y onError de una mutation:
// flash.success('Cliente creado')
export const flash = {
  success: (text: string) => useFlashStore.getState().push('success', text),
  error: (text: string) => useFlashStore.getState().push('error', text),
  info: (text: string) => useFlashStore.getState().push('info', text),
}
