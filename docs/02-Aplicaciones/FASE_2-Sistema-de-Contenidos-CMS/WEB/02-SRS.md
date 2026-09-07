---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - srs
type: app-srs
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `FR-CMS-*`, `NFR-CMS-*`, `IR-CMS-*`, `CA-CMS-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Proposito y alcance tecnico

El CMS es un servicio web que gestiona contenido estructurado del ecosistema Fósforo. Expone una API REST de lectura para apps consumidoras y un panel de administración para editores. Almacena tipos de contenido, entradas, revisiones, taxonomías y medios en Supabase PostgreSQL con RLS por rol.

## 3. Actores

- Editor: crea y edita entradas de contenido en estado borrador.
- Revisor: aprueba o rechaza entradas en estado revisión.
- Administrador: gestiona tipos de contenido, taxonomías, roles y configuración.
- App consumidora (sistema): lee contenido publicado via API REST con API key.

## 4. Requisitos funcionales

| ID         | Requisito                                                                                                                         | Criterio verificable                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| FR-CMS-001 | El sistema debe permitir definir tipos de contenido con campos personalizados (texto, número, fecha, markdown, referencia, media) | Un administrador puede crear un content type "oración" con campos título, cuerpo, autor, liturgia_ref                                     |
| FR-CMS-002 | El sistema debe permitir crear, editar y versionar entradas de contenido asociadas a un content type                              | Al editar una entrada publicada, se crea una revisión nueva sin perder la versión publicada                                               |
| FR-CMS-003 | El sistema debe soportar taxonomías y términos para clasificar entradas                                                           | Una entrada puede asociarse a múltiples términos de múltiples taxonomías                                                                  |
| FR-CMS-004 | El sistema debe implementar un flujo editorial con estados: borrador, revisión, publicado, archivado                              | Un editor puede mover una entrada de borrador a revisión, un revisor de revisión a publicado, y un administrador de publicado a archivado |
| FR-CMS-005 | El sistema debe aplicar permisos por rol (editor, revisor, administrador) con RLS en Supabase                                     | Un editor no puede publicar directamente ni archivar; un revisor no puede crear content types; un administrador puede todo                |
| FR-CMS-006 | El sistema debe exponer una API REST de lectura que devuelve entradas publicadas por content type, taxonomía y slug               | `GET /api/content/{content_type}?taxonomy={term}&slug={slug}` devuelve JSON con entradas publicadas                                       |
| FR-CMS-007 | La API de lectura debe aplicar cache del lado servidor con TTL configurable por content type                                      | Una segunda petición dentro del TTL responde desde cache sin consultar la base                                                            |
| FR-CMS-008 | El sistema debe permitir subir, almacenar y referenciar medios (imágenes) via Supabase Storage                                    | Un editor puede subir una imagen y referenciarla desde un campo media de una entrada                                                      |
| FR-CMS-009 | El sistema debe permitir buscar contenido por texto y taxonomía dentro del panel editorial                                        | El editor escribe "padre nuestro" y obtiene entradas que coinciden en título o cuerpo                                                     |
| FR-CMS-010 | El sistema debe emitir un webhook de publicación cuando una entrada cambia a estado publicado                                     | El webhook incluye content_type, slug y timestamp; las apps consumidoras pueden invalidar su cache                                        |
| FR-CMS-011 | El sistema debe integrar el SDK de RUM para reportar pageviews y eventos de producto del panel editorial                          | El panel editorial reporta pageview al cargar y evento `cms.entry.published` al publicar                                                  |

## 5. Requisitos no funcionales

| ID          | Requisito                   | Objetivo                                                                     |
| ----------- | --------------------------- | ---------------------------------------------------------------------------- |
| NFR-CMS-001 | Disponibilidad              | 99.9% mensual para API de lectura                                            |
| NFR-CMS-002 | Rendimiento API de lectura  | p95 < 200ms con cache caliente                                               |
| NFR-CMS-003 | Rendimiento panel editorial | p95 < 1s para operaciones CRUD de entradas                                   |
| NFR-CMS-004 | Seguridad                   | RLS en todas las tablas; API de lectura con API key; panel con Supabase Auth |
| NFR-CMS-005 | Escalabilidad               | Soportar 10.000 entradas y 50 content types sin degradación                  |
| NFR-CMS-006 | Tamaño de medios            | Imágenes optimizadas a máximo 2MB; formatos webp/jpeg                        |

## 6. Integraciónes

| ID         | Integración                                 | Contrato                                                                                                   | Version |
| ---------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------- |
| IR-CMS-001 | Supabase Auth (Sistema de Logueo)           | OAuth/SSO con roles editor, revisor, admin                                                                 | v1      |
| IR-CMS-002 | Supabase PostgreSQL                         | Tablas content_types, content_entries, content_revisions, content_taxonomies, content_terms, content_media | v1      |
| IR-CMS-003 | Supabase Storage                            | Bucket `cms-media` para imágenes                                                                           | v1      |
| IR-CMS-004 | Sistema de Notificaciones                   | Evento `cms.entry.published` para notificar a revisores y editores                                         | v1      |
| IR-CMS-005 | App Log (Observabilidad)                    | Ingesta de logs operativos via `@repo/api-utils/log-client`                                                | v1      |
| IR-CMS-006 | RUM (app Log)                               | SDK compartido para pageviews y Web Vitals                                                                 | v1      |
| IR-CMS-007 | Apps consumidoras (Misal, Santopedia, etc.) | API REST `GET /api/content/*` con API key                                                                  | v1      |

## 7. Criterios de aceptación

| ID         | Criterio                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| CA-CMS-001 | Un administrador crea un content type "oración" con campos título, cuerpo (markdown), autor, liturgia_ref y lo publica                   |
| CA-CMS-002 | Un editor crea una entrada "Padre Nuestro", la envía a revisión, un revisor la aprueba y la entrada queda publicada y disponible via API |
| CA-CMS-003 | Una app consumidora obtiene `GET /api/content/oracion?slug=padre-nuestro` y recibe JSON con título, cuerpo renderizado y metadatos       |
| CA-CMS-004 | Un editor no puede publicar directamente ni archivar; un revisor no puede crear content types                                            |
| CA-CMS-005 | Al publicar una entrada, se emite un webhook que las apps consumidoras pueden recibir                                                    |
| CA-CMS-006 | El panel editorial reporta pageviews y eventos de producto al SDK de RUM                                                                 |

## 8. Trazabilidad PRD -> SRS

| PRD         | SRS                    |
| ----------- | ---------------------- |
| PRD-CMS-001 | FR-CMS-001             |
| PRD-CMS-002 | FR-CMS-002             |
| PRD-CMS-003 | FR-CMS-003             |
| PRD-CMS-004 | FR-CMS-004             |
| PRD-CMS-005 | FR-CMS-005             |
| PRD-CMS-006 | FR-CMS-006, FR-CMS-007 |
| PRD-CMS-007 | FR-CMS-008             |
| PRD-CMS-008 | FR-CMS-009             |
| PRD-CMS-009 | FR-CMS-010             |
