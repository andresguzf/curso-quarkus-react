import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { isApiError } from '@/api/ApiError'

// Lleva los errores de la API al formulario: los de campo bajo cada input y el resto como error general.
// conflictField: campo donde mostrar un 409 (por ejemplo, el email ya registrado)
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  conflictField?: Path<T>,
): void {
  if (!isApiError(error)) {
    setError('root.server', { message: 'Ocurrió un error inesperado. Inténtalo de nuevo.' })
    return
  }
  if (error.status === 409 && conflictField) {
    setError(conflictField, { message: error.message }, { shouldFocus: true })
    return
  }
  const withMessage = fields.filter((field) => error.fieldErrors[field]?.length)
  // El foco va al primer campo con error, como hace React Hook Form con los errores de Zod
  withMessage.forEach((field, index) => {
    setError(field, { message: error.fieldErrors[field][0] }, { shouldFocus: index === 0 })
  })
  if (withMessage.length === 0) setError('root.server', { message: error.message })
}
