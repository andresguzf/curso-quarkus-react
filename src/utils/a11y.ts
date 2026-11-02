// Id del mensaje visible de un Field, para enlazarlo al control con aria-describedby
export function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}
