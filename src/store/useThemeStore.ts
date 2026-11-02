import { z } from 'zod'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const themeSchema = z.enum(['light', 'dark'])
export type Theme = z.infer<typeof themeSchema>

// Mismo nombre que lee el script de index.html, que aplica el tema antes del primer pintado
const STORAGE_KEY = 'theme-preference'

// Color de la barra del navegador en móvil: el fondo de la página en cada tema
const THEME_COLORS: Record<Theme, string> = { light: '#f5f5f7', dark: '#020617' }

type ThemeState = {
  theme: Theme
  toggleTheme: () => void
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Sincroniza el DOM (sistema externo a React): la clase dark activa las variantes dark: de Tailwind
function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
}

// Sin elección guardada se usa el tema del sistema; al cambiarlo con el switch, se recuerda
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: systemTheme(),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      // Un valor guardado inválido se ignora y queda el del sistema
      merge: (persisted, current) => {
        const parsed = z.object({ theme: themeSchema }).safeParse(persisted)
        return parsed.success ? { ...current, theme: parsed.data.theme } : current
      },
    },
  ),
)

applyTheme(useThemeStore.getState().theme)
useThemeStore.subscribe((state) => applyTheme(state.theme))
