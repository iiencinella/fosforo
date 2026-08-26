# Plan de implementación: Gestión de roles del ecosistema en Administración

## Objetivo

Convertir la app `administracion` en el centro de mando de roles del ecosistema, manteniendo el modelo vigente de **rol global único por perfil** (`profiles.role_id`) y activando la matriz de acceso por aplicación (`permissions`).

## Decisiones de alcance

- Se mantiene el modelo de rol global único; no se migra a multi-rol por aplicación.
- Se habilita gestión completa desde `administracion`:
  1. catálogo de roles,
  2. matriz rol -> apps,
  3. asignación de rol a personas.
- Se reutiliza la RPC `public.assign_user_role` para asignaciones a personas.
- `admin` y `usuario` quedan protegidos contra eliminación/renombrado.
- `admin` sigue con bypass de permisos por app en `@repo/auth`.

## Arquitectura técnica

### Backend (API routes en `src/apps/administracion/src/pages/api`)

- `GET/POST /api/roles`
- `PUT/POST/DELETE /api/roles/[id]`
- `PUT/POST /api/roles/[id]/permissions`
- `GET /api/people`
- `PUT/POST /api/people/[id]/role`

Todas las rutas usan `requireApiAuth` con control por rol de panel:

- lectura: `admin/editor/viewer`
- catálogo y matriz: `admin`
- asignación de personas: `admin/editor`

### Frontend (SSR)

- `admin/roles/index.astro`: catálogo y alta de rol.
- `admin/roles/[id].astro`: edición + matriz de permisos por app + zona de eliminación.
- `admin/people/index.astro`: listado/búsqueda de perfiles y reasignación de rol.

### Datos y seguridad

- Se agregan grants DML para `authenticated` en `roles` y `permissions`.
- Se siembra matriz inicial para `admin` con acceso a apps base.
- RLS existente `*_manage_admin` basado en `internal.is_admin` se mantiene.

## Matriz de apps del ecosistema (fase actual)

- `portal`
- `biblia`
- `calendario`
- `horarios`
- `usuario`
- `log`
- `administracion`
- `cancionero`

## Validaciones

- `slug`: `^[a-z0-9-]{2,40}$` (inmutable en update).
- `name`: 2..80.
- `description`: opcional, max 240.
- `hierarchyLevel`: 1..100.
- eliminación de rol bloqueada si:
  - es `admin` o `usuario`,
  - tiene perfiles asignados.

## Criterios de terminado

- Migración aplicada y validada.
- APIs de roles/permisos/personas operativas con control de acceso.
- UI de administración con navegación, estados vacíos y mensajes de error.
- Asignación de rol desde administración usando RPC existente.
- Tests unitarios/API de la nueva superficie en verde.
- `pnpm --filter administracion check-types` y `pnpm --filter administracion test:unit` en verde.
