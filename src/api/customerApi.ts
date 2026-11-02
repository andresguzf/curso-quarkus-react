import { request, requestNoContent } from '@/api/http'
import {
  customerPageSchema,
  customerSchema,
  type Customer,
  type CustomerFormValues,
  type CustomerQuery,
} from '@/schemas/customer.schema'
import type { Page } from '@/schemas/common.schema'

export function fetchCustomers(query: CustomerQuery = {}): Promise<Page<Customer>> {
  return request('/customers', customerPageSchema, { query })
}

export function fetchCustomer(id: number): Promise<Customer> {
  return request(`/customers/${id}`, customerSchema)
}

export function createCustomer(values: CustomerFormValues): Promise<Customer> {
  return request('/customers', customerSchema, { method: 'POST', body: values })
}

export function updateCustomer(id: number, values: CustomerFormValues): Promise<Customer> {
  return request(`/customers/${id}`, customerSchema, { method: 'PUT', body: values })
}

export function deleteCustomer(id: number): Promise<void> {
  return requestNoContent(`/customers/${id}`, { method: 'DELETE' })
}
