---
tags:
  - proyecto/fosforo
  - arquitectura
  - esquema-datos
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
---

# Esquema de Datos - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

Entidades de base de datos necesarias para el MVP del Sistema de Notificaciones. Toda la información de plantillas, eventos, preferencias y cola se almacena en Supabase PostgreSQL con RLS (Row Level Security) habilitado en todas las tablas de dominio. La autenticación y validación de identidad se delegan a Supabase Auth.

## Entidades principales

| Entidad                    | Proposito                                            | Campos clave                                                                                                                               |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `notification_templates`   | Plantillas versionadas por canal con variables       | `id`, `name`, `version`, `channel`, `subject`, `body`, `variables` (jsonb), `status`, `created_by`, `created_at`, `published_at`           |
| `notification_events`      | Eventos de notificación con trazabilidad por mensaje | `id`, `event_id`, `template_id`, `channel`, `recipient`, `status`, `payload` (jsonb), `created_at`, `sent_at`, `delivered_at`, `opened_at` |
| `notification_preferences` | Preferencias de usuario por canal y categoría        | `user_id`, `channel`, `category`, `opted_in`, `updated_at`                                                                                 |
| `notification_queue`       | Cola de envíos con reintentos y backoff              | `id`, `event_id`, `status`, `attempts`, `next_retry_at`, `created_at`                                                                      |

## Relaciónes

- `notification_events` N:1 `notification_templates` — Cada evento de notificación usa una plantilla; una plantilla se usa en muchos eventos.
- `notification_events` N:1 `notification_preferences` — Cada evento respeta las preferencias del destinatario; una preferencia aplica a muchos eventos del mismo usuario.
- `notification_queue` 1:1 `notification_events` — Cada mensaje encolado corresponde a un evento de notificación (relación 1:1 por `event_id`).
- `notification_templates` N:1 `auth.users` (via `created_by`) — Cada plantilla es creada por un usuario editor/admin.

## Detalle de tablas

### `notification_templates`

| Campo          | Tipo        | Constraints                                                                   | Descripción                                                             |
| -------------- | ----------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `id`           | uuid        | PK, DEFAULT gen_random_uuid()                                                 | Identificador único de la plantilla.                                    |
| `name`         | text        | NOT NULL                                                                      | Nombre de la plantilla (único por canal).                               |
| `version`      | integer     | NOT NULL, DEFAULT 1                                                           | Versión de la plantilla (incremental por nombre+canal).                 |
| `channel`      | text        | NOT NULL, CHECK (channel IN ('email','push','in-app'))                        | Canal de la plantilla.                                                  |
| `subject`      | text        | NULL (no requerido para `in-app`)                                             | Asunto del mensaje (email) o título (push).                             |
| `body`         | text        | NOT NULL                                                                      | Cuerpo del mensaje con variables Mustache/Handlebars.                   |
| `variables`    | jsonb       | NOT NULL, DEFAULT '[]'                                                        | Lista de variables requeridas por la plantilla (nombre, tipo, default). |
| `status`       | text        | NOT NULL, CHECK (status IN ('draft','published','archived')), DEFAULT 'draft' | Estado de la plantilla.                                                 |
| `created_by`   | uuid        | FK → `auth.users.id`                                                          | Usuario que creó la plantilla.                                          |
| `created_at`   | timestamptz | NOT NULL, DEFAULT now()                                                       | Fecha de creación.                                                      |
| `published_at` | timestamptz | NULL                                                                          | Fecha de publicación (NULL si está en draft).                           |

- PK compuesta: (`name`, `channel`, `version`) — Una plantilla tiene versiones únicas por nombre+canal.
- `status = 'published'` hace la versión inmutable: no se puede UPDATE ni DELETE.

### `notification_events`

| Campo           | Tipo        | Constraints                                                                                     | Descripción                                                         |
| --------------- | ----------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `id`            | uuid        | PK, DEFAULT gen_random_uuid()                                                                   | Identificador único del evento.                                     |
| `event_id`      | text        | NOT NULL, UNIQUE                                                                                | ID de idempotencia proporcionado por la app consumidora.            |
| `template_id`   | uuid        | FK → `notification_templates.id`                                                                | Plantilla usada para el envío.                                      |
| `channel`       | text        | NOT NULL, CHECK (channel IN ('email','push','in-app'))                                          | Canal de envío.                                                     |
| `recipient`     | text        | NOT NULL                                                                                        | Destinatario (email, push token o user_id).                         |
| `category`      | text        | NOT NULL, DEFAULT 'general'                                                                     | Categoría de la notificación (general, security, liturgical, etc.). |
| `status`        | text        | NOT NULL, CHECK (status IN ('pending','sent','delivered','failed','opened')), DEFAULT 'pending' | Estado del mensaje.                                                 |
| `payload`       | jsonb       | NOT NULL, DEFAULT '{}'                                                                          | Variables usadas en el render de la plantilla.                      |
| `error_message` | text        | NULL                                                                                            | Mensaje de error si el envío falló (sin PII).                       |
| `attempts`      | integer     | NOT NULL, DEFAULT 0                                                                             | Número de intentos de envío.                                        |
| `created_at`    | timestamptz | NOT NULL, DEFAULT now()                                                                         | Fecha de creación del evento.                                       |
| `sent_at`       | timestamptz | NULL                                                                                            | Fecha de envío al proveedor del canal.                              |
| `delivered_at`  | timestamptz | NULL                                                                                            | Fecha de entrega confirmada por el proveedor.                       |
| `opened_at`     | timestamptz | NULL                                                                                            | Fecha de apertura (email tracking).                                 |

- `event_id` es UNIQUE: garantiza idempotencia (un mismo `event_id` no se procesa dos veces).

### `notification_preferences`

| Campo        | Tipo        | Constraints                                            | Descripción                                                    |
| ------------ | ----------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| `user_id`    | uuid        | FK → `auth.users.id` ON DELETE CASCADE                 | Identificador del usuario.                                     |
| `channel`    | text        | NOT NULL, CHECK (channel IN ('email','push','in-app')) | Canal de la preferencia.                                       |
| `category`   | text        | NOT NULL, DEFAULT 'general'                            | Categoría de la preferencia.                                   |
| `opted_in`   | boolean     | NOT NULL, DEFAULT true                                 | Estado de la preferencia (true = aceptado, false = rechazado). |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now()                                | Fecha de última actualización.                                 |

- PK compuesta: (`user_id`, `channel`, `category`)
- RLS: un usuario solo puede leer y editar sus propias preferencias.
- Categoría `security` siempre tiene `opted_in: true` (no se puede desuscribir).

### `notification_queue`

| Campo           | Tipo        | Constraints                                                                               | Descripción                                            |
| --------------- | ----------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `id`            | uuid        | PK, DEFAULT gen_random_uuid()                                                             | Identificador único del item en cola.                  |
| `event_id`      | text        | NOT NULL, FK → `notification_events.event_id`                                             | Referencia al evento de notificación.                  |
| `status`        | text        | NOT NULL, CHECK (status IN ('pending','processing','retrying','done')), DEFAULT 'pending' | Estado en la cola.                                     |
| `attempts`      | integer     | NOT NULL, DEFAULT 0                                                                       | Número de intentos de envío.                           |
| `next_retry_at` | timestamptz | NULL                                                                                      | Timestamp del próximo reintento (backoff exponencial). |
| `created_at`    | timestamptz | NOT NULL, DEFAULT now()                                                                   | Fecha de creación del item en cola.                    |

- `notification_queue` se limpia automáticamente: los items con `status = 'done'` se archivan tras 30 días.

## Reglas de integridad

- `notification_templates` tiene RLS habilitado: solo `editor` y `admin` pueden crear, versionar y publicar; cualquier app autenticada puede leer plantillas `published`.
- Una plantilla con `status = 'published'` es inmutable: no se puede UPDATE ni DELETE; solo se puede crear una nueva versión o archivar la anterior.
- `event_id` es UNIQUE en `notification_events`: garantiza idempotencia; un `event_id` duplicado retorna el resultado previo sin encolar un nuevo envío.
- `notification_preferences` tiene RLS habilitado: un usuario solo puede leer y editar sus propias preferencias; la categoría `security` no se puede desuscribir.
- `notification_events` tiene RLS habilitado: un usuario puede ver sus propios eventos; `editor` y `admin` pueden ver todos los eventos para trazabilidad.
- Los reintentos máximos son 3 con backoff exponencial (10s, 30s, 90s); tras el tercer fallo, `status` pasa a `failed` en `notification_events`.
- `payload` en `notification_events` puede contener PII; el acceso se restringe por RLS y no se loguea en logs de canal del proveedor.
- `notification_templates.variables` define las variables requeridas; al renderizar, si falta una variable, se usa el valor por defecto o se retorna error de validación.
