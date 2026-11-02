// Tamaños de página que ofrece la UI (la API acepta de 1 a 100)
export const PAGE_SIZES = [10, 20, 50] as const

export type PageItem = number | 'gap'

// Páginas a mostrar (base 0): la primera, la última y las vecinas de la actual, con 'gap' entre saltos.
// Ejemplo con 10 páginas en la 5: [0, 'gap', 4, 5, 6, 'gap', 9]
export function pageWindow(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index)

  const pages = [...new Set([0, current - 1, current, current + 1, total - 1])]
    .filter((page) => page >= 0 && page < total)
    .sort((a, b) => a - b)

  return pages.flatMap((page, index): PageItem[] =>
    index > 0 && page - pages[index - 1] > 1 ? ['gap', page] : [page],
  )
}

// Rango visible para "Mostrando 11–20 de 57"
export function visibleRange(page: number, size: number, totalElements: number): { from: number; to: number } {
  if (totalElements === 0) return { from: 0, to: 0 }
  return { from: page * size + 1, to: Math.min((page + 1) * size, totalElements) }
}
