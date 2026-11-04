import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/useThemeStore'
import { cn } from '@/utils/cn'

type Props = {
  className?: string
}

// Switch entre el tema claro y el oscuro: la perilla muestra el tema activo
export function ThemeToggle({ className }: Props) {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const dark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Tema oscuro"
      title={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      onClick={toggleTheme}
      className={cn(
        'inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-slate-200 bg-slate-100 transition-colors hover:bg-slate-200/70',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-6 place-items-center rounded-full bg-white shadow-sm transition-transform dark:bg-slate-950',
          dark ? 'translate-x-7' : 'translate-x-1',
        )}
      >
        {dark ? <Moon className="size-3.5 text-brand-300" /> : <Sun className="size-3.5 text-amber-500" />}
      </span>
    </button>
  )
}
