import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'

// Devuelve una versión de callback que espera `delay` ms sin nuevas llamadas antes de ejecutarse.
// Se llama desde un event handler (por ejemplo onChange), no desde un effect
export function useDebouncedCallback<A extends unknown[]>(callback: (...args: A) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const latest = useRef(callback)

  // Siempre la última versión del callback, sin reiniciar el temporizador
  useLayoutEffect(() => {
    latest.current = callback
  })

  // El temporizador es externo a React: se cancela al desmontar
  useEffect(() => () => clearTimeout(timer.current), [])

  return useCallback(
    (...args: A) => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => latest.current(...args), delay)
    },
    [delay],
  )
}
