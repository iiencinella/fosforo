---
tags:
  - proyecto/fosforo
  - usuarios
  - arquitectura
  - especificación-tecnica
  - aplicación
type: app-arquitectura
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-06-07
related:
  - "[[00-README|0104 Usuarios]]"
---

# Especificación Tecnica - 0104_usuarios

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro (con React para componentes interactivos)
- Lenguaje principal: TypeScript
- Herramientas de build: Turborepo + pnpm + Astro build
- Testing: Vitest
- Autenticación: Supabase Auth (`@supabase/supabase-js`)
- Base de datos: Supabase PostgreSQL con RLS
- UI: Tailwind CSS + `@repo/ui` + `@repo/tailwind-config`

## Arquitectura tecnica

- Patrón de arquitectura: Capas con servicios de aplicación (UserService) sobre Supabase.
- Modulos principales:
  - `UserAuthService`: registro, login, logout, recuperación de contraseña, refresh token.
  - `UserProfileService`: consulta y edición de perfil.
  - `UserRoleService`: asignación, consulta y validación de roles y permisos.
  - `UserAdminService`: listado, búsqueda y gestión de usuarios desde panel admin.
  - `UserAuditService`: registro y consulta de eventos de auditoría.
- Dependencias compartidas:
  - `@supabase/supabase-js`: cliente de Supabase.
  - `@repo/api-utils`: helpers para endpoints Astro (safeHandler, jsonOk, jsonError).
  - `@repo/ui`: componentes compartidos del design system.
  - `@repo/tailwind-config`: tokens de diseño compartidos.
- `@repo/auth`: paquete compartido del ecosistema que encapsula `getSupabaseAuthClient`, `getSessionFromToken`, `getUserProfileById`, helpers de cookies cross-app (`fosforo_access_token` / `fosforo_refresh_token`) y un role-mapping reutilizable. Es la fuente única de identidad que consumen las apps del ecosistema (ej. 0401 Cancionero). Tests unitarios (14) corren en CI.
- Los accesos de datos autenticados usan clientes Supabase ligados al access token de la request; el cliente anónimo base no se reutiliza para consultas protegidas.
- La asignación de roles se ejecuta mediante `public.assign_user_role`, que delega en una función `security definer` privada y registra cambio de perfil, historial y auditoría de forma transaccional.

## Modelos de datos

- `UserProfile`: id (UUID FK auth.users), name, avatar_url, role_id (FK roles), created_at, updated_at.
- `Role`: id, slug (admin|sacerdote|coordinador|usuario), name, description, hierarchy_level.
- `Permission`: id, role_id (FK roles), app_slug, can_access (boolean).
- `UserRoleAssignment`: id, user_id (FK profiles), role_id (FK roles), assigned_by (FK profiles), assigned_at.
- `AuditEvent`: id, user_id (FK profiles), action (string), metadata (jsonb), ip_address, created_at.

## Endpoints (API)

| Metodo | Ruta                        | Proposito                                                         |
| ------ | --------------------------- | ----------------------------------------------------------------- |
| POST   | `/api/auth/register`        | Registrar nuevo usuario (email + password + name).                |
| POST   | `/api/auth/login`           | Iniciar sesión y obtener JWT.                                     |
| POST   | `/api/auth/logout`          | Cerrar sesión.                                                    |
| POST   | `/api/auth/reset-password`  | Solicitar recuperación de contraseña.                             |
| POST   | `/api/auth/update-password` | Actualizar contraseña con token de recuperación.                  |
| GET    | `/api/auth/session`         | Validar JWT y retornar sesión activa.                             |
| GET    | `/api/users/profile`        | Obtener perfil del usuario autenticado.                           |
| PUT    | `/api/users/profile`        | Actualizar perfil del usuario autenticado.                        |
| GET    | `/api/admin/users`          | Listar usuarios (panel admin, paginado y filtrable).              |
| GET    | `/api/admin/users/:id`      | Obtener detalle de un usuario.                                    |
| PUT    | `/api/admin/users/:id/role` | Asignar rol a un usuario.                                         |
| GET    | `/api/admin/audit-log`      | Consultar registros de auditoría.                                 |
| POST   | `/api/auth/mobile-login`    | Login desde cliente móvil (usado por `@repo/mobile-auth-client`). |

El flujo de recovery recibe el `access_token` temporal en el fragmento de la URL, lo envía una sola vez al endpoint `update-password` y limpia el fragmento del historial del navegador tras completar la operación.

## Consideraciónes UI/UX

- Navegación principal: formularios de registro/login como páginas independientes; perfil como sección dentro de cada app; panel admin como ruta protegida `/admin/usuarios`.
- Estados de interfaz (loading/empty/error/success): skeleton loading en formularios y listados; mensajes vacíos con CTA cuando no hay datos; errores con mensaje claro y opción de reintento; confirmaciones con feedback visual inmediato.
- Accesibilidad base: WCAG 2.1 AA en formularios (labels asociados, errores descriptivos, foco manejado), contraste suficiente, navegación por teclado, roles ARIA en componentes críticos.
- Tema claro/oscuro: coherente con el design system del ecosistema (`data-theme` en `@repo/tailwind-config`).

## Consideraciónes de integración con apps consumidoras

- El paquete compartido `@repo/auth` (en `src/packages/auth/`) es el contrato que cualquier app del ecosistema usa para autenticar y autorizar. Los detalles de cookies, session y role-mapping viven ahí; la app 0104 Usuario es la fuente de los datos (auth.users, profiles, roles) pero no la única que puede registrar usuarios (ver ADR-0401-CANCIONERO-008 en Cancionero: Cancionero asigna el rol `musico` desde su propio endpoint, lo que demuestra que apps consumidoras pueden crear usuarios vía `supabase.auth.admin.createUser` + upsert a `profiles` y luego setear cookies vía `@repo/auth`).
- Apps consumidoras reciben la sesión ya validada (`@repo/auth.requireSession`/`getSessionFromRequest`); no necesitan inicializar un cliente Supabase propio. Si necesitan un cliente Supabase con service role (ej. para `createUser`), `@repo/auth` también exporta `getSupabaseAuthClient({ serviceRole: true })`.
- Si una app quiere agregar un rol nuevo al ecosistema (ej. Cancionero agregó `musico`, id=5, hierarchy_level=60), debe:
  1. Crear la fila en `public.roles` con su `hierarchy_level` y permisos en `public.permissions`.
  2. Definir su propio `RoleMap` (mapping de slugs del ecosistema a AppRoles de la app).
  3. Definir su propio `AppRoleHierarchy` con las capacidades de la app.
  4. Documentar en su `08-Decisiones de Arquitectura.md` y agregar tests de role-mapping.
