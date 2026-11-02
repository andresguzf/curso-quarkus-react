// Une clases de Tailwind omitiendo las vacías: cn('px-2', active && 'bg-brand-600')
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
