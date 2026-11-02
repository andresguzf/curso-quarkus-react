# Plan wizard del frontend

Avance (marca cada paso al cerrarlo y verificarlo):

- [x] Paso 1: backend con paginación, filtros y fechas
- [x] Paso 2: scaffold del proyecto
- [x] Paso 3: capa de datos (cliente HTTP, esquemas, CSRF)
- [x] Paso 4: autenticación y rutas
- [x] Paso 5: layout y sistema de UI (Tailwind)
- [x] Paso 6: mensajes flash
- [x] Paso 7: clientes
- [x] Paso 8: usuarios (solo admin)
- [x] Paso 9: revisión y cierre


## Contexto

`4-react-app` está vacío: solo tiene las skills (`react-rules`, `web-design-guidelines`), `CLAUDE.md` y `README.md`.
Hay que construir el frontend de `../3-quarkus-api`, con una interfaz cuidada en Tailwind. Debe cubrir:

- login y registro;
- CRUD de clientes y administración de usuarios;
- mensajes flash de 5 s que se pueden cerrar;
- un modal propio para confirmar los borrados;
- paginación, búsqueda y filtros en un sidebar que se puede colapsar.

Lo que se revisó en el backend condiciona el plan:

- `GET /api/customers` y `GET /api/users` devuelven **la lista completa**: no hay paginación ni filtros.
- Los DTO (`CustomerDto`, `UserDto`) **no exponen `createdAt` ni `updatedAt`**, aunque las entities sí los tienen.
- Los roles son un enum fijo, `user` y `admin`. El usuario decidió **mantenerlos así**: no se crean roles nuevos, el admin solo cambia el rol de un usuario entre `user` y `admin`.
- Reglas que ya aplica el backend, con 409 y mensaje en español: un admin no puede eliminarse a sí mismo, no se puede eliminar al único admin y no se le puede quitar el rol `admin` al único admin (`UserServiceImpl`).
- La sesión va en un JWT dentro de la cookie `HttpOnly` `access_token` (`SameSite=Strict`). El CSRF usa la cookie `csrf-token` y el header `X-CSRF-TOKEN`, que se repite en cada POST, PUT y DELETE, incluidos login y registro. Los errores llegan siempre como `ErrorDto`, con `errors` por campo.

Decisión del usuario: **extender el backend** con paginación, orden y filtros, y exponer las fechas de auditoría.

Para hacerlo como wizard, cada paso termina en algo que funciona y se verifica, y el siguiente no empieza hasta cerrar el anterior. El primer paso de la implementación copia este plan a `4-react-app/docs/plan-frontend.md`, con una casilla por paso, para seguir el avance.

---

## Paso 1: backend con paginación, filtros y fechas (`3-quarkus-api`, skill `quarkus-best-practices`)

1. **DTO de página:** crear `models/dto/PageDto<T>`, un record con `content`, `page`, `size`, `totalElements` y `totalPages`.
2. **Fechas en los DTO:** agregar `createdAt` y `updatedAt` a `CustomerDto` y `UserDto` como `@JsonProperty(access = READ_ONLY)`. Los mappers las copian en `toDto` y no las tocan en `toEntity` ni en `updateEntity`.
3. **Clientes:** `GET /api/customers` acepta `page` (desde 0), `size` (por defecto 10, máximo 100), `sort` (`name|lastName|email|createdAt`), `dir` (`asc|desc`), `name`, `lastName`, `email` (contiene, sin distinguir mayúsculas), `createdFrom` y `createdTo` (`LocalDate`). Devuelve `PageDto<CustomerDto>`.
   - El filtro se arma en `CustomerRepository.search(...)` con `find(query, Sort, Parameters).page(...)`, agregando solo las condiciones que llegan.
   - Para no repetir los parámetros, agruparlos en un record `CustomerFilter` usado con `@BeanParam`.
   - `/search` y `/email/{email}` se quedan como están.
4. **Usuarios:** `GET /api/users` acepta lo mismo, con `email`, `role`, `createdFrom` y `createdTo`. Devuelve `PageDto<UserDto>` y usa `UserRepository.search(...)` junto con un record `UserFilter`.
5. **Validación:** `sort` y `dir` aceptan solo valores de una lista blanca; cualquier otro valor da 400 en `ErrorDto`. Nunca se concatena texto del usuario en la consulta.
6. **Tests:** actualizar `CustomerControllerTest` y `UserControllerTest` al nuevo formato y agregar casos de paginación, filtros, orden y parámetros inválidos. Agregar a `CustomerServiceTest` y `UserServiceTest` los casos de `search`.
7. Actualizar la tabla de endpoints en `3-quarkus-api/CLAUDE.md` y en `README.md`.

**Verificación:** `./mvnw test` en verde. En Swagger (`/q/swagger-ui`), `GET /api/customers?page=0&size=5&lastName=gu&sort=createdAt&dir=desc` devuelve una página con `createdAt`.

## Paso 2: scaffold del proyecto (skill `react-rules`)

- En `4-react-app`, ejecutar `npm create vite@latest . -- --template react-ts`. Instalar las últimas estables: `react` y `react-dom` 19.3.1 o superior, `react-router` 8, `@tanstack/react-query` 5, `zustand` 5, `zod` 4, `react-hook-form`, `@hookform/resolvers`, `tailwindcss` 4 con `@tailwindcss/vite`, y `lucide-react` para los íconos.
- **Tailwind v4:** agregar el plugin en `vite.config.ts` y, en `src/index.css`, `@import "tailwindcss";` más un bloque `@theme` con los tokens de marca: color primario, radios y fuente (Inter).
- **Proxy:** en `vite.config.ts`, `server.proxy` envía `/api` a `http://localhost:8080`. Así frontend y API comparten origen, la cookie `SameSite=Strict` funciona y no hace falta CORS. Agregar `.env.example` con `VITE_API_URL=/api`.
- `tsconfig` con `strict`, ESLint con `react-hooks` y alias `@/` a `src/`.

**Verificación:** `npm run dev` muestra una página de prueba con estilos de Tailwind; `npm run build` y `npx tsc --noEmit` pasan sin errores.

## Paso 3: capa de datos (cliente HTTP, esquemas, CSRF)

- `src/api/http.ts`: un `request<T>(path, { method, body, schema })` único que:
  - usa `credentials: 'include'`;
  - en POST, PUT y DELETE, lee la cookie `csrf-token` y la envía en `X-CSRF-TOKEN`; si la cookie no existe, primero llama `GET /api/auth/csrf`;
  - valida la respuesta con el esquema Zod que recibe (`parse`);
  - si la respuesta no es 2xx, la valida con `errorSchema` y lanza un `ApiError` con `status`, `message` y `fieldErrors`.
- `src/schemas/`:
  - `customer.schema.ts` y `user.schema.ts` son el espejo de los DTO, con fechas como `z.iso.datetime()` o string;
  - de cada uno sale un esquema de formulario que omite `id` y las fechas;
  - `page.schema.ts` tiene un `pageSchema(itemSchema)` genérico;
  - `error.schema.ts` es el espejo de `ErrorDto`.
- `src/api/authApi.ts`, `customerApi.ts` y `userApi.ts`: una función por endpoint. Los filtros se convierten en `URLSearchParams` y se omiten los vacíos.

**Verificación:** un test rápido o la consola de desarrollo llama a `fetchCustomers({ page: 0 })` contra la API real y obtiene una página válida.

## Paso 4: autenticación y rutas

- `useAuth()` usa React Query sobre `GET /api/auth/me`, con la query key `['auth','me']`; un 401 se interpreta como "sin sesión". Las mutaciones son `useLogin`, `useRegister` y `useLogout`; al terminar, invalidan o limpian la cache.
- **React Router**, con estas rutas:
  - `/login` y `/register`: páginas públicas centradas, con un card;
  - `/` redirige a `/customers`;
  - `/customers`;
  - `/users`: solo `admin`;
  - `*`: 404.
- `<RequireAuth>` y `<RequireRole role="admin">` protegen las rutas y redirigen a `/login`, guardando la ruta de destino.
- Cuando cualquier query o mutation devuelve 401 (sesión expirada a la hora), el `QueryClient` limpia la sesión, redirige a `/login` y muestra un flash "Tu sesión expiró".
- Los formularios de login y registro usan React Hook Form con `zodResolver`; los `fieldErrors` de la API se pasan a `setError`.

**Verificación:** registrar un usuario, cerrar sesión, volver a entrar; ver que `/users` redirige si el rol es `user`.

## Paso 5: layout y sistema de UI (Tailwind)

Diseño general:

- **Topbar fija:** logo y nombre de la app, navegación (Clientes y, si es admin, Usuarios), y un menú de usuario con email, badge de rol y "Cerrar sesión".
- **Zona de flash:** justo debajo de la topbar, arriba del contenido.
- **Página de listado:** sidebar de filtros a la izquierda y contenido a la derecha (título, botón "Nuevo", tabla y paginación).
- Paleta neutra (`slate`), primario `indigo`; éxito `emerald`, error `rose`, aviso `amber`. Modo oscuro con `dark:` según `prefers-color-scheme`.
- Foco visible con `focus-visible:ring`, contraste AA, y textos y `aria-label` en español.

Componentes base en `src/components/ui/`, cada uno pequeño y con una sola responsabilidad:

- `Button` con variantes `primary`, `secondary`, `danger` y `ghost`;
- `Input`, `Select` y `Field` (label, control y mensaje de error);
- `Badge`, `Spinner`, `EmptyState`;
- `Table` (cabecera ordenable con indicador ↑↓ y `aria-sort`);
- `Pagination`: "Mostrando 11–20 de 57", anterior y siguiente, números de página y selector de tamaño (10, 20, 50);
- `Modal`, sobre el `<dialog>` nativo con `showModal()`, que da foco atrapado y cierre con Esc;
- `ConfirmDialog`, construido sobre `Modal`.

**Verificación:** las páginas vacías muestran el layout completo en escritorio y móvil, y en modo claro y oscuro.

## Paso 6: mensajes flash

- **Store** `src/store/useFlashStore.ts` con Zustand:
  - `messages: { id, type: 'success'|'error'|'info', text }[]`;
  - `push(type, text)` y `dismiss(id)`, siempre creando arrays nuevos;
  - expone el helper `flash.success(text)`, que se usa desde los `onSuccess` y `onError` de las mutations.
- **`<FlashMessage>`:** el timer de 5 s es un `useEffect` con su limpieza, porque se sincroniza con un sistema externo, el temporizador. El timer se pausa al pasar el mouse por encima y el mensaje tiene un botón **X** con `aria-label="Cerrar"`. Una barra muestra el tiempo restante y la animación de entrada y salida se hace con Tailwind.
- **`<FlashArea>`:** pila de mensajes arriba del contenido, con `role="status"` (o `role="alert"` si es error).
- **Mensajes:** "Cliente creado", "Cliente actualizado", "Cliente eliminado", y lo mismo para usuarios. En los errores 409 se muestra el `message` que manda la API.

**Verificación:** crear un registro muestra el flash, que desaparece a los 5 s o al hacer clic en la X; varios mensajes se apilan.

## Paso 7: clientes

- **Página** `pages/CustomersPage.tsx`: solo compone `CustomerFilters`, `CustomerTable`, `Pagination` y el modal del formulario.
- **Estado de la lista en la URL** con `useSearchParams`: `page`, `size`, `sort`, `dir`, `name`, `lastName`, `email`, `createdFrom` y `createdTo`. Así la vista se puede compartir y el botón Atrás funciona; los filtros se derivan de la URL y no se duplican en estado.
- **`useCustomers(filters)`:** usa `useQuery` con `placeholderData: keepPreviousData`, para que la tabla no parpadee al cambiar de página. Los campos de texto pasan por `useDebounce` (300 ms) antes de actualizar la URL.
- **Sidebar de filtros** `components/FilterSidebar` (genérico, reutilizado en usuarios):
  - abierto mide `w-72` y muestra nombre, apellido, email, fecha desde/hasta, y los botones "Aplicar" y "Limpiar";
  - colapsado queda en un riel `w-12` con el ícono de filtros y un contador de filtros activos, y la tabla ocupa todo el ancho;
  - el estado abierto/colapsado se recuerda en `localStorage`, envuelto en try/catch, con un store de UI en Zustand;
  - en móvil es un panel deslizable (drawer).
- **Tabla:** nombre, apellido, email, fecha de alta y acciones (editar y eliminar, solo `admin`). Las columnas se pueden ordenar. Hay estados de carga (skeleton), vacío y error.
- **Formulario:**
  - `CustomerForm` usa React Hook Form con Zod y repite las reglas del DTO: obligatorio, máximo 80 caracteres y email válido;
  - se abre en un modal para crear y para editar, y se reinicia con `key={customer?.id ?? 'new'}`;
  - las mutations invalidan `['customers']` y lanzan el flash;
  - un 409 por email repetido se muestra en el campo con `setError('email')`.
- **Eliminar:** usa `ConfirmDialog` ("¿Eliminar a Ana Pérez? Esta acción no se puede deshacer."), con los botones Cancelar y Eliminar en rojo. Mientras se elimina, el botón muestra un spinner. El `window.confirm` del navegador no se usa nunca.
- **Rol `user`:** ve la tabla y los filtros, sin botones de crear, editar ni eliminar.

**Verificación:** CRUD completo, con paginación, orden, cada filtro por separado y combinado, y la URL reflejando los filtros.

## Paso 8: usuarios (solo admin)

- `UsersPage` reutiliza `FilterSidebar`, `Table`, `Pagination` y `ConfirmDialog`. Los filtros son email, rol (todos, user o admin) y fecha desde/hasta.
- La tabla muestra email, un badge de rol, fecha de alta y acciones. La fila del usuario logueado lleva la etiqueta "(tú)".
- **Ver detalle:** un modal o panel con los datos del usuario y sus fechas de alta y actualización.
- **`UserForm`:**
  - para crear pide email, contraseña (8 a 72 caracteres) y rol;
  - para editar, la contraseña es opcional (vacía conserva la actual) y el rol se elige en un `Select`;
  - cambiar de rol es parte de la edición: no hay un endpoint aparte.
- **Protecciones en la UI**, que repiten las reglas del backend; si la API igual responde 409, se muestra su mensaje como flash de error:
  - el número de admins se obtiene con `useAdminCount()`, que llama a `GET /api/users?role=admin&size=1` y lee `totalElements`;
  - fila propia: el botón Eliminar está deshabilitado, con un tooltip "No puedes eliminar tu propio usuario";
  - único admin: el botón Eliminar está deshabilitado y el `Select` de rol se bloquea en `admin`, con el aviso "Debe quedar al menos un administrador";
  - si un admin se cambia su propio rol a `user` y quedan otros admins, se pide una confirmación extra ("Perderás el acceso a la administración"). Al guardar, se invalida `['auth','me']` y se redirige a `/customers`.
- Las mutations invalidan `['users']` y el conteo de admins, y lanzan el flash.

**Verificación:** con un solo admin no se puede eliminar ni degradar, ni desde la UI ni forzando la petición (409 con su flash). Con dos admins, degradar uno funciona.

## Paso 9: revisión y cierre

- Revisar `src/components` y `src/pages` con la skill **`web-design-guidelines`** y corregir lo que encuentre: accesibilidad, foco, contraste y estados.
- Repasar el checklist de `react-rules`:
  - sin `any` ni mutación de estado;
  - ningún `useEffect` que derive estado o reaccione a eventos;
  - los hooks siempre en el nivel superior.
- Actualizar `CLAUDE.md` (estado y estructura real) y `README.md` (capturas opcionales y comandos reales).

---

## Archivos principales

- **Backend:**
  - `3-quarkus-api/.../models/dto/{PageDto,CustomerFilter,UserFilter}.java` (nuevos);
  - `CustomerDto`, `UserDto`, `CustomerMapper`, `UserMapper`;
  - `CustomerRepository.search` y `UserRepository.search`, los services y los controllers;
  - los tests de controllers y services.
- **Frontend:**
  - `vite.config.ts`, `src/index.css`;
  - `src/api/*`, `src/schemas/*`;
  - `src/store/{useFlashStore,useUiStore}.ts`;
  - `src/hooks/{useAuth,useCustomers,useUsers,useAdminCount,useDebounce}.ts`;
  - `src/components/{ui,layout,flash,customers,users,filters}/`;
  - `src/pages/*`.

## Verificación de punta a punta

1. `./mvnw quarkus:dev` en `3-quarkus-api` y `npm run dev` en `4-react-app`.
2. En el navegador integrado:
   - login con el admin semilla, cuyas credenciales están en el `.env` del backend y no se muestran;
   - crear, editar y eliminar clientes y usuarios, y ver el flash y el modal de confirmación;
   - paginar, ordenar, filtrar y colapsar el sidebar;
   - comprobar las reglas del último admin;
   - entrar como `user` y confirmar que es de solo lectura.
3. `npm run build`, `npx tsc --noEmit`, `npm run lint` y `./mvnw test` en verde.
4. Revisar a 375 px de ancho (drawer de filtros) y en modo oscuro.
