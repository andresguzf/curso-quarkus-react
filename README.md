# React App: frontend de la API Quarkus

Frontend en **React con TypeScript** para la API REST de clientes hecha con Quarkus
([`3-quarkus-api`](../3-quarkus-api)). Forma parte del curso de Quarkus y se construye con ayuda de
Claude Code usando skills del proyecto.

Se construyó paso a paso con el wizard de [docs/plan-frontend.md](docs/plan-frontend.md).

## Funcionalidades

- **Sesión:** login, registro (deja la sesión iniciada) y logout contra `/api/auth`. El JWT viaja en
  una cookie `HttpOnly` y cada POST, PUT y DELETE lleva el token CSRF. Si la sesión vence, la app lo
  avisa en el login y vuelve a la página donde estabas.
- **Resumen** (`/dashboard`, página de inicio): totales, altas de los últimos 7 días y del mes (con la
  variación frente al anterior), gráfico de altas por mes y últimos clientes. Para `admin` suma
  usuarios: total, administradores, distribución por rol con su estado y últimos usuarios.
- **Clientes** (`/customers`): listado paginado y ordenable, búsqueda por nombre, apellido y email,
  filtro por fecha de alta, y alta, edición y borrado (solo `admin`). El rol `user` solo consulta.
- **Usuarios** (`/users`, solo `admin`): listado, filtros por email, rol y fecha, detalle, alta,
  edición (incluido el cambio de rol entre `user` y `admin`) y borrado. La UI repite las reglas de
  la API: nadie se elimina a sí mismo y el único admin no se elimina ni cambia de rol.
- **Filtros** en un sidebar a la izquierda que se colapsa en un riel para ver la tabla completa (en
  móvil, un panel lateral). Página, orden y filtros viven en la URL: se pueden compartir y recargar.
- **Mensajes flash** al crear, editar o eliminar: aparecen bajo la barra superior, duran 5 s, se
  pausan con el mouse encima y se cierran con la X.
- **Confirmación de borrado** en una ventana modal propia (no `window.confirm`).
- Diseño con Tailwind, switch de tema claro (estilo Apple) y oscuro, adaptado a móvil y accesible con teclado y lector de
  pantalla.

## Stack

| Herramienta | Uso |
|---|---|
| React 19.3.1 o superior + TypeScript (`strict`) | UI tipada de punta a punta |
| Vite | Dev server y build |
| Zustand | Estado global del cliente (sesión, preferencias de UI) |
| TanStack React Query | Datos de la API con cache, estados de carga y refetch |
| Zod | Validación de respuestas de la API y de formularios |
| React Hook Form + `@hookform/resolvers` | Formularios validados con Zod |
| React Router 8 | Rutas y rutas protegidas por sesión y rol |
| Tailwind CSS 4 + `lucide-react` | Estilos e íconos |

## Estructura

```
4-react-app/
├── .claude/
│   ├── launch.json                   # servidor de desarrollo para el navegador integrado
│   └── skills/
│       ├── react-rules/SKILL.md      # skill propia: reglas para crear y mantener la app
│       └── web-design-guidelines -> ../../.agents/skills/web-design-guidelines
├── .agents/skills/web-design-guidelines/SKILL.md   # skill de Vercel (revisión de UI)
├── docs/plan-frontend.md             # plan wizard con el avance por pasos
├── public/                           # archivos estáticos (favicon)
├── src/
│   ├── main.tsx                      # punto de entrada: QueryClient + router
│   ├── router.tsx                    # rutas públicas, protegidas y solo admin
│   ├── queryClient.ts                # React Query y manejo de sesión vencida (401)
│   ├── index.css                     # Tailwind, tokens de marca (@theme) y paleta del tema claro
│   ├── api/                          # cliente HTTP con CSRF y funciones por recurso
│   ├── schemas/                      # esquemas Zod (respuestas, formularios, URL)
│   ├── store/                        # Zustand: sesión, flash y preferencias de UI
│   ├── hooks/                        # useAuth, useCustomers, useUsers, useListSearch…
│   ├── components/                   # ui/, layout/, filters/, flash/, auth/, customers/, users/
│   ├── layouts/                      # AppLayout y AuthLayout
│   ├── pages/                        # login, registro, clientes, usuarios, 404 y UI kit (dev)
│   └── utils/                        # funciones puras (formato, paginación, reglas de usuarios)
├── .env.example                      # VITE_API_URL=/api
├── .oxlintrc.json                    # reglas del linter (oxlint)
├── vite.config.ts                    # React, Tailwind, alias @/ y proxy /api → API_PROXY_TARGET (:8080)
├── tsconfig*.json                    # TypeScript strict
├── skills-lock.json                  # origen y hash de las skills instaladas
├── CLAUDE.md                         # instrucciones del proyecto para Claude Code
└── README.md
```

En desarrollo, `/ui-kit` muestra todos los componentes base (no entra en el build de producción).

## Skills de Claude Code

| Skill | Para qué sirve |
|---|---|
| `react-rules` | Genera el proyecto y crea o modifica componentes, hooks, stores, formularios y llamadas a la API siguiendo las reglas del proyecto (estado inmutable, `useEffect` solo para sistemas externos, custom hooks, componentes con una sola responsabilidad). |
| `web-design-guidelines` | Revisa el código de UI con las [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) de Vercel: accesibilidad, UX y diseño. |

Ejemplos de pedidos:

```text
Crea el frontend React que consuma la API de clientes
Agrega el formulario de login
Revisa la accesibilidad de src/components
```

## Requisitos

- Node.js 20.19 o superior (o 22.12 o superior), que exige Vite.
- La API Quarkus en ejecución (`./mvnw quarkus:dev` en `3-quarkus-api`, puerto `8080`), o la de
  Render con `API_PROXY_TARGET` (ver más abajo).

## Comandos

Primera vez: copia `.env.example` a `.env`. Con la API y `npm run dev` corriendo, abre
`http://localhost:5173`.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run lint
```

### Probar el frontend local contra la API en Render

El proxy de Vite lee `API_PROXY_TARGET` del `.env` (sin prefijo `VITE_`, así no llega al navegador):

```bash
API_PROXY_TARGET=https://curso-quarkus-api.onrender.com   # vacío o sin definir: http://localhost:8080
```

Reinicia `npm run dev` después de cambiarlo. Render manda las cookies con `Secure`: Chrome y Firefox
las aceptan en `http://localhost`, Safari no (usa Chrome para esta prueba).

## Desplegar en Vercel

El backend está en Render (`https://curso-quarkus-api.onrender.com`). El frontend **no** lo llama
directo: `vercel.json` reenvía `/api/*` a Render, igual que el proxy de Vite en desarrollo.

```json
{ "source": "/api/:path*", "destination": "https://curso-quarkus-api.onrender.com/api/:path*" }
```

- Para el navegador todo es el mismo origen (`tu-app.vercel.app`): la cookie de sesión
  (`SameSite=Strict`) y el token CSRF funcionan sin CORS ni cambios en la API.
- `VITE_API_URL` se queda en `/api` (también en Vercel). Si apuntara a la URL de Render, el
  navegador no enviaría la cookie de sesión ni podría leer la de CSRF.
- La segunda regla (`/(.*)` → `/index.html`) hace que recargar una ruta de React Router
  (`/customers`, `/users`…) no dé 404.

En Vercel: importa el repositorio; detecta Vite solo (build `npm run build`, salida `dist`). En
**Environment Variables** agrega `VITE_API_URL=/api` (el `.env` no se sube a git).

En el plan gratuito de Render la API se duerme tras un rato sin uso: la primera petición puede
tardar cerca de un minuto.
