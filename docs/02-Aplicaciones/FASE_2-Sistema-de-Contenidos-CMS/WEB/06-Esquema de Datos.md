---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - arquitectura
  - esquema-datos
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
---

# Esquema de Datos - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

Entidades de base de datos necesarias para el MVP del CMS en Supabase PostgreSQL.

## Entidades principales

| Entidad               | Proposito                                              | Campos clave                                                                                                                                                                                                                                  |
| --------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content_types`       | Define tipos de contenido con campos personalizados    | `id (uuid pk)`, `name (text)`, `slug (text unique)`, `fields (jsonb)`, `created_at (timestamptz)`, `updated_at (timestamptz)`                                                                                                                 |
| `content_entries`     | Entradas de contenido asociadas a un content type      | `id (uuid pk)`, `content_type_id (uuid fk → content_types)`, `slug (text)`, `status (enum: draft, review, published, archived)`, `data (jsonb)`, `author_id (uuid fk → auth.users)`, `published_at (timestamptz)`, `created_at`, `updated_at` |
| `content_revisions`   | Versionado de entradas; cada cambio crea una revisión  | `id (uuid pk)`, `entry_id (uuid fk → content_entries)`, `revision_number (int)`, `data (jsonb)`, `author_id (uuid fk → auth.users)`, `status (enum)`, `created_at (timestamptz)`                                                              |
| `content_taxonomies`  | Categorías para clasificar contenido                   | `id (uuid pk)`, `name (text)`, `slug (text unique)`, `created_at`, `updated_at`                                                                                                                                                               |
| `content_terms`       | Términos dentro de una taxonomía                       | `id (uuid pk)`, `taxonomy_id (uuid fk → content_taxonomies)`, `name (text)`, `slug (text)`, `created_at`                                                                                                                                      |
| `content_entry_terms` | Relación N:M entre entradas y términos                 | `entry_id (uuid fk → content_entries)`, `term_id (uuid fk → content_terms)`, `pk(entry_id, term_id)`                                                                                                                                          |
| `content_media`       | Referencias a medios almacenados en Supabase Storage   | `id (uuid pk)`, `entry_id (uuid fk → content_entries)`, `storage_path (text)`, `mime_type (text)`, `size_bytes (int)`, `created_at`                                                                                                           |
| `content_audit_log`   | Auditoría de cambios de estado y operaciones sensibles | `id (uuid pk)`, `entry_id (uuid fk → content_entries)`, `action (text)`, `actor_id (uuid fk → auth.users)`, `metadata (jsonb)`, `created_at (timestamptz)`                                                                                    |

## Relaciónes

- `content_types` 1:N `content_entries`
- `content_entries` 1:N `content_revisions`
- `content_taxonomies` 1:N `content_terms`
- `content_terms` N:M `content_entries` (via `content_entry_terms`)
- `content_entries` 1:N `content_media`
- `content_entries` 1:N `content_audit_log`

## Reglas de integridad

- `content_types.slug` es único e inmutable tras creación.
- `content_entries.slug` es único por `content_type_id`.
- Solo puede existir una entrada en estado `published` por slug y content type; al publicar una nueva revisión, la anterior pasa a `archived`.
- `content_revisions.revision_number` es auto-incremental por `entry_id`.
- `content_entry_terms` requiere que el término pertenezca a una taxonomía válida.
- RLS: `content_entries` visible para editores en `draft`/`review`, para revisores en `review`, para todos via API solo en `published`.
- `content_types` y `content_taxonomies` gestionables solo por rol `admin`.
