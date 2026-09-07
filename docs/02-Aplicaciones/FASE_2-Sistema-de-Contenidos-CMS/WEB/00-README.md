---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - contenidos
type: app-readme
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[../00-README|Indice de aplicaciones]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Datos-y-Taxonomias-Compartidas|SRS Datos y Taxonomias]]"
---

# Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Metadatos

- Plataforma: WEB
- Estado: draft
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-09-05

## Descripcion

Sistema de gestión de contenidos (CMS) del ecosistema Fósforo. Permite crear, editar, versionar y publicar contenido estructurado (textos litúrgicos, oraciones, biografías de santos, artículos de formación, entradas de blog) que consumen las aplicaciones del ecosistema (Misal, Santopedia, Oraciones, Vida de Misionero, Visita 7 Iglesias, Lectio Divina, entre otras).

El CMS expone una API REST y un panel de administración para gestionar tipos de contenido, taxonomías, flujos de publicación y permisos por rol. Es la fuente de verdad de contenido del ecosistema.

## Validación de la idea

- Las apps de contenido (Misal, Santopedia, Oraciones, etc.) necesitan un repositorio centralizado de contenido estructurado con versionado y flujo editorial.
- Sin un CMS, cada app duplicaría lógica de gestión de contenido, generando inconsistencias y deuda técnica.
- Un CMS compartido permite que editores no técnicos publiquen contenido sin intervención de desarrollo.

## Arquitectura

- **Frontend:** Astro 6 + React 19 (islands) + Tailwind CSS v4 + `@repo/ui`
- **Backend:** Astro API endpoints (SSR) + Supabase (PostgreSQL, Auth, RLS, Storage)
- **Datos:** Supabase PostgreSQL — tablas `content_types`, `content_entries`, `content_revisions`, `content_taxonomies`, `content_terms`, `content_media`
- **Integración:** API REST pública (`/api/content/*`) para apps consumidoras; webhooks de publicación; integración con Motor Litúrgico para contenido dependiente del calendario

## Estado de implementación

- **Completado:** Sin implementación. Documentación draft generada en 2026-09-05.
- **En curso:** Ninguno.
- **Pendiente:** Implementación completa del MVP.

## Ubicación del codigo

- App: `src/apps/cms/` (a crear)
- Componentes: `src/apps/cms/src/components/`
- Estilos: `src/apps/cms/src/styles/` + `src/packages/tailwind-config/` + `src/packages/ui/`
- API: `src/apps/cms/src/pages/api/`
- Almacenamiento de medios: Supabase Storage

## Alcance MVP

| ID          | Funcionalidad                                                    | Prioridad |
| ----------- | ---------------------------------------------------------------- | --------- |
| CMS-MVP-001 | Gestión de tipos de contenido (content types) con campos custom  | Must      |
| CMS-MVP-002 | Crear, editar, versionar y publicar entradas de contenido        | Must      |
| CMS-MVP-003 | Taxonomías y términos para clasificar contenido                  | Must      |
| CMS-MVP-004 | Flujo editorial: borrador → revisión → publicado → archivado     | Must      |
| CMS-MVP-005 | Permisos por rol (editor, revisor, administrador) con RLS        | Must      |
| CMS-MVP-006 | API REST de lectura para apps consumidoras con cache             | Must      |
| CMS-MVP-007 | Gestión de medios (imágenes) con Supabase Storage                | Should    |
| CMS-MVP-008 | Búsqueda de contenido por texto y taxonomía                      | Should    |
| CMS-MVP-009 | Webhook de publicación para invalidar cache en apps consumidoras | Should    |

## No alcance MVP

- Editor visual WYSIWYG avanzado (MVP usa Markdown + campos estructurados)
- Versionado de tipos de contenido (solo versionado de entradas)
- Multi-idioma con traducción automática
- Flujos de aprobación multi-nivel customizables
- Headless CMS como SaaS externo

## KPI principal

- Tiempo desde creación hasta publicación de una entrada: < 30 minutos para contenido simple
- Disponibilidad de la API de lectura: 99.9%
- Tasa de apps consumidoras integradas al CMS: 100% de apps de contenido de Fase 2

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | draft  |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | draft  |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | draft  |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | draft  |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | draft  |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificacion%20Tecnica.md)           | draft  |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | draft  |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | draft  |

## Documentos complementarios

| Documento                                                   | Descripcion                              | Estado |
| ----------------------------------------------------------- | ---------------------------------------- | ------ |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)               | Estrategia y matriz de pruebas unitarias | draft  |
| [09-Especificación Tecnica](09-Especificacion%20Tecnica.md) | Stack, modulos e implementación          | draft  |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
