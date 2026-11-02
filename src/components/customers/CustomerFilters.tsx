import { DateRangeFilter } from '@/components/filters/DateRangeFilter'
import { TextFilter } from '@/components/filters/TextFilter'
import type { CustomerFilterValues } from '@/schemas/customer.schema'

type Props = {
  values: CustomerFilterValues
  onChange: (filters: Partial<CustomerFilterValues>) => void
}

export function CustomerFilters({ values, onChange }: Props) {
  return (
    <>
      <TextFilter name="name" label="Nombre" placeholder="Ej. Ana" value={values.name} onChange={(name) => onChange({ name })} />
      <TextFilter
        name="lastName"
        label="Apellido"
        placeholder="Ej. Pérez"
        value={values.lastName}
        onChange={(lastName) => onChange({ lastName })}
      />
      <TextFilter
        name="email"
        label="Email"
        placeholder="Ej. ejemplo.com"
        value={values.email}
        onChange={(email) => onChange({ email })}
      />
      <DateRangeFilter label="Fecha de alta" from={values.createdFrom} to={values.createdTo} onChange={onChange} />
    </>
  )
}
