---
tags:
  - proyecto/fosforo
  - portal
  - arquitectura
  - esquema-datos
  - aplicación
type: app-datos
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
---

# Esquema de Datos - 0101 Portal

## Resumen

Modelo de datos propuesto para soportar el catálogo de aplicaciónes y los formularios públicos del portal durante el MVP. Las novedades editoriales se mantienen manualmente en archivos versionados del repositorio.

## Entidades principales

| Entidad                   | Proposito                                                                           | Campos clave                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `portal_app_registry`     | Registrar las aplicaciónes visibles en el portal y su estado actual.                | `id`, `slug`, `name`, `short_description`, `status`, `phase`, `platform`, `entry_url`, `sort_order`, `is_published`, `updated_at` |
| `portal_contact_requests` | Almacenar consultas de soporte y contacto general.                                  | `id`, `name`, `contact_channel`, `topic`, `message`, `status`, `created_at`                                                       |
| `portal_feedback_items`   | Registrar ideas, sugerencias y feedback general de personas técnicas y no técnicas. | `id`, `category`, `name`, `contact_channel`, `message`, `status`, `created_at`                                                    |
| `portal_submission_audit` | Trazar cambios de estado y eventos de procesamiento sobre envíos del portal.        | `id`, `submission_type`, `submission_id`, `event_type`, `actor`, `metadata`, `created_at`                                         |

## Relaciónes

- `portal_contact_requests` 1:N `portal_submission_audit`.
- `portal_feedback_items` 1:N `portal_submission_audit`.

## Reglas de integridad

- `portal_app_registry.slug` debe ser único y estable para permitir trazabilidad y deep linking.
- Las novedades del MVP deben mantenerse en archivos versionados con frontmatter `titulo`, `slug`, `autor`, `fecha_creación`, `fecha_modificación`, `tags` y cuerpo de contenido.
- Sólo registros con `is_published = true` pueden mostrarse en superficies públicas.
- Todos los envíos públicos deben registrar `created_at`, `status` y tipo de registro para auditoría mínima.
- Los campos de contacto deben minimizar datos personales y aceptar únicamente la información necesaria para responder.
- Los assets en Storage deben vincularse por path controlado y no por URL arbitraria persistida por usuario final.
