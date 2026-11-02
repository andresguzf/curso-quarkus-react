import type { z } from 'zod'
import { ApiError } from '@/api/ApiError'
import { errorSchema } from '@/schemas/error.schema'
import { readCookie } from '@/utils/cookies'
import { toQueryString, type QueryParams } from '@/utils/query'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const CSRF_COOKIE = 'csrf-token'
const CSRF_HEADER = 'X-CSRF-TOKEN'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

type RequestOptions = {
  method?: Method
  body?: unknown
  query?: QueryParams
}

// Hace la petición y valida la respuesta con el esquema: un JSON inesperado es un error, no un dato
export async function request<T>(path: string, schema: z.ZodType<T>, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)
  return schema.parse(await response.json())
}

// Para respuestas sin cuerpo (204), como DELETE o logout
export async function requestNoContent(path: string, options: RequestOptions = {}): Promise<void> {
  await send(path, options)
}

async function send(path: string, { method = 'GET', body, query }: RequestOptions): Promise<Response> {
  const headers = new Headers({ Accept: 'application/json' })
  if (body !== undefined) headers.set('Content-Type', 'application/json')
  // La API exige el token CSRF en todo POST, PUT y DELETE, incluidos login y registro
  if (method !== 'GET') headers.set(CSRF_HEADER, await csrfToken())

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}${toQueryString(query)}`, {
      method,
      headers,
      // La sesión viaja en la cookie HttpOnly access_token: el navegador la envía sola
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')
  }

  if (!response.ok) throw await toApiError(response)
  return response
}

// Double submit: el token es la cookie csrf-token; si aún no existe, la API la entrega en /auth/csrf
async function csrfToken(): Promise<string> {
  const current = readCookie(CSRF_COOKIE)
  if (current) return current

  await fetch(`${BASE_URL}/auth/csrf`, { credentials: 'include' })
  const token = readCookie(CSRF_COOKIE)
  if (!token) throw new ApiError(0, 'No pudimos preparar la petición. Recarga la página e inténtalo de nuevo.')
  return token
}

async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null)
  const parsed = errorSchema.safeParse(body)
  if (!parsed.success) {
    return new ApiError(response.status, 'Ocurrió un error inesperado. Inténtalo de nuevo.')
  }
  return new ApiError(parsed.data.status, parsed.data.message, parsed.data.errors)
}
