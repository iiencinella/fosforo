# @repo/auth

Paquete compartido del ecosistema Fósforo que centraliza la autenticación, sesiones, perfiles y mapeo de roles del ecosistema. Es consumido por `src/apps/usuario/` y por cualquier otra app que necesite validar la sesión de un usuario contra Supabase.

## Stack

- `@supabase/supabase-js` para hablar con `auth.users` y `public.profiles`.
- `@repo/env` para leer `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
- `zod` para validación de payloads de auth.

## Modulos

- `src/cookies.ts`: helpers para leer y emitir las cookies de sesión (`fosforo_access_token`, `fosforo_refresh_token`) con atributos `Path=/`, `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- `src/session.ts`: cliente Supabase anonimo reutilizable (`getSupabaseAuthClient`), validacion de token (`getSessionFromToken`), carga de perfil con rol (`getUserProfileById`) y guards (`requireSession`, `requireAdminSession`).
- `src/role-mapping.ts`: jerarquia explicita de roles del ecosistema y helpers para que cada app defina su propio `AppRole` y determine que roles pueden contribuir o moderar.

## Politica de cookies

Las cookies son `Path=/` y `SameSite=Lax`. En produccion (`NODE_ENV=production`) se setean con `Secure`. Para compartirlas entre subdominios, configurar `AUTH_COOKIE_DOMAIN=.fosforo.com.ar` en producción; en local y previews se deja vacío para evitar compartir cookies entre proyectos.

## Reglas de roles

Jerarquia (de mayor a menor privilegio):

| slug          | hierarchy_level | descripcion                                  |
| ------------- | --------------- | -------------------------------------------- |
| `admin`       | 1               | Control total del ecosistema                 |
| `sacerdote`   | 20              | Rol pastoral con permisos especificos        |
| `coordinador` | 40              | Gestion operativa de servicios y comunidades |
| `musico`      | 60              | Contribuye contenido a apps especificas      |
| `usuario`     | 100             | Acceso basico a aplicaciones autorizadas     |

Cada consumer (Cancionero, Biblia, Calendario, etc.) define su propio `AppRole` (por ejemplo Cancionero usa `"invitado" | "musico" | "coordinador" | "sacerdote" | "admin"`) y mapea el `roleSlug` a su `AppRole` mediante el helper `mapRoleSlugToAppRole` con su propio mapa de equivalencias.

## Comandos

- `pnpm --filter @repo/auth check-types`
- `pnpm --filter @repo/auth test:unit`
