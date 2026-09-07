---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - arquitectura
  - especificacion-tecnica
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
---

# Especificación Tecnica - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro 6 (SSR) + React 19 (islands)
- Lenguaje principal: TypeScript 5
- Base de datos: Supabase PostgreSQL
- Storage: Supabase Storage (bucket `cms-media`)
- Auth: Supabase Auth con RLS
- Cache: En memoria o Redis (post-MVP) con TTL configurable
- Herramientas de build: Turborepo + Vite
- Testing: Vitest + React Testing Library

## Arquitectura tecnica

- Patrón de arquitectura: Astro API endpoints (SSR) para API de lectura; Astro pages para panel editorial; React islands para formularios y tablas interactivas.
- Modulos principales:
  - `src/apps/cms/src/pages/api/content/` — API REST de lectura.
  - `src/apps/cms/src/pages/admin/` — Panel editorial (content types, entries, taxonomies, media).
  - `src/apps/cms/src/components/` — Componentes UI reutilizando `@repo/ui`.
  - `src/apps/cms/src/lib/content-types.ts` — Validación de campos con Zod.
  - `src/apps/cms/src/lib/cache.ts` — Cache del lado servidor.
  - `src/apps/cms/src/lib/webhooks.ts` — Emisión de webhooks de publicación.
- Dependencias compartidas: `@repo/ui`, `@repo/tailwind-config`, `@repo/api-utils` (log-client), `@repo/auth` (Supabase Auth).

## Modelos de datos

- Modelo de content type: `{ id, name, slug, fields: Field[] }` donde `Field = { name, type, required, options }`.
- Modelo de entrada: `{ id, content_type_id, slug, status, data, author_id, published_at, created_at, updated_at }`.
- Modelo de revisión: `{ id, entry_id, revision_number, data, author_id, status, created_at }`.
- Modelo de término: `{ id, taxonomy_id, name, slug }`.

## Endpoints

| Metodo | Ruta                                          | Proposito                                          |
| ------ | --------------------------------------------- | -------------------------------------------------- |
| GET    | `/api/content/{content_type}`                 | Listar entradas publicadas por content type        |
| GET    | `/api/content/{content_type}?slug={slug}`     | Obtener entrada publicada por slug                 |
| GET    | `/api/content/{content_type}?taxonomy={term}` | Filtrar entradas por término de taxonomía          |
| GET    | `/api/content/search?q={query}`               | Buscar entradas publicadas por texto               |
| POST   | `/api/admin/content-types`                    | Crear content type (admin)                         |
| GET    | `/api/admin/content-types`                    | Listar content types (admin, editor, revisor)      |
| POST   | `/api/admin/entries`                          | Crear entrada (editor)                             |
| PUT    | `/api/admin/entries/{id}`                     | Editar entrada (editor)                            |
| POST   | `/api/admin/entries/{id}/transition`          | Cambiar estado de entrada (editor, revisor, admin) |
| POST   | `/api/admin/media`                            | Subir medio (editor)                               |
| GET    | `/api/admin/taxonomies`                       | Listar taxonomías (admin, editor, revisor)         |
| POST   | `/api/admin/taxonomies`                       | Crear taxonomía (admin)                            |

## Consideraciónes UI/UX

- Navegación principal: Sidebar con secciones Content Types, Entries, Taxonomies, Media, Settings.
- Estados de interfaz: loading (skeleton), empty (ilustración + CTA), error (mensaje + retry), success (toast).
- Accesibilidad base: navegación por teclado, ARIA labels, contraste AA, focus visible.
- Reutiliza `@repo/ui` para shells, cards, headers, filtros, paginación y estados vacíos.
- Preview de contenido en tiempo real al editar (render Markdown a HTML).
