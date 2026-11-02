import { useSearchParams } from 'react-router'
import type { z } from 'zod'
import type { SortDir } from '@/schemas/common.schema'

type BaseSearch = { page: number; size: number; sort: string; dir: SortDir }

// Estado de un listado guardado en la URL: se puede compartir, recargar y volver con Atrás.
// Los valores se derivan de la URL en cada render; no se copian a useState
export function useListSearch<S extends BaseSearch, F extends keyof S & string>(
  schema: z.ZodType<S>,
  filterKeys: readonly F[],
) {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = schema.parse(Object.fromEntries(searchParams))
  const defaults = schema.parse({})
  const activeCount = filterKeys.filter((key) => search[key] !== defaults[key]).length

  // Escribe solo lo que difiere del valor por defecto, para que la URL quede corta
  function write(next: S, replace: boolean) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(next)) {
      if (value !== defaults[key as keyof S] && value !== '') params.set(key, String(value))
    }
    setSearchParams(params, { replace })
  }

  return {
    search,
    activeCount,
    // Cambiar un filtro vuelve a la primera página; replace evita llenar el historial al escribir
    setFilters: (filters: Partial<Pick<S, F>>) => write({ ...search, ...filters, page: 0 }, true),
    setPage: (page: number) => write({ ...search, page }, false),
    setSize: (size: number) => write({ ...search, size, page: 0 }, false),
    setSort: (sort: S['sort'], dir: SortDir) => write({ ...search, sort, dir, page: 0 }, false),
    clearFilters: () => write({ ...defaults, sort: search.sort, dir: search.dir, size: search.size }, false),
  }
}
