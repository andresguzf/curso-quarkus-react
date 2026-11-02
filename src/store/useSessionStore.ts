import { create } from 'zustand'

// Marca que la sesión se cerró sola (JWT vencido) para avisarlo en el login
type SessionState = {
  expired: boolean
  markExpired: () => void
  clearExpired: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  expired: false,
  markExpired: () => set({ expired: true }),
  clearExpired: () => set({ expired: false }),
}))
