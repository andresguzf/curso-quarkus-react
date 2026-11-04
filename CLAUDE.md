# CLAUDE.md

Frontend en React con TypeScript para la API REST de clientes de `../3-quarkus-api` (curso de Quarkus).

## Estado actual

Se construye por pasos según el wizard de `docs/plan-frontend.md` (marca cada paso al cerrarlo).
Los 9 pasos están hechos: API paginada, scaffold, capa de datos, autenticación y rutas, layout y
UI, mensajes flash, CRUD de clientes, administración de usuarios y revisión final (Web Interface
Guidelines y checklist de `react-rules`). En desarrollo, `/ui-kit` (`UiKitPage`, ruta lazy que no entra al build) muestra todos los componentes.

```
vite.config.ts      plugins react + tailwindcss, alias @/ → src/, proxy /api → API_PROXY_TARGET (por defecto localhost:8080)
src/index.css       @import 'tailwindcss' + @theme (fuente Inter, colores brand-* = indigo) + tema claro estilo Apple
.oxlintrc.json      linter oxlint (plantilla de Vite) con rules-of-hooks y exhaustive-deps
.env.example        VITE_API_URL=/api y API_PROXY_TARGET comentado (.env está en .gitignore)
vercel.json         rewrites: /api/* → https://curso-quarkus-api.onrender.com/api/* y SPA → /index.html
.claude/launch.json servidor de desarrollo para el navegador integrado (npm run dev, puerto 5173)
.claude/skills/react-rules/SKILL.md            skill propia del proyecto
.claude/skills/web-design-guidelines           symlink a .agents/skills/web-design-guidelines
.agents/skills/web-design-guidelines/SKILL.md  skill de Vercel, registrada en skills-lock.json
```

## Stack

React 19.3.1 o superior · TypeScript `strict` · Vite · Zustand · TanStack React Query · Zod ·
React Hook Form + `@hookform/resolvers`. Antes de instalar, consulta la versión vigente con `npm view`.

## Estructura prevista

```
src/
├── main.tsx       createRoot + QueryClientProvider
├── App.tsx        rutas y composición de páginas
├── api/           funciones fetch por recurso (authApi, customerApi, userApi)
├── schemas/       esquemas Zod + tipos con z.infer (espejo de los DTO de la API)
├── store/         stores de Zustand (sesión, UI); nunca datos del servidor
├── hooks/         custom hooks (useAuth, useCustomers, useUsers)
├── components/    componentes pequeños, una responsabilidad
├── pages/         páginas
└── utils/         funciones puras
```

## Backend: `../3-quarkus-api`

Quarkus en `http://localhost:8080` (`./mvnw quarkus:dev`). Sus reglas están en `../3-quarkus-api/CLAUDE.md`.

| Recurso | Endpoints | Acceso |
|---|---|---|
| `/api/auth` | `GET /csrf`, `POST /register`, `POST /login`, `POST /logout`, `GET /me` | público (`/me` responde 204 sin sesión) |
| `/api/customers` | `GET`, `GET /{id}`, `GET /email/{email}`, `GET /search`, `POST`, `PUT /{id}`, `DELETE /{id}` | `user` lee; `admin` CRUD |
| `/api/users` | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` | solo `admin` |

Cómo integrarse:

- **Sesión:** el JWT viaja en la cookie `access_token` (`HttpOnly`, `SameSite=Strict`). El frontend no
  lo lee ni lo guarda; usa `credentials: 'include'` y consulta `GET /api/auth/me` para saber quién
  está logueado y su rol.
- **CSRF:** pedir `GET /api/auth/csrf` y enviar el valor de la cookie `csrf-token` en el header
  `X-CSRF-TOKEN` en todo POST/PUT/DELETE, incluidos login y registro.
- **Errores:** la API siempre responde un `ErrorDto` JSON; valídalo con Zod y muestra su mensaje.
- **Mismo origen:** la API no tiene CORS configurado. En desarrollo usa el `server.proxy` de Vite
  para `/api` → `http://localhost:8080`, así las cookies `SameSite=Strict` funcionan sin tocar el backend.
  `API_PROXY_TARGET=https://curso-quarkus-api.onrender.com` en `.env` prueba el dev server contra Render
  (`changeOrigin: true`; cookies `Secure`: Chrome sí, Safari no). En producción (Vercel) hace lo mismo `vercel.json` hacia Render; `VITE_API_URL` sigue en `/api`.
  Nunca pongas la URL de Render en `VITE_API_URL`: sitio distinto = sin cookie de sesión ni CSRF.
- Las rutas y pantallas se adaptan al rol (`user` / `admin`), pero la autorización real la hace la API.

## Capa de datos

- `src/api/http.ts`: único punto de salida a la API. `request(path, schema, options)` valida la
  respuesta con Zod (`parse`); `requestOptional` devuelve `null` en un 204 (`/auth/me` sin sesión); `requestNoContent` para 204. Agrega `credentials: 'include'` y, en
  POST/PUT/DELETE, el header `X-CSRF-TOKEN` con la cookie `csrf-token` (si falta, la pide a
  `/auth/csrf`). Todo error sale como `ApiError` (`status`, `message`, `fieldErrors`); status `0`
  es un fallo de red.
- `src/api/{authApi,customerApi,userApi}.ts`: una función por endpoint; nunca llamar `fetch`
  directo desde componentes o hooks.
- `src/schemas/`: respuestas (`customerSchema`, `userSchema`, `pageSchema(...)`, `errorSchema`)
  y formularios (`customerFormSchema`, `userCreateSchema`, `userUpdateSchema`, `loginSchema`,
  `registerSchema`) con los mismos límites y mensajes que la API. Los tipos salen con `z.infer`.
- `src/utils/`: `toQueryString` (omite vacíos) y `readCookie`.

## Autenticación y rutas

- `src/router.tsx` (React Router 8, `createBrowserRouter`): `/login` y `/register` bajo `GuestOnly`;
  `/` (redirige a `/dashboard`), `/dashboard`, `/customers` y `/users` bajo `RequireAuth` + `AppLayout`; `/users` además bajo
  `RequireRole role="admin"`; `*` es `NotFoundPage`.
- `src/hooks/useAuth.ts`: `useMe()` (query `['auth','me']`, `null` sin sesión), `useCurrentUser()`
  (solo dentro de `RequireAuth`), `useLogin`, `useRegister` (registra e inicia sesión) y `useLogout`.
- Tras login o registro no se navega a mano: `GuestOnly` ve el usuario en cache y redirige a
  `location.state.from` (validado con `redirectTarget`) o a `/dashboard`.
- `src/queryClient.ts`: un 401 en cualquier query o mutation (salvo `meta.ignoreUnauthorized`, que usa
  el login) marca la sesión como expirada en `useSessionStore` y deja `me` en `null`; el login lo avisa.
  Solo se reintentan fallos de red y 5xx.
- Logout: primero `me = null`, después borrar el resto de la cache. Con `queryClient.clear()` las
  páginas protegidas se renderizan sin usuario y `useCurrentUser` lanza.
- Títulos de página con `<title>` dentro del componente (React 19).
- Formularios: `Field` + control con `aria-describedby={describedBy(...)}` y errores de la API con
  `applyApiErrors(error, setError, campos)`.

## Layout y componentes UI

- `AppLayout` = `AppHeader` (logo, `MainNav` según `navItemsFor(role)`, `UserMenu` con email, rol y
  cerrar sesión; en móvil un menú hamburguesa) + `FlashArea` + `<Outlet />`.
- Páginas de listado: `PageHeader` (título, descripción, acciones) + `ListLayout` con
  `sidebar={<FilterSidebar activeCount onClear>…campos…</FilterSidebar>}`. En escritorio el sidebar
  mide `w-72` y se colapsa a un riel `w-12` (se recuerda en `useUiStore`, persistido en localStorage);
  en móvil es un drawer que abre `FilterToggleButton`. Los filtros se montan una sola vez.
- `src/components/ui/`: `Button` (primary, secondary, danger, ghost; `loading`), `Input`,
  `PasswordInput`, `Select`, `Field`, `Alert`, `Badge`, `Spinner`, `EmptyState`, `BrandMark`,
  `Table`/`THead`/`TBody`/`Tr`/`Th`/`Td`/`SortableTh`/`SkeletonRows`, `Pagination` (page base 0,
  tamaños `PAGE_SIZES`), `Modal` y `ConfirmDialog`.
- `Modal` usa `<dialog>` nativo: solo se monta abierto y el ref callback llama a `showModal()` (foco
  atrapado, Esc, fondo inerte). Foco inicial con `data-autofocus`, no `autoFocus` (corre antes de
  `showModal` y se pierde). `dismissible={false}` mientras hay una operación en curso.
- `ConfirmDialog` reemplaza a `window.confirm`; el foco arranca en Cancelar.
- Menús y paneles flotantes se cierran con `useDismiss(open, onDismiss)` (clic fuera y Esc).
- Mensajes flash: `flash.success|error|info(texto)` (de `store/useFlashStore`), pensado para los
  `onSuccess`/`onError` de las mutations. `FlashArea` los apila bajo la topbar (sticky, alto 0: no
  empuja el contenido); como máximo 4. Duran 5 s: el tiempo lo lleva la animación CSS
  `animate-flash-timer` de la barra (`onAnimationEnd` cierra), que se pausa con hover o foco; la X
  cierra antes. Errores con `role="alert"`, el resto `role="status"`. El logout los borra.
- `utils/format.ts`: `roleLabels`, `formatDate`, `formatDateTime`. `utils/pagination.ts`: `pageWindow`,
  `visibleRange`, `PAGE_SIZES`.

## Listados: patrón de clientes (reutilizar en usuarios)

- Estado del listado en la URL con `useListSearch(schema, filterKeys)`: `search` se deriva de
  `useSearchParams` con un esquema Zod con `.catch()` (un valor inválido vuelve al de por defecto) y
  la URL solo guarda lo que difiere del valor por defecto. `setFilters` vuelve a la página 0 y usa
  `replace` (no llena el historial); página, tamaño y orden sí crean entradas (Atrás funciona).
- Datos con `useCustomers(search)` (`placeholderData: keepPreviousData`; la tabla anterior se ve
  atenuada mientras llega la nueva). Mutations en `hooks/useCustomers.ts`: invalidan
  `queryKeys.customers.all` y lanzan el flash; el error de borrar va a un flash, los de crear y
  editar al formulario.
- Filtros: `TextFilter` (debounce de 300 ms con `useDebouncedCallback`, llamado desde el onChange; el
  input sigue a la URL cuando cambia por fuera con el patrón "ajustar estado al cambiar una prop") y
  `DateRangeFilter` (inmediato, `min`/`max` evitan rangos invertidos).
- Página contenedora (`CustomersPage`) + componentes de presentación (`CustomerFilters`,
  `CustomerTable`, `CustomerForm`) + contenedor del modal (`CustomerFormModal`, montado con
  `key={id ?? 'new'}`). El formulario recibe `onSubmit` que devuelve una promesa; si falla, aplica
  los errores con `applyApiErrors(..., conflictField)` (un 409 de email se muestra en el campo).
- Borrar: `ConfirmDialog` y, si era el último de la página, vuelve a la anterior.
- Rol `user`: misma tabla y filtros, sin "Nuevo" ni acciones por fila.
- La búsqueda de la API distingue acentos: "mon" no encuentra "Mónica".

## Usuarios (solo admin)

- Mismo patrón que clientes (`useListSearch(userSearchSchema, userFilterKeys)`, `useUsers`,
  `UserFilters`, `UserTable`, `UserForm`, `UserFormModal`) más `UserDetailModal` (Ver).
- Roles fijos `user` y `admin` (no se crean roles); el admin cambia el rol al editar.
- Reglas del backend repetidas en la UI con `userRules(target, currentUser, adminCount)`
  (`utils/userRules.ts`): no eliminarse a sí mismo; el único admin no se elimina ni cambia de rol.
  `adminCount` sale de `useAdminCount()` (`GET /api/users?role=admin&size=1` → `totalElements`).
  Si igual llega un 409, su mensaje se muestra (flash o formulario).
- Rol bloqueado: el formulario muestra el rol fijo y lo envía en un `<input type="hidden">`
  (un `<select disabled>` llega como `undefined` a React Hook Form).
- Quitarse el propio rol admin pide una confirmación extra; al guardar se actualiza `me` y
  `RequireRole` saca al usuario de `/users`.
- Editar sin contraseña: `updateUser` omite `password` cuando está vacío. La API rechaza `""` (su
  `@Size(min = 8)` solo deja pasar `null`).

## Resumen (dashboard)

- `DashboardPage` (`/dashboard`, inicio tras el login) compone `CustomerSummary` y, solo para admin,
  `UserSummary` (la API responde 403 a `GET /api/users` para el rol `user`).
- No hay endpoint de estadísticas: `hooks/useDashboard.ts` saca cada número del `totalElements` de
  una página de 1 con el filtro que toca (`createdFrom`/`createdTo`, `role`). Las claves van bajo
  `['customers']`/`['users']`, así que las mutations también refrescan el resumen. Son 8 peticiones
  de clientes (6 por los meses) y 3 de usuarios; si crece, conviene un endpoint `/api/stats`.
- La fecha de referencia se fija al montar (`useState(() => new Date())`) y `utils/dates.ts` arma los
  rangos (`daysAgo`, `lastMonths`) en `YYYY-MM-DD` local.
- Componentes en `components/dashboard/`: `StatTile`, `DashboardCard`, `MonthlyBarChart` (una serie,
  rótulo solo en el máximo y el mes actual, tooltip al pasar el mouse, tabla `sr-only`),
  `RoleBreakdown` (barra apilada con hueco de 2px, leyenda con números y estado del último admin),
  `RecentList` y `SeeAllLink`.
- Colores de gráficos: tokens `chart-1`/`chart-2` en `index.css`, distintos por tema y validados
  con el script de la skill `dataviz`. No reutilices los colores de estado (rose/amber/emerald) para series.

## Tema claro y oscuro

- Switch `ThemeToggle` (`role="switch"`) en la topbar (`AppHeader`) y en las páginas públicas (`AuthLayout`).
- `useThemeStore` (Zustand, persistido en `theme-preference`): sin elección guardada usa el tema del
  sistema. Aplica la clase `dark` en `<html>` y el `theme-color`; el script inline de `index.html`
  hace lo mismo antes del primer pintado (sin parpadeo). Si cambias la clave, cámbiala en los dos.
- `@custom-variant dark` en `index.css`: las variantes `dark:` dependen de la clase, no de
  `prefers-color-scheme`.
- **Tema oscuro:** el original (slate + indigo, Inter). **Tema claro:** look de Apple. `:root:not(.dark)`
  redefine las variables de la paleta: `slate-*` como grises de Apple (`#f5f5f7`, `#1d1d1f`…),
  `brand-*` como azul `#0071e3` y `rose`/`emerald`/`amber` con los colores de estado de Apple. También
  usa la fuente del sistema (SF Pro), radios algo mayores y botones píldora (`rounded-button`).
  Los componentes siguen usando `slate-*`/`brand-*` y sus variantes `dark:`; no hay que tocarlos.

## Accesibilidad y guías de interfaz (revisión del Paso 9)

- Enlace "Saltar al contenido" (`#contenido` en el `<main>`), títulos h1 → h2 sin saltos.
- Inputs con `name`, `autocomplete` y `spellCheck={false}` en emails; los errores de la API llevan
  el foco al primer campo con error.
- Animar solo `transform` y `opacity` (nunca `transition: all` ni el ancho); con movimiento reducido
  se anulan las transiciones (la barra de los flash sigue, es su temporizador).
- `tabular-nums` en fechas y contadores; `theme-color` según el tema (lo cambia `useThemeStore`);
  `touch-action: manipulation` y `scroll-padding-top` (topbar sticky) en `index.css`.
- Textos `sr-only` dentro de tablas: el contenedor de `Table` es `relative`, o ensanchan la página.

## Comandos

`npm run dev` (puerto 5173), `npm run build` (incluye `tsc -b`), `npm run lint` (oxlint) y
`npx tsc -b` para solo tipar. Node.js `^20.19.0 || >=22.12.0` (requisito de Vite).

Convenciones de código: TypeScript `strict`, imports con `@/`, comillas simples y sin punto y coma
(estilo de la plantilla de Vite).

## Available skills

| Skill | Ubicación | Propósito |
|---|---|---|
| `react-rules` | `.claude/skills/react-rules/SKILL.md` | Genera y mantiene la app React + TypeScript (React >= 19.3.1, Vite) con Zustand, Zod, React Hook Form y React Query, siguiendo las reglas de componentes, estado y `useEffect` del proyecto. |
| `web-design-guidelines` | `.claude/skills/web-design-guidelines` → `.agents/skills/web-design-guidelines/SKILL.md` | Revisa el código de UI según las Web Interface Guidelines de Vercel (accesibilidad, UX, diseño) y reporta hallazgos en formato `archivo:línea`. |

## Skill trigger rules

- **`react-rules`**: úsala siempre que se pida:
  - Crear una aplicación, proyecto o frontend React.
  - Crear, agregar o modificar componentes, páginas o custom hooks.
  - Agregar o cambiar estado local o global (stores de Zustand).
  - Crear o modificar formularios y validaciones (React Hook Form + Zod).
  - Consumir una API o cambiar cómo se obtienen datos (React Query / SWR).
  - Refactorizar o corregir lógica de UI en React (effects, eventos, renders).

  Aplica aunque el pedido no mencione la skill por nombre.

- **`web-design-guidelines`**: úsala siempre que se pida:
  - Revisar o auditar la UI, el diseño o la UX ("revisa mi UI", "audita el diseño").
  - Revisar la accesibilidad (a11y): etiquetas, foco, teclado, contraste, ARIA.
  - Comprobar que la app o un componente cumple buenas prácticas de interfaz web.
  - Validar componentes o páginas recién creados o modificados con `react-rules`, cuando se pida una revisión de calidad visual o de accesibilidad.

  Si no se indican archivos o un patrón, pregunta cuáles revisar.
