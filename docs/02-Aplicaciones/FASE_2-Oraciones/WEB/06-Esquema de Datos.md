---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
  - web
  - fase-2
  - esquema-datos
  - supabase
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS]]"
  - "[[db/README]]"
---

# Oraciones - Web - Esquema de Datos

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Principio central

**El contenido oracional vive en el CMS.** El esquema `oraciones` en Supabase solo almacena la capa personal del usuario y los reportes. Cero duplicación de contenido editorial. `content_ref` es la referencia al contenido del CMS (su id/slug público), nunca texto de la oración.

## Esquema `oraciones`

### Tabla `favorites`

| Columna     | Tipo        | Restricción                                |
| ----------- | ----------- | ------------------------------------------ |
| id          | uuid        | PK, default gen_random_uuid()              |
| user_id     | uuid        | NOT NULL, FK → auth.users(id)              |
| content_ref | text        | NOT NULL (id/slug del contenido en el CMS) |
| created_at  | timestamptz | NOT NULL, default now()                    |

- Unique: `(user_id, content_ref)` — un favorito por oración por usuario.
- RLS: SELECT/INSERT/DELETE con `user_id = auth.uid()`. Sin UPDATE (toggle = delete + insert).

### Tabla `collections`

| Columna    | Tipo        | Restricción                                            |
| ---------- | ----------- | ------------------------------------------------------ |
| id         | uuid        | PK                                                     |
| user_id    | uuid        | NOT NULL, FK → auth.users(id)                          |
| nombre     | text        | NOT NULL, CHECK `char_length(nombre) BETWEEN 1 AND 50` |
| slug       | text        | NOT NULL, unique por usuario: unique `(user_id, slug)` |
| created_at | timestamptz | NOT NULL, default now()                                |
| deleted_at | timestamptz | NULL (soft-delete de cabecera)                         |

- RLS: SELECT/INSERT/UPDATE/DELETE con `user_id = auth.uid()`; SELECT excluye `deleted_at IS NOT NULL` en la vista de app.

### Tabla `collection_items`

| Columna       | Tipo        | Restricción                                                   |
| ------------- | ----------- | ------------------------------------------------------------- |
| id            | uuid        | PK                                                            |
| collection_id | uuid        | NOT NULL, FK → collections(id) ON DELETE CASCADE              |
| content_ref   | text        | NOT NULL (id/slug en el CMS)                                  |
| orden         | integer     | NOT NULL (posición manual, se reordena moviendo arriba/abajo) |
| created_at    | timestamptz | NOT NULL, default now()                                       |

- Unique: `(collection_id, content_ref)`.
- RLS: heredada vía join con `collections` (política `EXISTS (SELECT 1 FROM collections c WHERE c.id = collection_id AND c.user_id = auth.uid())`).
- `content_ref` debe existir en el catálogo del CMS; se valida en aplicación (ORAC-003) — el CMS es la fuente de verdad y la BD no lo replica.

### Tabla `preferences`

| Columna           | Tipo        | Restricción                                    |
| ----------------- | ----------- | ---------------------------------------------- |
| user_id           | uuid        | PK, FK → auth.users(id) (una fila por usuario) |
| tema              | text        | CHECK tema IN ('claro','oscuro','auto')        |
| font_size         | text        | CHECK font_size IN ('s','m','l')               |
| recordatorio_tipo | text        | NULL (tipo de devoción)                        |
| recordatorio_hora | text        | NULL, CHECK HH:MM compatible con `^([01]\d     | 2[0-3]):[0-5]\d$` |
| updated_at        | timestamptz | NOT NULL, default now()                        |

- Nota: el **modo lectura visible** (tema/font_size) se aplica desde `localStorage` (RB-ORAC-004); esta tabla es la copia de preferencias sincronizada de la cuenta (y la fuente del recordatorio).
- RLS: SELECT/INSERT/UPDATE con `user_id = auth.uid()`.

### Tabla `reports`

| Columna      | Tipo        | Restricción                                                                |
| ------------ | ----------- | -------------------------------------------------------------------------- |
| id           | uuid        | PK                                                                         |
| content_ref  | text        | NOT NULL (oración reportada)                                               |
| motivo       | text        | NOT NULL, CHECK motivo IN ('texto-errado','incompleta','duplicada','otro') |
| comentario   | text        | NULL, máx 500 chars (CHECK length)                                         |
| session_hash | text        | NOT NULL (hash anónimo de la sesión, sin PII)                              |
| created_at   | timestamptz | NOT NULL, default now()                                                    |

- **Insert-only**: RLS con únicamente política INSERT (true con rate limiting a nivel de endpoint, ver OWASP); nadie puede leer ni actualizar reportes desde la app; solo procesos editoriales con service_role la consultan.
- Anónima: guardamos `session_hash` (hash de IP+UA salteado), nunca email ni user_id (RB-ORAC-006).

## Índices

- `favorites (user_id, created_at DESC)` — listado de favoritos del usuario.
- `collections (user_id) WHERE deleted_at IS NULL`.
- `collection_items (collection_id, orden)`.
- `reports (created_at DESC)` — para revisión editorial.

## Reglas transversales

- Todas las tablas con datos personales tienen **RLS por `user_id`**, sin excepciones (`force row_level_security`).
- `content_ref` siempre apunta a contenido del CMS; si el contenido se elimina o se renombra en el CMS, el ítem se maneja con estado vacío del lado de la app (ORAC-003).
- Migraciones por PR en `db/scripts` siguiendo `db/README.md`; cambios de este esquema comen con FASE 2-Oraciones.
