import { z } from 'zod'
import { dateTimeSchema, emailField, pageSchema, passwordField, sortDirs, type SortDir } from '@/schemas/common.schema'
import { PAGE_SIZES } from '@/utils/pagination'

export const roles = ['user', 'admin'] as const
export const roleSchema = z.enum(roles, 'El rol debe ser user o admin')
export type Role = z.infer<typeof roleSchema>

// Respuesta de la API (UserDto): el password nunca viene
export const userSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  role: roleSchema,
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema.nullable(),
})

export const userPageSchema = pageSchema(userSchema)

export type User = z.infer<typeof userSchema>

// Alta por un admin: el password es obligatorio
export const userCreateSchema = z.object({
  email: emailField,
  password: passwordField,
  role: roleSchema,
})

export type UserCreateValues = z.infer<typeof userCreateSchema>

// Edición: password vacío conserva el actual
export const userUpdateSchema = z.object({
  email: emailField,
  password: z.union([z.literal(''), passwordField]),
  role: roleSchema,
})

export type UserUpdateValues = z.infer<typeof userUpdateSchema>

// Mismos campos al crear y al editar; cambia solo la regla del password
export type UserFormValues = UserUpdateValues

// Query params de GET /api/users; los vacíos no se envían
export const userSortFields = ['email', 'role', 'createdAt'] as const
export type UserSortField = (typeof userSortFields)[number]

export type UserQuery = {
  page?: number
  size?: number
  sort?: UserSortField
  dir?: SortDir
  email?: string
  role?: Role | ''
  createdFrom?: string
  createdTo?: string
}

// Estado del listado en la URL; un valor inválido vuelve a su valor por defecto
export const userSearchSchema = z.object({
  page: z.coerce.number().int().min(0).catch(0),
  size: z.coerce
    .number()
    .refine((size) => PAGE_SIZES.some((option) => option === size))
    .catch(PAGE_SIZES[0]),
  sort: z.enum(userSortFields).catch('createdAt'),
  dir: z.enum(sortDirs).catch('desc'),
  email: z.string().catch(''),
  role: z.union([roleSchema, z.literal('')]).catch(''),
  createdFrom: z.iso.date().catch(''),
  createdTo: z.iso.date().catch(''),
})

export type UserSearch = z.infer<typeof userSearchSchema>
export type UserFilterValues = Pick<UserSearch, 'email' | 'role' | 'createdFrom' | 'createdTo'>
export const userFilterKeys = ['email', 'role', 'createdFrom', 'createdTo'] as const
