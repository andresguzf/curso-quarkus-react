import { useId, useState } from 'react'
import { Search } from 'lucide-react'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'

type Props = {
  name: string
  label: string
  placeholder?: string
  // Valor del filtro en la URL
  value: string
  onChange: (value: string) => void
}

// Filtra mientras se escribe, pero avisa al padre 300 ms después de la última tecla:
// una petición por búsqueda, no una por letra
export function TextFilter({ name, label, placeholder, value, onChange }: Props) {
  const id = useId()
  const [text, setText] = useState(value)
  const [sent, setSent] = useState(value)
  const [prevValue, setPrevValue] = useState(value)

  // Ajustar el estado cuando cambia la prop (patrón de React, sin effect): si la URL cambió por
  // fuera (limpiar filtros, botón Atrás), el input la sigue; si es el eco de lo que se envió, no se
  // toca, así no se pisa lo que se siguió escribiendo mientras llegaba
  if (value !== prevValue) {
    setPrevValue(value)
    if (value !== sent) setText(value)
  }

  const debouncedChange = useDebouncedCallback((next: string) => {
    setSent(next)
    onChange(next)
  }, 300)

  return (
    <Field id={id} label={label}>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          name={name}
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={text}
          placeholder={placeholder}
          onChange={(event) => {
            setText(event.target.value)
            debouncedChange(event.target.value)
          }}
          className="pl-9"
        />
      </div>
    </Field>
  )
}
