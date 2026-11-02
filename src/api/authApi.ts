import { request, requestNoContent, requestOptional } from '@/api/http'
import type { LoginValues, RegisterValues } from '@/schemas/auth.schema'
import { userSchema, type User } from '@/schemas/user.schema'

// Usuario de la sesión, o null si no hay sesión (la API responde 204, no un error)
export function fetchMe(): Promise<User | null> {
  return requestOptional('/auth/me', userSchema)
}

// Deja el JWT en la cookie HttpOnly y devuelve el usuario
export function login(values: LoginValues): Promise<User> {
  return request('/auth/login', userSchema, { method: 'POST', body: values })
}

// El registro público siempre crea el rol user; confirmPassword no viaja
export function register({ email, password }: RegisterValues): Promise<User> {
  return request('/auth/register', userSchema, { method: 'POST', body: { email, password } })
}

export function logout(): Promise<void> {
  return requestNoContent('/auth/logout', { method: 'POST' })
}
