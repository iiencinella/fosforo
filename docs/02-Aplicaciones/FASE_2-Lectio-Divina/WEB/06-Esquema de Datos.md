---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-arquitectura
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# Esquema de Datos — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Principios

- Esquema dedicado: **`lectio`** (no mezcla tablas con otras apps).
- **El diario es del dueño**: cada tabla personal lleva `user_id` y RLS estricta.
- **Las lecturas NO se duplican**: ninguna tabla guarda el texto de las lecturas; se resuelven en runtime vía Motor/CMS con cache de presentación (ADR-LECTIO-001).
- Cifrado en reposo de Supabase aplica a todo el esquema (NFR-LECTIO-04).

## 2. Tabla `lectio.sessions`

Sesión de oración de un usuario en una fecha (idempotente por día).

| Columna             | Tipo                                                        | Descripción                                              |
| ------------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| `id`                | `uuid` PK                                                   | Identificador de sesión.                                 |
| `user_id`           | `uuid` NOT NULL                                             | Dueño (FK wal en auth del ecosistema). RLS clave.        |
| `fecha`             | `date` NOT NULL                                             | Fecha local de oración (día del usuario).                |
| `status`            | `text` NOT NULL CHECK (`status IN ('activa','completada')`) | Estado de la sesión.                                     |
| `paso_actual`       | `smallint` NOT NULL DEFAULT 1                               | Índice de paso en curso 1..5.                            |
| `pasos_completados` | `jsonb` NOT NULL DEFAULT `[]`                               | Array de pasos completados (`["lectio",...]`).           |
| `fuente_lecturas`   | `text`                                                      | `motor` \| `manual` (fallback). Para métricas.           |
| `tz_offset`         | `smallint` NOT NULL                                         | Offset en minutos usado ese día (streak, RB-LECTIO-004). |
| `created_at`        | `timestamptz` NOT NULL DEFAULT `now()`                      |                                                          |
| `updated_at`        | `timestamptz` NOT NULL DEFAULT `now()`                      |                                                          |

**Restricciones e índices:**

- `UNIQUE (user_id, fecha)` — idempotencia de sesión por día (RB-LECTIO-003).
- `INDEX (user_id, fecha DESC)` — historial.
- `CHECK (paso_actual BETWEEN 1 AND 5)`.

## 3. Tabla `lectio.entries`

Entrada de diario: apuntes de un paso de una sesión. **El contenido espiritual íntimo vive solo aquí.**

| Columna      | Tipo                                   | Descripción                                                                    |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------------ |
| `id`         | `uuid` PK                              |                                                                                |
| `session_id` | `uuid` NOT NULL                        | FK `lectio.sessions(id) ON DELETE CASCADE`.                                    |
| `user_id`    | `uuid` NOT NULL                        | **Denormalizado del dueño** para RLS de una sola condición (defense in depth). |
| `paso`       | `enum lectio.paso` NOT NULL            | `lectio \| meditatio \| oratio \| contemplatio \| actio`.                      |
| `texto`      | `text`                                 | Contenido del apunte (vacío hasta que el usuario escribe).                     |
| `updated_at` | `timestamptz` NOT NULL DEFAULT `now()` | Autoguardado (debounce 2 s) lo actualiza.                                      |

**Restricciones e índices:**

- `UNIQUE (session_id, paso)` — una entrada por paso.
- `INDEX (user_id, updated_at DESC)` — listado/export.
- `UPDATE` setea `updated_at = now()` (trigger o fuente en endpoint).

## 4. Tabla `lectio.preferences`

Preferencias del usuario para Lectio Divina (una fila por usuario).

| Columna               | Tipo                                                 | Descripción                                        |
| --------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| `user_id`             | `uuid` PK                                            | FK auth; una fila.                                 |
| `recordatorio_activo` | `boolean` NOT NULL DEFAULT `false`                   | Opt-in del recordatorio (RB-LECTIO-007).           |
| `recordatorio_hora`   | `time`                                               | Hora **local** del recordatorio.                   |
| `recordatorio_canal`  | `text` CHECK (`canal IN ('push','email','ninguno')`) | Canal deferido al Sistema de Notificaciones.       |
| `tz_offset`           | `smallint` NOT NULL                                  | Zona horaria actual del usuario (streak + agenda). |
| `tema`                | `text` CHECK (`tema IN ('claro','oscuro')`)          | `data-theme` del ecosistema.                       |
| `font_size`           | `smallint` CHECK (`font_size BETWEEN 100 AND 160`)   | Tamaño de fuente del modo lectura (%).             |
| `updated_at`          | `timestamptz` NOT NULL                               |                                                    |

## 5. RLS (ESTRICTA por user_id — denegar todo lo demás)

```sql
-- Políticas (esquema lectio): SOLO el dueño. NADA más.
alter table lectio.sessions enable row level security;
alter table lectio.entries enable row level security;
alter table lectio.preferences enable row level security;

create policy lectio_sessions_owner on lectio.sessions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy lectio_entries_owner on lectio.entries
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy lectio_preferences_owner on lectio.preferences
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Reglas:

- **Sin** rol de "lectura admin", sin vistas para backoffice, sin except para service-role en rutas de la aplicación. service-role solo en migraciones auditadas (RB-LECTIO-002).
- El defecto de RLS es **denegar**: toda consulta sin coincidencia de `user_id` devuelve vacío.
- Tests de RLS obligatorios (TC-LECTIO-008/009).

## 6. Lo que NO está en el esquema

- **Lecturas del día:** en Motor/CMS. Cache de presentación en memory/edge, TTL corto, no fuente de verdad.
- **Textos de la guía (5 pasos):** en repositorio (`guia/`), versionados con el código (RB-LECTIO-005).
- **Contenido del diario en logs/RUM:** prohibido (SEC-LECTIO-007).
