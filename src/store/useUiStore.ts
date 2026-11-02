import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type UiState = {
  // Escritorio: sidebar de filtros colapsado en un riel; se recuerda entre visitas
  filtersCollapsed: boolean
  // Móvil: panel de filtros abierto como drawer; no se recuerda
  mobileFiltersOpen: boolean
  toggleFilters: () => void
  openMobileFilters: () => void
  closeMobileFilters: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      filtersCollapsed: false,
      mobileFiltersOpen: false,
      toggleFilters: () => set((state) => ({ filtersCollapsed: !state.filtersCollapsed })),
      openMobileFilters: () => set({ mobileFiltersOpen: true }),
      closeMobileFilters: () => set({ mobileFiltersOpen: false }),
    }),
    {
      name: 'ui-preferences',
      // Si localStorage no está disponible (modo privado, bloqueado), la app sigue sin recordar nada
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ filtersCollapsed: state.filtersCollapsed }),
    },
  ),
)
