// Error de la API con el status HTTP y, en validaciones, los mensajes de cada campo
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string[]>

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// Mensaje para mostrar al usuario a partir de cualquier error
export function errorMessage(error: unknown): string {
  return isApiError(error) ? error.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}
