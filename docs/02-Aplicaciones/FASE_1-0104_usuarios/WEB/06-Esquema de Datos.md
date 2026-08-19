---
tags:
  - proyecto/fosforo
  - usuarios
  - arquitectura
  - esquema-datos
  - aplicación
type: app-arquitectura
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
---

# Esquema de Datos - 0104_usuarios

## Resumen

El sistema de usuarios utiliza un enfoque híbrido: Supabase Auth (`auth.users`) para autenticación y manejo de credenciales, y tablas propias en el schema `public` para perfiles, roles, permisos y auditoría.

## Entidades principales

| Entidad              | Proposito                                                               | Campos clave                                                                                    |
| -------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `auth.users`         | Gestión de autenticación y credenciales (provista por Supabase).        | `id`, `email`, `encrypted_password`, `email_confirmed_at`, `created_at`                         |
| `public.profiles`    | Datos de perfil del usuario, vinculado 1:1 con auth.users.              | `id` (FK auth.users), `name`, `avatar_url`, `role_id` (FK roles), `created_at`, `updated_at`    |
| `public.roles`       | Catálogo de roles disponibles en el ecosistema.                         | `id`, `slug` (admin, sacerdote, coordinador, usuario), `name`, `description`, `hierarchy_level` |
| `public.permissions` | Permisos asociados a un rol para una aplicación específica.             | `id`, `role_id` (FK roles), `app_slug`, `can_access` (boolean), `created_at`                    |
| `public.user_roles`  | Historial de asignaciones de rol por usuario (soporta cambio de roles). | `id`, `user_id` (FK profiles), `role_id` (FK roles), `assigned_by` (FK profiles), `assigned_at` |
| `public.audit_log`   | Registro de eventos críticos de seguridad y administración.             | `id`, `user_id` (FK profiles), `action`, `metadata` (jsonb), `ip_address`, `created_at`         |

## Relaciónes

- `auth.users` 1:1 `public.profiles` (cada usuario autenticado tiene un perfil)
- `public.roles` 1:N `public.profiles` (un rol puede pertenecer a muchos usuarios)
- `public.roles` 1:N `public.permissions` (un rol tiene muchos permisos por app)
- `public.profiles` 1:N `public.user_roles` (un usuario puede tener múltiples asignaciones de rol en el tiempo)
- `public.profiles` 1:N `public.audit_log` (un usuario genera muchos eventos de auditoría)

## Reglas de integridad

- `profiles.id` es FK con `ON DELETE CASCADE` respecto a `auth.users` (si se elimina la autenticación, se elimina el perfil).
- Todo usuario debe tener un `role_id` asignado en `profiles` (default: slug "usuario").
- La tabla `user_roles` es de tipo histórico: cada cambio de rol inserta un nuevo registro, no actualiza el anterior.
- `permissions` se precarga con los 4 roles base y las apps del ecosistema en el momento de inicialización.
- `audit_log` es de solo inserción (append-only), no se permite modificación ni eliminación de registros.
