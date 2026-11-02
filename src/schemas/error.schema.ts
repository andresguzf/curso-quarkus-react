import { z } from 'zod'

// Espejo de ErrorDto: la API responde así en todo error. errors solo llega en validaciones (400)
export const errorSchema = z.object({
  status: z.number().int(),
  error: z.string(),
  message: z.string(),
  path: z.string().optional(),
  timestamp: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
})

export type ErrorResponse = z.infer<typeof errorSchema>
