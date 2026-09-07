---
tags:
  - proyecto/fosforo
  - esquema-datos
  - aplicacion/log
  - rum
  - analiticas
type: app-esquema-datos
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
  - "[[02-SRS|SRS Log]]"
---

# Esquema de Datos - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

Base de datos en Supabase PostgreSQL con dos dominios:

1. **Logs operativos** (vigente): tablas `log_entries`, `api_keys` para ingesta de logs desde apps del ecosistema.
2. **RUM y analíticas** (extensión 2026-09-05): tablas `rum_events`, `rum_vitals`, `rum_sessions`, `rum_sampling_config` para ingesta anonimizada de telemetría de producto y configuración de sampling.

## Entidades principales

### Logs operativos

#### log_entries

Almacena cada evento/log enviado por las aplicaciones del ecosistema.

| Columna     | Tipo         | Restricciones                                    | Descripcion                                                        |
| ----------- | ------------ | ------------------------------------------------ | ------------------------------------------------------------------ |
| id          | uuid         | PK, default gen_random_uuid()                    | Identificador unico del log                                        |
| app         | varchar(100) | NOT NULL                                         | Nombre de la app emisora (ej: portal, biblia)                      |
| level       | varchar(10)  | NOT NULL, CHECK IN (debug,info,warn,error,fatal) | Nivel de severidad                                                 |
| message     | text         | NOT NULL                                         | Mensaje descriptivo del evento                                     |
| timestamp   | timestamptz  | NOT NULL, default now()                          | Momento en que ocurrio el evento                                   |
| metadata    | jsonb        | NULL                                             | Datos adicionales estructurados (contexto, usuario, request, etc.) |
| stack_trace | text         | NULL                                             | Stack trace completo (solo para errores)                           |
| app_version | varchar(20)  | NULL                                             | Version de la app emisora al generar el log                        |
| environment | varchar(20)  | NULL                                             | Entorno (production, staging, development)                         |
| created_at  | timestamptz  | NOT NULL, default now()                          | Momento de insercion en DB                                         |
| ingested_by | uuid         | NULL, FK -> api_keys.id                          | Referencia a la API key que envio el log                           |

Indices:

- `idx_log_entries_timestamp` ON timestamp DESC
- `idx_log_entries_level` ON level
- `idx_log_entries_app` ON app
- `idx_log_entries_app_level_timestamp` ON (app, level, timestamp DESC)

#### api_keys

Almacena las claves de API para que las apps del ecosistema puedan enviar logs.

| Columna      | Tipo         | Restricciones                 | Descripcion                |
| ------------ | ------------ | ----------------------------- | -------------------------- |
| id           | uuid         | PK, default gen_random_uuid() | Identificador interno      |
| key_hash     | text         | NOT NULL, UNIQUE              | Hash SHA-256 de la API key |
| app_name     | varchar(100) | NOT NULL                      | Nombre de la app asociada  |
| description  | text         | NULL                          | Descripcion del proposito  |
| is_active    | boolean      | NOT NULL, default true        | Si la key esta activa      |
| created_at   | timestamptz  | NOT NULL, default now()       | Fecha de creacion          |
| last_used_at | timestamptz  | NULL                          | Ultimo uso de la key       |

### RUM y analíticas (extensión)

#### rum_events

Almacena eventos de producto (pageview, custom event, error de frontend) capturados por el SDK `@repo/analytics`.

| Columna         | Tipo         | Restricciones                  | Descripcion                                                                                     |
| --------------- | ------------ | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| id              | uuid         | PK, default gen_random_uuid()  | Identificador unico del evento                                                                  |
| app             | varchar(100) | NOT NULL                       | Nombre de la app anfitriona (ej: misal, oraciones)                                              |
| event_name      | varchar(100) | NOT NULL, CHECK IN (whitelist) | Nombre del evento en taxonomía común (ej: `pageview`, `misal.lectio.started`, `frontend.error`) |
| page_url        | text         | NULL                           | URL completa de la página donde ocurrió el evento                                               |
| page_path       | varchar(500) | NULL                           | Path de la página (sin query string) para agregaciones                                          |
| session_id_anon | varchar(64)  | NOT NULL                       | Hash aleatorio de la sesión (no persistente entre sesiones)                                     |
| metadata        | jsonb        | NULL                           | Datos adicionales del evento (sanitizados, sin PII)                                             |
| user_agent_hash | varchar(64)  | NULL                           | Hash SHA-256 del User-Agent para fingerprinting anónimo                                         |
| app_version     | varchar(20)  | NULL                           | Version de la app anfitriona                                                                    |
| environment     | varchar(20)  | NULL                           | Entorno (production, staging, development)                                                      |
| timestamp       | timestamptz  | NOT NULL                       | Momento en que ocurrió el evento en el cliente                                                  |
| created_at      | timestamptz  | NOT NULL, default now()        | Momento de insercion en DB                                                                      |
| has_consent     | boolean      | NOT NULL, default true         | Si el usuario dio consentimiento al momento del evento                                          |

Indices:

- `idx_rum_events_app_timestamp` ON (app, timestamp DESC)
- `idx_rum_events_event_name` ON event_name
- `idx_rum_events_session_id` ON session_id_anon
- `idx_rum_events_page_path` ON page_path

#### rum_vitals

Almacena métricas de Web Vitals (LCP, INP, CLS) capturadas automáticamente por el SDK.

| Columna         | Tipo         | Restricciones                                      | Descripcion                                           |
| --------------- | ------------ | -------------------------------------------------- | ----------------------------------------------------- |
| id              | uuid         | PK, default gen_random_uuid()                      | Identificador unico del vital                         |
| app             | varchar(100) | NOT NULL                                           | Nombre de la app anfitriona                           |
| page_url        | text         | NULL                                               | URL completa de la página                             |
| page_path       | varchar(500) | NULL                                               | Path de la página                                     |
| metric_name     | varchar(10)  | NOT NULL, CHECK IN (LCP, INP, CLS)                 | Nombre de la métrica Web Vitals                       |
| metric_value    | numeric      | NOT NULL                                           | Valor de la métrica (ms para LCP/INP, score para CLS) |
| rating          | varchar(20)  | NOT NULL, CHECK IN (good, needs-improvement, poor) | Clasificación de la métrica                           |
| session_id_anon | varchar(64)  | NOT NULL                                           | Hash aleatorio de la sesión                           |
| app_version     | varchar(20)  | NULL                                               | Version de la app anfitriona                          |
| timestamp       | timestamptz  | NOT NULL                                           | Momento de captura del vital                          |
| created_at      | timestamptz  | NOT NULL, default now()                            | Momento de insercion en DB                            |

Indices:

- `idx_rum_vitals_app_metric` ON (app, metric_name)
- `idx_rum_vitals_app_timestamp` ON (app, timestamp DESC)
- `idx_rum_vitals_rating` ON rating

#### rum_sessions

Agrupa eventos y vitals por sesión anónima para calcular métricas de retención y embudos.

| Columna         | Tipo         | Restricciones                 | Descripcion                                 |
| --------------- | ------------ | ----------------------------- | ------------------------------------------- |
| id              | uuid         | PK, default gen_random_uuid() | Identificador unico de la sesión            |
| session_id_anon | varchar(64)  | NOT NULL, UNIQUE              | Hash aleatorio de la sesión                 |
| app             | varchar(100) | NOT NULL                      | Nombre de la app anfitriona                 |
| first_page_url  | text         | NULL                          | URL de la primera página de la sesión       |
| last_page_url   | text         | NULL                          | URL de la última página de la sesión        |
| page_count      | int          | NOT NULL, default 0           | Cantidad de páginas visitadas en la sesión  |
| event_count     | int          | NOT NULL, default 0           | Cantidad de eventos enviados en la sesión   |
| started_at      | timestamptz  | NOT NULL                      | Momento de inicio de la sesión              |
| ended_at        | timestamptz  | NULL                          | Momento de fin de la sesión (último evento) |
| created_at      | timestamptz  | NOT NULL, default now()       | Momento de insercion en DB                  |

Indices:

- `idx_rum_sessions_app_started_at` ON (app, started_at DESC)
- `idx_rum_sessions_session_id` ON session_id_anon

#### rum_sampling_config

Configuración de sampling por app (administrable).

| Columna           | Tipo         | Restricciones                                  | Descripcion                                    |
| ----------------- | ------------ | ---------------------------------------------- | ---------------------------------------------- |
| id                | uuid         | PK, default gen_random_uuid()                  | Identificador unico                            |
| app               | varchar(100) | NOT NULL, UNIQUE                               | Nombre de la app                               |
| pageview_sampling | numeric      | NOT NULL, default 1.0, CHECK (0 <= value <= 1) | Sampling para pageviews (1.0 = 100%)           |
| custom_sampling   | numeric      | NOT NULL, default 0.1, CHECK (0 <= value <= 1) | Sampling para eventos custom (0.1 = 10%)       |
| error_sampling    | numeric      | NOT NULL, default 1.0, CHECK (0 <= value <= 1) | Sampling para errores de frontend (1.0 = 100%) |
| updated_at        | timestamptz  | NOT NULL, default now()                        | Momento de ultima actualización                |
| updated_by        | uuid         | FK -> auth.users                               | Usuario que actualizo la config                |

## Relaciones

- `api_keys` 1:N `log_entries` (una API key puede enviar muchos logs)
- `rum_sessions` 1:N `rum_events` (una sesión agrupa muchos eventos)
- `rum_sessions` 1:N `rum_vitals` (una sesión agrupa muchos vitals)
- `rum_sampling_config` 1:1 por `app` (configuración única por app)

## Reglas de integridad

### Logs operativos

- Un log debe tener siempre `app`, `level` y `message` no nulos.
- `level` solo puede ser uno de: debug, info, warn, error, fatal.
- `timestamp` se genera automaticamente si no se provee.
- La API key se almacena hasheada (SHA-256); nunca en texto plano.
- Las API keys inactivas (`is_active = false`) rechazan la ingesta con 401.
- Los logs con nivel `fatal` deben incluir `stack_trace`.

### RUM y analíticas

- Un evento RUM debe tener siempre `app`, `event_name`, `session_id_anon` y `timestamp` no nulos.
- `event_name` solo puede ser uno de la taxonomía común (whitelist).
- `metadata` no debe contener PII (validación con regex: email, IP, DNI, teléfono).
- `session_id_anon` es un hash aleatorio generado por el SDK al inicio de cada sesión; NO persiste entre sesiones ni entre apps.
- `user_agent_hash` es SHA-256 del User-Agent, NUNCA se almacena el User-Agent en texto plano.
- NUNCA se almacena IP del cliente.
- `metric_name` en `rum_vitals` solo puede ser: LCP, INP, CLS.
- `rating` en `rum_vitals` solo puede ser: good, needs-improvement, poor.
- RLS: `rum_events`, `rum_vitals`, `rum_sessions`, `rum_sampling_config` solo lectura/escritura para roles `dev`, `ops` y `product`.
- Retención: `rum_events` y `rum_vitals` se purgan tras 90 días por defecto (configurable).
