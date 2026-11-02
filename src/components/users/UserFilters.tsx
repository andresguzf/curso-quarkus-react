import { useId } from 'react'
import { DateRangeFilter } from '@/components/filters/DateRangeFilter'
import { TextFilter } from '@/components/filters/TextFilter'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { roles, type UserFilterValues } from '@/schemas/user.schema'
import { roleLabels } from '@/utils/format'

type Props = {
  values: UserFilterValues
  onChange: (filters: Partial<UserFilterValues>) => void
}

export function UserFilters({ values, onChange }: Props) {
  const roleId = useId()

  return (
    <>
      <TextFilter name="email" label="Email" placeholder="Ej. ejemplo.com" value={values.email} onChange={(email) => onChange({ email })} />
      <Field id={roleId} label="Rol">
        <Select
          id={roleId}
          name="role"
          value={values.role}
          onChange={(event) => onChange({ role: event.target.value as UserFilterValues['role'] })}
        >
          <option value="">Todos</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </Select>
      </Field>
      <DateRangeFilter label="Fecha de alta" from={values.createdFrom} to={values.createdTo} onChange={onChange} />
    </>
  )
}
