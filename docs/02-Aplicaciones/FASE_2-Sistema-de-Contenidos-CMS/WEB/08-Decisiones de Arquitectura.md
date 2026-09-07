---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - arquitectura
  - decisiones
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
---

# Decisiones de Arquitectura - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto

- Plataforma objetivo: WEB
- Alcance: MVP de CMS como app del ecosistema Fósforo, consumiendo Supabase y sirviendo a apps de contenido de Fase 2.
- Stack: Astro 6 + React 19 + Tailwind CSS v4 + Supabase (PostgreSQL, Auth, RLS, Storage).

## Funcionalidades generales obligatorias

- Gestión de content types con campos personalizados (JSON schema en DB).
- Flujo editorial con estados y permisos por rol.
- API REST de lectura con cache del lado servidor.
- Integración con Sistema de Logueo (Auth), Sistema de Notificaciones, app Log (RUM).
- SDK de RUM integrado desde el día 1.

## Decisiones clave

| ID          | Decision                                                       | Motivo                                                                                                   | Impacto                                       |
| ----------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| ADR-CMS-001 | Astro 6 + React 19 (islands) para el panel editorial           | Consistencia con el ecosistema; SSR para SEO de contenido público; islands para interactividad del panel | Usa `@repo/ui` y `@repo/tailwind-config`      |
| ADR-CMS-002 | Supabase PostgreSQL como base de datos relacional con RLS      | Seguridad por fila, roles nativos, auditoría via triggers                                                | Necesita migración inicial de schema          |
| ADR-CMS-003 | Campos personalizados como `jsonb` en `content_entries.data`   | Flexibilidad sin migrar schema por cada content type nuevo                                               | Validación de campos en capa de aplicación    |
| ADR-CMS-004 | Cache del lado servidor con TTL configurable por content type  | Reduce carga en DB y mejora p95 de API de lectura                                                        | Requiere invalidación por webhook al publicar |
| ADR-CMS-005 | Markdown + campos estructurados en lugar de WYSIWYG            | Simplifica MVP, evita XSS y reduce superficie de ataque                                                  | Se pierde edición visual rica; post-MVP       |
| ADR-CMS-006 | Supabase Storage para medios con optimización a webp           | Separación de medios de base relacional; optimización automática                                         | Dependencia de Supabase Storage               |
| ADR-CMS-007 | API REST con API key por app consumidora (no Auth por usuario) | Las apps consumen en runtime sin sesión de usuario                                                       | Rotación de keys y rate limiting obligatorios |

## Alternativas consideradas

- Alternativa A: Headless CMS externo (Strapi, Sanity, Contentful). Descartado por dependencia externa, costo y falta de control sobre RLS.
- Alternativa B: Base de datos NoSQL (MongoDB). Descartado por falta de RLS nativa y consistencia con el ecosistema (Supabase PostgreSQL).
- Alternativa C: GraphQL en lugar de REST. Descartado para MVP por simplicidad; post-MVP si las apps consumidoras lo requieren.

## Riesgos y mitigaciónes

- Riesgo 1: Campos `jsonb` sin validación de schema en DB. Mitigación: validación estricta en capa de aplicación con Zod.
- Riesgo 2: Cache stale si webhook falla. Mitigación: TTL máximo de 5 min + invalidación manual.
- Riesgo 3: Crecimiento de content types fuera de control. Mitigación: gobernanza por rol admin.
