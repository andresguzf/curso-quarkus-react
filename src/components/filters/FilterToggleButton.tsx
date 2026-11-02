import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUiStore } from '@/store/useUiStore'

type Props = {
  activeCount: number
}

// Solo en móvil: abre el drawer de filtros
export function FilterToggleButton({ activeCount }: Props) {
  const openMobile = useUiStore((state) => state.openMobileFilters)
  return (
    <Button variant="secondary" onClick={openMobile} className="lg:hidden">
      <SlidersHorizontal aria-hidden="true" className="size-4" />
      Filtros
      {activeCount > 0 && (
        <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeCount}</span>
      )}
    </Button>
  )
}
