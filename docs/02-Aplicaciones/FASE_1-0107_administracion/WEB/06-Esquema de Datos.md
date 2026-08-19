---
tags:
  - proyecto/fosforo
  - administracion
  - esquema-datos
  - aplicacion
type: app-esquema-datos
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[02-SRS|SRS Administracion]]"
---

# Esquema de Datos - 0107_administracion

## Resumen

Esquema de base de datos para el panel de administracion del ecosistema Fosforo. Las tablas principales se alojan en Supabase Postgres y se integran con el esquema compartido del ecosistema.

## Entidades principales

| Entidad                 | Proposito                                           | Campos clave                                                                                                                                       |
| ----------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `churches`              | Datos maestros de iglesias y templos del ecosistema | `id`, `name`, `address`, `city`, `province`, `country`, `latitude`, `longitude`, `phone`, `email`, `website`, `status`, `created_at`, `updated_at` |
| `celebration_schedules` | Horarios de celebraciones liturgicas por iglesia    | `id`, `church_id`, `celebration_type`, `weekday`, `start_time`, `valid_from`, `valid_to`, `notes`, `created_by`, `created_at`, `updated_at`        |
| `admin_audit_log`       | Registro de auditoria de operaciones en el panel    | `id`, `user_id`, `action`, `resource_type`, `resource_id`, `details`, `created_at`                                                                 |
| `admin_users`           | Usuarios habilitados para el panel con su rol       | `id`, `user_id` (ref auth), `role` (admin/editor/viewer), `active`, `created_at`, `updated_at`                                                     |

## Relaciones

- `churches` 1:N `celebration_schedules` (una iglesia tiene muchos horarios)
- `admin_users` N:1 auth.users (cada usuario del panel corresponde a un usuario autenticado)
- `admin_users` 1:N `admin_audit_log` (un usuario genera muchos registros de auditoria)

## Reglas de integridad

- El campo `name` + `city` en `churches` debe ser unico (indice compuesto)
- `church_id` en `celebration_schedules` debe referenciar una iglesia activa (FK con validacion de estado)
- El borrado de una iglesia no es fisico: solo cambio de status a 'inactive'
- Los registros de `admin_audit_log` son inmutables (solo insercion, nunca modificacion)
