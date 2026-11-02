import { z } from 'zod'

// LocalDateTime de Java: ISO sin zona horaria, por ejemplo 2026-11-02T17:30:12.123456
export const dateTimeSchema = z.iso.datetime({ local: true })

export const sortDirs = ['asc', 'desc'] as const
export type SortDir = (typeof sortDirs)[number]

// Espejo de PageDto<T>: content trae solo la página pedida; page empieza en 0
export function pageSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    content: z.array(itemSchema),
    page: z.number().int(),
    size: z.number().int(),
    totalElements: z.number().int(),
    totalPages: z.number().int(),
  })
}

export type Page<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

// Campos comunes de los formularios, con los mismos límites y mensajes que la API
export const emailField = z
  .string()
  .trim()
  .min(1, 'El email es obligatorio')
  .max(150, 'El email no puede tener más de 150 caracteres')
  .pipe(z.email('El email no tiene un formato válido'))

export const passwordField = z
  .string()
  .min(8, 'La contraseña debe tener entre 8 y 72 caracteres')
  .max(72, 'La contraseña debe tener entre 8 y 72 caracteres')
