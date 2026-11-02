# CLAUDE.md

Frontend en React con TypeScript para la API REST de clientes de `../3-quarkus-api` (curso de Quarkus).

## Estado actual

La app todavía no está generada: el repositorio solo tiene las skills, `skills-lock.json`, este
archivo y `README.md`. El primer paso es crearla con la skill `react-rules`.

```
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
| `/api/auth` | `GET /csrf`, `POST /register`, `POST /login`, `POST /logout`, `GET /me` | público / autenticado (`/me`, `/logout`) |
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
- Las rutas y pantallas se adaptan al rol (`user` / `admin`), pero la autorización real la hace la API.

## Comandos

Disponibles una vez generada la app: `npm run dev`, `npm run build`, `npm run lint` y
`npx tsc --noEmit`. Node.js `^20.19.0 || >=22.12.0` (requisito de Vite).

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
