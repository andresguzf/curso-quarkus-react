import { request, requestNoContent } from '@/api/http'
import type { Page } from '@/schemas/common.schema'
import {
  userPageSchema,
  userSchema,
  type User,
  type UserCreateValues,
  type UserQuery,
  type UserUpdateValues,
} from '@/schemas/user.schema'

export function fetchUsers(query: UserQuery = {}): Promise<Page<User>> {
  return request('/users', userPageSchema, { query })
}

export function fetchUser(id: number): Promise<User> {
  return request(`/users/${id}`, userSchema)
}

export function createUser(values: UserCreateValues): Promise<User> {
  return request('/users', userSchema, { method: 'POST', body: values })
}

// Sin password la API conserva el actual. Hay que omitirlo: un "" no pasa su validación de 8 a 72 caracteres
export function updateUser(id: number, { password, ...values }: UserUpdateValues): Promise<User> {
  return request(`/users/${id}`, userSchema, { method: 'PUT', body: password ? { ...values, password } : values })
}

// La API responde 409 si el admin intenta eliminarse a sí mismo o al único admin
export function deleteUser(id: number): Promise<void> {
  return requestNoContent(`/users/${id}`, { method: 'DELETE' })
}
