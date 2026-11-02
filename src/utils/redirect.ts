import { z } from 'zod'

const fromStateSchema = z.object({ from: z.string().startsWith('/') })

// Ruta a la que volver tras iniciar sesión; location.state viene del navegador, así que se valida
export function redirectTarget(state: unknown, fallback = '/customers'): string {
  const parsed = fromStateSchema.safeParse(state)
  return parsed.success ? parsed.data.from : fallback
}
