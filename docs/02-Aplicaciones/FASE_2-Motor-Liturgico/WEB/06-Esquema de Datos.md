---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - arquitectura
  - esquema-datos
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
---

# Esquema de Datos - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

Entidades de base de datos en Supabase PostgreSQL necesarias para el MVP del Motor Liturgico. El Motor separa la logica calendrica (tablas propias) del contenido textual (CMS externo, referenciado por `cms_entry_id`).

## Entidades principales

| Entidad                   | Proposito                                                                  | Campos clave                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `liturgical_years`        | Anos liturgicos con su ciclo (A/B/C) y rango de fechas                     | `id`, `year` (INT, PK natural), `cycle` (ENUM: A/B/C), `start_date` (DATE), `end_date` (DATE)                                                 |
| `liturgical_celebrations` | Celebraciones liturgicas por fecha con nombre, tipo, color y prioridad     | `id`, `date` (DATE, UNIQUE), `name` (TEXT), `type` (ENUM: solemnity/feast/memorial/feria), `color` (ENUM), `priority` (INT), `season_id` (FK) |
| `liturgical_readings`     | Referencias a lecturas del CMS para cada celebracion                       | `id`, `celebration_id` (FK), `cms_entry_id` (TEXT), `order` (INT)                                                                             |
| `liturgical_seasons`      | Tiempos liturgicos (Adviento, Navidad, Cuaresma, Pascua, Tiempo Ordinario) | `id`, `name` (TEXT), `color` (ENUM: verde/rojo/blanco/morado/rosado/negro), `start_rule` (TEXT), `end_rule` (TEXT)                            |

### Detalle de campos

### `liturgical_years`

| Campo        | Tipo | Constraint                      | Descripcion                                              |
| ------------ | ---- | ------------------------------- | -------------------------------------------------------- |
| `id`         | UUID | PK, default `gen_random_uuid()` | Identificador unico                                      |
| `year`       | INT  | UNIQUE NOT NULL                 | Ano civil; determina el ciclo liturgico                  |
| `cycle`      | ENUM | NOT NULL, CHECK in (A, B, C)    | Ciclo liturgico: A si ano % 3 == 1, B si == 2, C si == 0 |
| `start_date` | DATE | NOT NULL                        | Primer Domingo de Adviento del ano liturgico             |
| `end_date`   | DATE | NOT NULL                        | Solemnidad de Cristo Rey del ano siguiente               |

### `liturgical_celebrations`

| Campo        | Tipo        | Constraint                                                  | Descripcion                                                                |
| ------------ | ----------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `id`         | UUID        | PK, default `gen_random_uuid()`                             | Identificador unico                                                        |
| `date`       | DATE        | UNIQUE NOT NULL                                             | Fecha de la celebracion (una por fecha)                                    |
| `name`       | TEXT        | NOT NULL                                                    | Nombre de la celebracion (ej. "Navidad", "Pascua")                         |
| `type`       | ENUM        | NOT NULL, CHECK in (solemnity, feast, memorial, feria)      | Tipo de fiesta                                                             |
| `color`      | ENUM        | NOT NULL, CHECK in (green, red, white, purple, pink, black) | Color liturgico principal                                                  |
| `priority`   | INT         | NOT NULL DEFAULT 0                                          | Prioridad para resolver conflictos (solemnidad > fiesta > memoria > feria) |
| `season_id`  | UUID        | FK -> `liturgical_seasons.id`                               | Tiempo liturgico al que pertenece                                          |
| `year_id`    | UUID        | FK -> `liturgical_years.id`                                 | Ano liturgico de referencia                                                |
| `is_movable` | BOOL        | DEFAULT FALSE                                               | Indica si la fecha se calcula (Pascua y derivadas)                         |
| `created_at` | TIMESTAMPTZ | DEFAULT now()                                               | Timestamp de creacion                                                      |
| `updated_at` | TIMESTAMPTZ | DEFAULT now()                                               | Timestamp de actualizacion                                                 |

### `liturgical_readings`

| Campo            | Tipo | Constraint                                   | Descripcion                                           |
| ---------------- | ---- | -------------------------------------------- | ----------------------------------------------------- |
| `id`             | UUID | PK, default `gen_random_uuid()`              | Identificador unico                                   |
| `celebration_id` | UUID | FK -> `liturgical_celebrations.id`, NOT NULL | Referencia a la celebracion                           |
| `cms_entry_id`   | TEXT | NOT NULL                                     | ID de la entrada en el CMS con el texto de la lectura |
| `order`          | INT  | NOT NULL DEFAULT 0                           | Orden de la lectura (1 = primera, 2 = salmo, etc.)    |

### `liturgical_seasons`

| Campo        | Tipo | Constraint      | Descripcion                                                   |
| ------------ | ---- | --------------- | ------------------------------------------------------------- |
| `id`         | UUID | PK              | Identificador unico                                           |
| `name`       | TEXT | UNIQUE NOT NULL | Nombre: Adviento, Navidad, Cuaresma, Pascua, Tiempo Ordinario |
| `color`      | ENUM | NOT NULL        | Color por defecto del tiempo liturgico                        |
| `start_rule` | TEXT | NOT NULL        | Regla de inicio (ej. "Primer domingo de Adviento")            |
| `end_rule`   | TEXT | NOT NULL        | Regla de fin (ej. "Bautismo del Senor", "Pentecostes")        |

## Relaciones

- `liturgical_celebrations` 1:N `liturgical_readings` (una celebracion tiene multiples lecturas).
- `liturgical_celebrations` N:1 `liturgical_seasons` (cada celebracion pertenece a un tiempo liturgico).
- `liturgical_celebrations` N:1 `liturgical_years` (cada celebracion pertenece a un ano liturgico).
- `liturgical_readings` N:1 `liturgical_celebrations` (cada lectura pertenece a una celebracion).

## Reglas de integridad

- Una celebracion por fecha (constraint UNIQUE en `liturgical_celebrations.date`), excepto cuando una solemnidad desplaza una memoria o feria (se actualiza la fila existente).
- Pascua se calcula con el algoritmo de Gauss y se persiste como `is_movable = true`; las fiestas moviles derivadas tambien se marcan como moviles.
- Las lecturas (`liturgical_readings`) referencian al CMS via `cms_entry_id`; el Motor no duplica el contenido textual. Si el CMS elimina una entrada, el Motor debe mantener la referencia pero la app consumidora mostrara "lectura no disponible".
- El rango de anos soportado es 2000-2100; `liturgical_years` solo contiene filas en ese rango.
- RLS (Row Level Security) activa en todas las tablas: lectura publica para consultas, escritura solo para rol `editor` autenticado.
- Indice en `liturgical_celebrations(date)` para busqueda por fecha O(1).
- Indice en `liturgical_celebrations(year_id)` para listar celebraciones por ano.
