import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/api/ApiError'
import { createCustomer, deleteCustomer, fetchCustomers, updateCustomer } from '@/api/customerApi'
import { queryKeys } from '@/api/queryKeys'
import type { Customer, CustomerFormValues, CustomerQuery } from '@/schemas/customer.schema'
import { flash } from '@/store/useFlashStore'

const fullName = (customer: Customer) => `${customer.name} ${customer.lastName}`

// keepPreviousData: al cambiar de página o filtro la tabla muestra los datos anteriores hasta tener
// los nuevos, en vez de parpadear con un loader
export function useCustomers(query: CustomerQuery) {
  return useQuery({
    queryKey: queryKeys.customers.list(query),
    queryFn: () => fetchCustomers(query),
    placeholderData: keepPreviousData,
  })
}

// Los errores de crear y editar los muestra el formulario; el éxito, un flash
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (customer) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      flash.success(`Cliente ${fullName(customer)} creado`)
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: CustomerFormValues }) => updateCustomer(id, values),
    onSuccess: (customer) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      flash.success(`Cliente ${fullName(customer)} actualizado`)
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (customer: Customer) => deleteCustomer(customer.id),
    onSuccess: (_, customer) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      flash.success(`Cliente ${fullName(customer)} eliminado`)
    },
    onError: (error) => flash.error(errorMessage(error)),
  })
}
