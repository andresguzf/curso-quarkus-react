import { z } from 'zod'
import { dateTimeSchema, emailField, pageSchema, sortDirs, type SortDir } from '@/schemas/common.schema'
import { PAGE_SIZES } from '@/utils/pagination'

// Respuesta de la API (CustomerDto)
export const customerSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  lastName: z.string(),
  email: z.string(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema.nullable(),
})

export const customerPageSchema = pageSchema(customerSchema)

export type Customer = z.infer<typeof customerSchema>

// Formulario de alta y edición: sin id ni fechas, con las validaciones del DTO
export const customerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(80, 'El nombre no puede tener más de 80 caracteres'),
  lastName: z
    .string()
    .trim()
    .min(1, 'El apellido es obligatorio')
    .max(80, 'El apellido no puede tener más de 80 caracteres'),
  email: emailField,
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

// Query params de GET /api/customers; los vacíos no se envían
export const customerSortFields = ['name', 'lastName', 'email', 'createdAt'] as const
export type CustomerSortField = (typeof customerSortFields)[number]

export type CustomerQuery = {
  page?: number
  size?: number
  sort?: CustomerSortField
  dir?: SortDir
  name?: string
  lastName?: string
  email?: string
  createdFrom?: string
  createdTo?: string
}

// Estado del listado en la URL (?page=1&name=ana…). La URL la escribe cualquiera: un valor inválido
// vuelve a su valor por defecto en vez de romper la página
export const customerSearchSchema = z.object({
  page: z.coerce.number().int().min(0).catch(0),
  size: z.coerce
    .number()
    .refine((size) => PAGE_SIZES.some((option) => option === size))
    .catch(PAGE_SIZES[0]),
  sort: z.enum(customerSortFields).catch('createdAt'),
  dir: z.enum(sortDirs).catch('desc'),
  name: z.string().catch(''),
  lastName: z.string().catch(''),
  email: z.string().catch(''),
  createdFrom: z.iso.date().catch(''),
  createdTo: z.iso.date().catch(''),
})

export type CustomerSearch = z.infer<typeof customerSearchSchema>
export type CustomerFilterValues = Pick<CustomerSearch, 'name' | 'lastName' | 'email' | 'createdFrom' | 'createdTo'>
export const customerFilterKeys = ['name', 'lastName', 'email', 'createdFrom', 'createdTo'] as const
