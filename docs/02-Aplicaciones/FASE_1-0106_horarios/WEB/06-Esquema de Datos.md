---
tags:
  - proyecto/fosforo
  - horarios
  - esquema-datos
  - aplicación
type: app-esquema-datos
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
  - "[[02-SRS|SRS Horarios]]"
---

# Esquema de Datos - 0106_horarios

## Resumen

Base de datos en Supabase PostgreSQL para gestionar templos, celebraciones y horarios con trazabilidad de actualizacion. El diseño prioriza lectura eficiente para filtros por ciudad, tipo y franja horaria.

## Entidades principales

| Entidad                  | Proposito                                           | Campos clave                                                                                                                                  |
| ------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `horarios_temples`       | Catalogo de templos/parroquias/capillas disponibles | `id`, `name`, `city`, `province`, `address`, `lat`, `lng`, `status`, `contact_phone`, `contact_whatsapp`, `notes`, `created_at`, `updated_at` |
| `horarios_celebrations`  | Celebraciones liturgicas por templo                 | `id`, `temple_id`, `celebration_type`, `weekday`, `start_time`, `duration_min`, `notes`, `created_at`, `updated_at`                           |
| `horarios_search_events` | Telemetria basica de consultas para mejora continua | `id`, `session_id`, `query`, `filters`, `results_count`, `created_at`                                                                         |

### Tipos de celebracion (`celebration_type` en codigo)

| Valor       | Descripcion           |
| ----------- | --------------------- |
| `misa`      | Santa Misa            |
| `adoracion` | Adoracion             |
| `confesion` | Confesiones           |
| `rosario`   | Santo Rosario         |
| `liturgia`  | Liturgia de las Horas |

### Estados de actualizacion (`status` en codigo)

| Valor     | Descripcion                                      |
| --------- | ------------------------------------------------ |
| `updated` | Datos actualizados dentro de la ventana objetivo |
| `review`  | En revision, pendiente de confirmacion           |
| `stale`   | Sin actualizar, requiere actualizacion           |

## Relaciónes

- `horarios_temples` 1:N `horarios_celebrations` (un templo tiene muchas celebraciones)
- `horarios_search_events` sin FK obligatoria a entidades de dominio para minimizar acoplamiento operacional
- Las busquedas publicas consultan mediante JOIN entre `horarios_temples` y `horarios_celebrations`

## Reglas de integridad

- `horarios_celebrations.temple_id` debe referenciar un templo existente en `horarios_temples`
- `celebration_type` solo admite los valores del catalogo de tipos habilitados
- `weekday` es un entero 0-6 (lunes-domingo) o string del dia en ingles
- `start_time` debe estar en formato horario valido (HH:MM)
- Si `horarios_search_events.filters` existe, debe ser un objeto JSON con los filtros aplicados
- La funcion `haversine()` se usa para calculo de distancia geodesica entre coordenadas
