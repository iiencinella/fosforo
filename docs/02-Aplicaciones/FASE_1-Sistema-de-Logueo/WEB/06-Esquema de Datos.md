---
tags:
  - proyecto/fosforo
  - arquitectura
  - esquema-datos
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Logueo]]"
---

# Esquema de Datos - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

Entidades de base de datos necesarias para el MVP del Sistema de Logueo. Toda la autenticación y gestión de sesiones se delega a Supabase Auth; las tablas de dominio (`profiles`, `roles`, `consents`, `auth_audit_log`) extienden `auth.users` de Supabase con metadatos de negocio. Todas las tablas tienen RLS habilitado.

## Entidades principales

| Entidad          | Proposito                                               | Campos clave                                                                                                          |
| ---------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `profiles`       | Perfil de usuario: datos básicos y preferencias         | `user_id` (PK, FK → `auth.users.id`), `display_name`, `avatar_url`, `preferences` (jsonb), `created_at`, `updated_at` |
| `roles`          | Rol del usuario por app                                 | `user_id` (FK → `auth.users.id`), `role` (enum), `app` (text), `created_at`, `updated_at`                             |
| `consents`       | Consentimientos de privacidad por categoría             | `user_id` (FK → `auth.users.id`), `category` (text), `opted_in` (boolean), `updated_at`                               |
| `auth_audit_log` | Registro inmutable de eventos de autenticación y acceso | `id` (PK, UUID), `user_id` (FK → `auth.users.id`), `action` (text), `ip` (inet), `user_agent` (text), `created_at`    |
| `sessions`       | Sesiones activas (gestionado por Supabase Auth)         | Gestionado nativamente por Supabase Auth; no se replica en tablas de dominio.                                         |

## Relaciónes

- `profiles` 1:1 `auth.users` — Cada usuario de Supabase Auth tiene exactamente un perfil.
- `roles` N:1 `profiles` — Un usuario puede tener múltiples roles (uno por app) pero pertenece a un único perfil.
- `consents` N:1 `profiles` — Un usuario tiene múltiples consentimientos (uno por categoría), todos vinculados a su perfil.
- `auth_audit_log` N:1 `profiles` — Un usuario genera múltiples eventos de auditoría a lo largo del tiempo.

## Detalle de tablas

### `profiles`

| Campo          | Tipo        | Constraints                                | Descripción                                              |
| -------------- | ----------- | ------------------------------------------ | -------------------------------------------------------- |
| `user_id`      | uuid        | PK, FK → `auth.users.id` ON DELETE CASCADE | Identificador del usuario en Supabase Auth.              |
| `display_name` | text        | NOT NULL, DEFAULT ''                       | Nombre visible del usuario.                              |
| `avatar_url`   | text        | NULL                                       | URL del avatar del usuario.                              |
| `preferences`  | jsonb       | NOT NULL, DEFAULT '{}'                     | Preferencias del usuario (tema, idioma, notificaciones). |
| `created_at`   | timestamptz | NOT NULL, DEFAULT now()                    | Fecha de creación del perfil.                            |
| `updated_at`   | timestamptz | NOT NULL, DEFAULT now()                    | Fecha de última actualización del perfil.                |

### `roles`

| Campo        | Tipo        | Constraints                                                                  | Descripción                                             |
| ------------ | ----------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| `user_id`    | uuid        | FK → `auth.users.id` ON DELETE CASCADE                                       | Identificador del usuario.                              |
| `role`       | enum        | NOT NULL, CHECK (role IN ('admin','editor','revisor','dev','ops','usuario')) | Rol del usuario.                                        |
| `app`        | text        | NOT NULL, DEFAULT 'global'                                                   | App a la que aplica el rol (`global` = todas las apps). |
| `created_at` | timestamptz | NOT NULL, DEFAULT now()                                                      | Fecha de asignación del rol.                            |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now()                                                      | Fecha de última actualización del rol.                  |

- PK compuesta: (`user_id`, `app`)

### `consents`

| Campo        | Tipo        | Constraints                                                           | Descripción                                       |
| ------------ | ----------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| `user_id`    | uuid        | FK → `auth.users.id` ON DELETE CASCADE                                | Identificador del usuario.                        |
| `category`   | text        | NOT NULL, CHECK (category IN ('marketing','analytics','third_party')) | Categoría del consentimiento.                     |
| `opted_in`   | boolean     | NOT NULL, DEFAULT false                                               | Estado del consentimiento (true = aceptado).      |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now()                                               | Fecha de última actualización del consentimiento. |

- PK compuesta: (`user_id`, `category`)

### `auth_audit_log`

| Campo        | Tipo        | Constraints                                                                                        | Descripción                                     |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `id`         | uuid        | PK, DEFAULT gen_random_uuid()                                                                      | Identificador único del registro.               |
| `user_id`    | uuid        | FK → `auth.users.id` ON DELETE SET NULL                                                            | Usuario que generó el evento (NULL si anónimo). |
| `action`     | text        | NOT NULL, CHECK (action IN ('login','logout','session_revoked','role_changed','sensitive_access')) | Tipo de evento.                                 |
| `ip`         | inet        | NULL                                                                                               | IP desde donde se realizó la acción.            |
| `user_agent` | text        | NULL                                                                                               | User-Agent del cliente.                         |
| `created_at` | timestamptz | NOT NULL, DEFAULT now()                                                                            | Timestamp del evento.                           |

## Reglas de integridad

- `profiles` tiene RLS habilitado: un usuario solo puede leer y editar su propio perfil; un admin puede leer todos los perfiles.
- `roles` tiene RLS habilitado: solo un admin puede escribir (INSERT, UPDATE, DELETE); cualquier usuario autenticado puede leer sus propios roles.
- `consents` tiene RLS habilitado: un usuario solo puede leer y gestionar sus propios consentimientos.
- `auth_audit_log` es solo INSERT: ninguna política RLS permite UPDATE o DELETE; los registros son inmutables. Los usuarios pueden leer sus propios eventos; los admin pueden leer todos.
- `profiles.user_id` tiene ON DELETE CASCADE desde `auth.users`, de modo que eliminar un usuario en Supabase Auth elimina su perfil.
- `roles` y `consents` también tienen ON DELETE CASCADE desde `auth.users`.
- `auth_audit_log.user_id` tiene ON DELETE SET NULL para preservar el registro de auditoría aunque el usuario sea eliminado.
- Las sesiones son gestionadas nativamente por Supabase Auth; no se replica información de sesión en tablas de dominio para evitar inconsistencias.
