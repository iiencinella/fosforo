---
tags:
  - proyecto/fosforo
  - biblia
  - arquitectura
  - esquema-datos
  - aplicación
type: app-datos
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-05-25
related:
  - "[[00-README|0102 Biblia]]"
---

# Esquema de Datos - 0102_biblia

## Resumen

Modelo de datos propuesto en Supabase PostgreSQL para soportar lectura bíblica, búsqueda textual, catálogo de versiones y lecturas litúrgicas del día en un MVP interno.

## Entidades principales

| Entidad                  | Proposito                                                                      | Campos clave                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `biblia_versions`        | Gestionar catálogo de versiones bíblicas y estado de habilitación.             | `id`, `slug`, `name`, `abbreviation`, `language`, `is_enabled`, `is_internal_only`, `created_at`, `updated_at`                                                      |
| `biblia_books`           | Definir canon de libros por versión y orden de navegación.                     | `id`, `version_id`, `book_slug`, `book_name`, `book_order`, `testament`, `is_active`                                                                                |
| `biblia_chapters`        | Indexar capítulos por libro.                                                   | `id`, `book_id`, `chapter_number`, `verse_count`                                                                                                                    |
| `biblia_verses`          | Almacenar texto por versículo.                                                 | `id`, `chapter_id`, `verse_number`, `verse_text`, `search_vector`, `created_at`                                                                                     |
| `liturgy_daily_readings` | Almacenar lecturas litúrgicas por fecha y rito (Rito Romano Argentina en MVP). | `id`, `reading_date`, `rite`, `region_code`, `reading_type`, `reference_label`, `book_id`, `chapter_start`, `verse_start`, `chapter_end`, `verse_end`, `created_at` |
| `biblia_ingestion_runs`  | Trazar cargas/actualizaciones de contenido.                                    | `id`, `source_name`, `run_status`, `started_at`, `finished_at`, `records_processed`, `error_summary`                                                                |

## Relaciónes

- `biblia_versions` 1:N `biblia_books`.
- `biblia_books` 1:N `biblia_chapters`.
- `biblia_chapters` 1:N `biblia_verses`.
- `biblia_books` 1:N `liturgy_daily_readings` (mediante referencia principal del pasaje).
- `biblia_ingestion_runs` 1:N registros afectados por carga (trazabilidad vía metadata/log).

## Reglas de integridad

- `biblia_versions.slug` debe ser único; en MVP solo una versión con `is_enabled = true`.
- `biblia_books` debe ser único por (`version_id`, `book_slug`) y mantener `book_order` consistente.
- `biblia_chapters` debe ser único por (`book_id`, `chapter_number`).
- `biblia_verses` debe ser único por (`chapter_id`, `verse_number`) y no admitir `verse_text` vacío.
- `liturgy_daily_readings` debe validar fecha ISO y tipo de lectura controlado (`first_reading`, `psalm`, `second_reading`, `gospel`, `other`).
- En MVP `rite = roman` y `region_code = AR`; extensible a otros calendarios por integración futura.
- Todo contenido asociado a LPD debe marcarse `is_internal_only = true` y mantenerse fuera de exposición pública.
