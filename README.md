# React App: frontend de la API Quarkus

Frontend en **React con TypeScript** para la API REST de clientes hecha con Quarkus
([`3-quarkus-api`](../3-quarkus-api)). Forma parte del curso de Quarkus y se construye con ayuda de
Claude Code usando skills del proyecto.

> **Estado:** en preparación. Por ahora el repositorio solo tiene la configuración de las skills;
> la aplicación todavía no se ha generado.

## Qué va a hacer la app

- Login, registro y logout contra `/api/auth`, con sesión JWT en cookie `HttpOnly` y protección CSRF.
- Listado, búsqueda, alta, edición y borrado de clientes (`/api/customers`).
- Administración de usuarios (`/api/users`), solo para el rol `admin`.
- Vistas según el rol: `user` solo consulta clientes; `admin` hace el CRUD completo.

## Stack previsto

| Herramienta | Uso |
|---|---|
| React 19.3.1 o superior + TypeScript (`strict`) | UI tipada de punta a punta |
| Vite | Dev server y build |
| Zustand | Estado global del cliente (sesión, preferencias de UI) |
| TanStack React Query | Datos de la API con cache, estados de carga y refetch |
| Zod | Validación de respuestas de la API y de formularios |
| React Hook Form + `@hookform/resolvers` | Formularios validados con Zod |

## Estructura

Estructura actual:

```
4-react-app/
├── .claude/skills/
│   ├── react-rules/SKILL.md          # skill propia: reglas para crear y mantener la app
│   └── web-design-guidelines -> ../../.agents/skills/web-design-guidelines
├── .agents/skills/web-design-guidelines/SKILL.md   # skill de Vercel (revisión de UI)
├── skills-lock.json                  # origen y hash de las skills instaladas
├── CLAUDE.md                         # instrucciones del proyecto para Claude Code
└── README.md
```

Cuando se genere la app, el código irá en `src/` con esta organización:

```
src/
├── main.tsx       # createRoot + QueryClientProvider
├── App.tsx        # rutas y composición de páginas
├── api/           # funciones fetch por recurso
├── schemas/       # esquemas Zod y tipos inferidos
├── store/         # stores de Zustand
├── hooks/         # custom hooks (useAuth, useCustomers, ...)
├── components/    # componentes pequeños y reutilizables
├── pages/         # páginas
└── utils/         # funciones puras
```

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
- La API Quarkus en ejecución (`./mvnw quarkus:dev` en `3-quarkus-api`, puerto `8080`).

## Comandos

Disponibles cuando la app esté generada:

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
