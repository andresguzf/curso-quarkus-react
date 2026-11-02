export type QueryParams = Record<string, string | number | undefined | null>

// Convierte un objeto en query string omitiendo los valores vacíos: "?page=0&name=ana" o ""
export function toQueryString(params: QueryParams = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}
