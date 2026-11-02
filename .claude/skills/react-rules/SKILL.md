---
name: react-rules
description: Genera y mantiene proyectos React con TypeScript (React 19.3.1 o superior, Vite) siguiendo buenas prácticas - Zustand para estado global, Zod para validación, React Hook Form + Zod en formularios, React Query (o SWR) para datos de API, custom hooks y uso correcto de useEffect. Usa esta skill siempre que el usuario pida crear una aplicación, proyecto o frontend React, o agregar o modificar componentes, páginas, hooks, stores, estado global, formularios, validaciones, llamadas a una API o lógica de UI en React, aunque no mencione la skill por nombre (por ejemplo "crea el frontend para la API", "agrega un formulario de login", "haz un listado de productos que consuma el backend", "refactoriza este componente").
---

# React Rules

Skill para crear y evolucionar aplicaciones React con TypeScript que sean fáciles de leer, tipadas de punta a punta y predecibles. Las reglas no son caprichos: cada una evita una clase concreta de bugs (renders de más, estado desincronizado, datos sin validar). Cuando una regla parezca no encajar en un caso, entiende su motivo y aplica el espíritu, no la letra.

## 1. Versiones y stack

Antes de crear o actualizar un proyecto, consulta la versión vigente con `npm view <paquete> version` y usa la última estable. Mínimos:

| Paquete | Uso | Mínimo |
|---|---|---|
| `react`, `react-dom` | UI | **19.3.1** |
| `typescript` | Tipado (`strict: true`) | última estable |
| `vite` + `@vitejs/plugin-react` | Build y dev server | última estable |
| `zustand` | Estado global del cliente | 5.x |
| `zod` | Validación con esquemas | 4.x |
| `react-hook-form` + `@hookform/resolvers` | Formularios | últimas estables |
| `@tanstack/react-query` | Datos de API con cache (alternativa: `swr`) | 5.x |

Nunca uses JavaScript (`.js`/`.jsx`) para código de la app: todo es `.ts`/`.tsx`. TypeScript detecta en compilación errores de props, de respuestas de API y de estado que en JS solo aparecerían en producción.

## 2. Crear un proyecto nuevo

```bash
npm create vite@latest <nombre-app> -- --template react-ts
cd <nombre-app>
npm install react@latest react-dom@latest
npm install zustand zod react-hook-form @hookform/resolvers @tanstack/react-query
npm install -D @types/react@latest @types/react-dom@latest
```

Verifica en `package.json` que `react` y `react-dom` quedaron en `>= 19.3.1` y que `tsconfig` tiene `"strict": true`. Si el directorio actual ya es la carpeta del proyecto y está vacío, usa `.` como nombre.

### Estructura de carpetas

```
src/
├── main.tsx              # createRoot + QueryClientProvider
├── App.tsx               # composición de rutas/páginas
├── api/                  # cliente HTTP y funciones fetch por recurso (productApi.ts)
├── schemas/              # esquemas Zod + tipos inferidos (product.schema.ts)
├── store/                # stores de Zustand (useCartStore.ts)
├── hooks/                # custom hooks (useProducts.ts, useAuth.ts)
├── components/           # componentes pequeños y reutilizables
│   └── ProductCard/
│       └── ProductCard.tsx
├── pages/                # componentes de página que componen otros
└── utils/                # funciones puras compartidas
```

Organiza por tipo como arriba en apps pequeñas; si la app crece, agrupa por feature (`features/products/{api,components,hooks,schemas}`) manteniendo las mismas capas dentro.

La URL base de la API va en una variable de entorno (`VITE_API_URL` en `.env`, con un `.env.example` versionado), nunca escrita en el código.

## 3. Reglas de componentes

- **Componentes pequeños con una sola responsabilidad.** Si un componente obtiene datos, filtra, maneja un formulario y pinta una tabla, divídelo. Señal de alerta: más de ~150 líneas o más de un motivo para cambiar. Separa "contenedor" (obtiene datos vía hooks) de "presentación" (recibe props y pinta).
- **Props tipadas** con `type Props = {...}`; no uses `any`. Exporta los tipos que otros componentes necesiten.
- **Comunicación hijo → padre con callbacks por props** (`onChange`, `onSelect`, `onSubmit`). El hijo los llama en el event handler donde ocurre el cambio, no en un effect que observa su propio estado.
- **Componentes y hooks puros:** el render solo calcula JSX a partir de props, estado y contexto. Nada de llamadas a API, `localStorage`, mutar variables externas o `Math.random()` para keys durante el render. React puede renderizar varias veces (StrictMode, concurrent rendering) y un side effect en el render se ejecutaría otras tantas.
- **Reglas de los hooks:** llámalos siempre en el nivel superior del componente o de otro hook, nunca dentro de `if`, bucles, callbacks o funciones anidadas. React identifica cada hook por su orden de llamada; si el orden cambia entre renders, el estado se cruza.

## 4. Estado

- **Nunca mutes el estado.** Crea copias nuevas: `setItems([...items, nuevo])`, `setUser({ ...user, name })`, `items.map(...)`, `items.filter(...)`. React compara por referencia; si mutas, no detecta el cambio y no re-renderiza (o lo hace con datos inconsistentes). Evita `push`, `splice`, `sort` in-place y asignaciones directas sobre estado.
- **Estado local primero** (`useState`/`useReducer`); sube el estado al ancestro común solo cuando dos componentes lo comparten.
- **Zustand para estado global del cliente** (carrito, sesión, preferencias de UI). No lo uses para cachear datos del servidor: eso es trabajo de React Query.
- **Estado derivado se calcula, no se guarda.** Si un valor se obtiene de props o de otro estado (total, lista filtrada, nombre completo), calcúlalo en el render. Guardarlo en estado duplica la fuente de verdad y obliga a sincronizarlo.
- **Para reiniciar estado usa `key`:** `<ProfileForm key={userId} userId={userId} />` monta un componente nuevo cuando cambia el usuario. Si solo hay que ajustar parte del estado, derívalo de las props o actualízalo en el event handler que provoca el cambio.

### Store de Zustand

Un store por dominio, creado con `create()`, con estado y acciones juntos. Las acciones devuelven objetos nuevos:

```ts
// src/store/useCartStore.ts
import { create } from 'zustand';
import type { Product } from '../schemas/product.schema';

type CartItem = { product: Product; quantity: number };

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const exists = state.items.some((i) => i.product.id === product.id);
      return {
        items: exists
          ? state.items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
            )
          : [...state.items, { product, quantity: 1 }],
      };
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
  clear: () => set({ items: [] }),
}));
```

En los componentes usa selectores para suscribirte solo a lo que necesitas y evitar renders de más: `const items = useCartStore((s) => s.items);`.

## 5. Validación con Zod

Define esquemas en `src/schemas/` y deriva los tipos con `z.infer` para no escribir el tipo dos veces:

```ts
// src/schemas/product.schema.ts
import { z } from 'zod';

export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  price: z.number().nonnegative(),
});

export const productListSchema = z.array(productSchema);
export type Product = z.infer<typeof productSchema>;

// Para formularios, el esquema de entrada no lleva id
export const productFormSchema = productSchema.omit({ id: true });
export type ProductFormValues = z.infer<typeof productFormSchema>;
```

- Usa `parse` cuando un dato inválido es un error que debe propagarse (respuestas de API: React Query lo convierte en estado `error`).
- Usa `safeParse` cuando quieres decidir qué hacer con el error sin `try/catch` (datos de `localStorage`, query params, entrada externa opcional).

Valida en los bordes: lo que llega de la API, del storage o del usuario. Dentro de la app confía en los tipos.

## 6. Formularios: React Hook Form + Zod

```tsx
// src/components/ProductForm/ProductForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormValues } from '../../schemas/product.schema';

type Props = {
  defaultValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues) => void;
};

export function ProductForm({ defaultValues, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>
        Nombre
        <input {...register('name')} />
      </label>
      {errors.name && <p role="alert">{errors.name.message}</p>}

      <label>
        Precio
        <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
      </label>
      {errors.price && <p role="alert">{errors.price.message}</p>}

      <button type="submit" disabled={isSubmitting}>Guardar</button>
    </form>
  );
}
```

El formulario no sabe a dónde se envían los datos: recibe `onSubmit` por props y el padre decide (normalmente una mutation de React Query). Así el componente es reutilizable para crear y editar.

## 7. Datos de API: React Query (o SWR)

Usa React Query cuando un componente obtiene datos de una API, y en especial cuando esos datos se comparten o reutilizan entre componentes: aporta cache, deduplicación, estados de carga/error y refetch automático sin escribir un solo `useEffect`. Si el proyecto ya usa SWR, sigue con SWR; no mezcles ambos.

```ts
// src/api/productApi.ts
import { productListSchema, productSchema, type Product, type ProductFormValues } from '../schemas/product.schema';

const BASE_URL = import.meta.env.VITE_API_URL;

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error(`Error ${res.status} al obtener productos`);
  return productListSchema.parse(await res.json());
}

export async function createProduct(values: ProductFormValues): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error(`Error ${res.status} al crear producto`);
  return productSchema.parse(await res.json());
}
```

```ts
// src/hooks/useProducts.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, fetchProducts } from '../api/productApi';

export const productKeys = { all: ['products'] as const };

export function useProducts() {
  return useQuery({ queryKey: productKeys.all, queryFn: fetchProducts });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  });
}
```

Registra el `QueryClientProvider` una sola vez en `main.tsx`, con el `QueryClient` creado fuera del componente.

## 8. useEffect: solo para sincronizar con sistemas externos

`useEffect` sirve para mantener React sincronizado con algo que está **fuera** de React: una suscripción, un WebSocket, una API del navegador (`document.title`, `IntersectionObserver`, eventos de `window`), una librería no-React (mapas, gráficos). Si no hay un sistema externo, probablemente no necesitas un effect.

| Situación | No hagas | Haz |
|---|---|---|
| Valor derivado de props/estado | `useEffect(() => setTotal(...), [items])` | `const total = items.reduce(...)` en el render |
| Cálculo costoso | effect + estado | `useMemo(() => ..., [deps])` |
| Reacción a un clic o submit | effect que observa un flag | lógica dentro del event handler |
| Avisar al padre de un cambio | effect que llama `onChange` | llamar `onChange` en el handler que cambió el valor |
| Reiniciar estado al cambiar una prop | effect que hace `setState` | `key` en el componente |
| Obtener datos de una API | `useEffect` + `fetch` + `useState` | React Query / SWR |

Cuando sí uses un effect:

- Mantenlo simple: una sola sincronización por effect. Si sincroniza dos cosas independientes, sepáralo en dos.
- Declara todas las dependencias que usa; no silencies `react-hooks/exhaustive-deps`. Si una dependencia cambia demasiado, mueve el objeto/función dentro del effect o fuera del componente.
- Devuelve siempre la función de limpieza cuando suscribes, conectas o agregas listeners.

```ts
useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
}, []);
```

Si necesitas compartir lógica entre varios eventos (por ejemplo, mostrar una notificación tras comprar desde dos botones distintos), extráela a una función y llámala desde cada handler, no a un effect que reaccione a un cambio de estado.

## 9. Custom hooks y rendimiento

- **Extrae lógica reutilizable a custom hooks** (`useAuth`, `useProducts`, `useDebounce`, `useWindowWidth`) en `src/hooks/`. Su nombre empieza por `use`, son puros y devuelven datos y funciones, no JSX. El componente queda como "qué se muestra" y el hook como "de dónde sale y cómo cambia".
- **`useMemo` para cálculos costosos** (filtrar/ordenar listas grandes, transformaciones pesadas) cuyas dependencias no cambian en cada render. No envuelvas cálculos triviales: la memoización también cuesta y añade ruido.
- `useCallback` solo cuando pasas una función a un hijo memoizado (`memo`) o es dependencia de un effect.

## 10. Checklist antes de terminar

Repasa el código que generaste o modificaste:

1. `react`/`react-dom` >= 19.3.1 y todo el código en `.ts`/`.tsx` con `strict`.
2. Ningún `any`, ni mutación de estado (`push`, `splice`, asignación directa).
3. Ningún `useEffect` que derive estado, responda a eventos del usuario o haga fetch manual.
4. Ningún hook llamado de forma condicional o dentro de bucles/callbacks.
5. Datos externos validados con Zod; formularios con React Hook Form + `zodResolver`.
6. Componentes cortos, con una responsabilidad y comunicación al padre por callbacks.
7. Ejecuta `npx tsc --noEmit` (o `npm run build`) y `npm run lint` si existe, y corrige los errores antes de dar el trabajo por terminado.
