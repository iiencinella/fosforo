---
tags:
  - proyecto/fosforo
  - esquema-datos
  - aplicacion/log
type: app-esquema-datos
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|README Log]]"
  - "[[02-SRS|SRS Log]]"
---

# Esquema de Datos - 0105_log

## Resumen

Base de datos en Supabase PostgreSQL con tabla principal `log_entries` para almacenar eventos y errores de las apps del ecosistema. Tabla auxiliar `api_keys` para autenticacion de apps emisoras.

## Entidades principales

### log_entries

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

- `idx_log_entries_timestamp` ON timestamp DESC (para queries de listado temporal)
- `idx_log_entries_level` ON level (para filtro por nivel)
- `idx_log_entries_app` ON app (para filtro por app)
- `idx_log_entries_app_level_timestamp` ON (app, level, timestamp DESC) (para dashboard y alertas)

### api_keys

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

## Relaciones

- `api_keys` 1:N `log_entries` (una API key puede enviar muchos logs; un log es enviado por una API key)

## Reglas de integridad

- Un log debe tener siempre `app`, `level` y `message` no nulos.
- `level` solo puede ser uno de: debug, info, warn, error, fatal.
- `timestamp` se genera automaticamente si no se provee.
- La API key se almacena hasheada (SHA-256); nunca en texto plano.
- Las API keys inactivas (`is_active = false`) rechazan la ingesta con 401.
- Los logs con nivel `fatal` deben incluir `stack_trace`.
