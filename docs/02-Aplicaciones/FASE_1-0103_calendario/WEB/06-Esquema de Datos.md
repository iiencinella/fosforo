---
tags:
  - proyecto/fosforo
  - calendario
  - arquitectura
  - esquema-datos
  - aplicación
type: app-datos
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
---

# Esquema de Datos - 0103 Calendario

## Resumen

Modelo de datos propuesto para el MVP del calendario litúrgico web. La persistencia real reside en Supabase y reutiliza `public.liturgy_daily_readings` como entidad principal de la jornada diaria. El modelo se expande con tablas satélite para no duplicar ni sobrecargar la tabla base con campos editoriales o de relación cross-app innecesarios.

## Entidades principales

| Entidad                  | Proposito                                                                                                      | Campos clave                                                                                                                                                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `liturgy_daily_readings` | Resolver la jornada diaria base del MVP por fecha, rito y región.                                              | `id`, `reading_date`, `rite`, `region_code`, `celebration_type`, `celebration_name`, `cycle`, `week`, `first_reading_ref`, `psalm_ref`, `second_reading_ref`, `gospel_ref`, `source_year`                                                             |
| `liturgy_day_profiles`   | Resolver perfiles mensuales por `MM-DD` para enriquecer fechas futuras sin duplicar una tabla diaria completa. | `id`, `month_day_key`, `rite`, `region_code`, `celebration_type`, `celebration_name`, `liturgical_season`, `liturgical_color`, `cycle`, `week`, `first_reading_ref`, `psalm_ref`, `second_reading_ref`, `gospel_ref`, `source_year`, `is_approximate` |
| `liturgy_day_saints`     | Asociar uno o más santos o figuras relaciónadas a una jornada concreta.                                        | `id`, `liturgy_day_id`, `saint_slug`, `saint_name`, `sort_order`, `created_at`                                                                                                                                                                        |
| `liturgy_day_links`      | Publicar links contextuales hacia apps o recursos del ecosistema.                                              | `id`, `liturgy_day_id`, `target_app_slug`, `target_url`, `label`, `link_type`, `sort_order`, `is_active`, `created_at`                                                                                                                                |
| `biblia_versions`        | Resolver la versión bíblica o convención de referencias usada en el ecosistema.                                | `code`, `slug`, `name`, `abbreviation`, `language`, `is_enabled`                                                                                                                                                                                      |

## Relaciónes

- `liturgy_daily_readings` 1:N `liturgy_day_saints`.
- `liturgy_daily_readings` 1:N `liturgy_day_links`.
- `liturgy_day_profiles` actúa como tabla de apoyo por mes/día para resolver fechas futuras cuando la tabla diaria exacta aún no está poblada para ese año.
- Las referencias bíblicas de `liturgy_daily_readings` deben mantenerse compatibles con las tablas bíblicas compartidas (`biblia_versions`, `biblia_books`, `biblia_chapters`, `biblia_verses`).

## Reglas de integridad

- Debe existir una estrategia de unicidad efectiva por `reading_date`, `rite` y `region_code` para evitar duplicación semántica de jornada.
- El MVP opera solo con `rite = roman` y `region_code = AR`; cualquier otro alcance debe tratarse como evolución posterior del modelo.
- `liturgy_daily_readings` es la tabla base del calendario MVP y no debe duplicarse con otra tabla diaria equivalente dentro del mismo dominio.
- `liturgy_day_profiles` no reemplaza a `liturgy_daily_readings`; complementa la experiencia con una proyección mensual reutilizable por `MM-DD`.
- Los links ecosistema solo pueden publicarse si el destino es válido, estable y compatible con el estado real de la app destino.
- Las referencias de lecturas deben conservar un formato consistente y compatible con los servicios bíblicos del ecosistema.
- Toda tabla expuesta en `public` debe mantener RLS habilitado y políticas acordes al modelo de lectura pública y escritura restringida.
