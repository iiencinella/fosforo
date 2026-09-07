---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
  - web
  - fase-2
  - srs
type: app-srs
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[01-PRD]]"
  - "[[03-FRD]]"
  - "[[docs/00-General/07-SRS-Maestro|SRS Maestro]]"
---

# Oraciones - Web - SRS

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Requisitos funcionales

| ID          | Requisito                                 | Criterio verificable                                                                                                                                                                                                                                       |
| ----------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-ORAC-001 | Listado de oraciones servido desde el CMS | El endpoint interno `GET /api/content/oracion` devuelve las oraciones filtrables por taxonomía (`categoria`, `intencion`, `devocion`, `rosario`); la app nunca mantiene contenido propio; cuando la taxonomía está vacía se muestra estado vacío definido. |
| FR-ORAC-002 | Ficha de oración por slug                 | `GET /oracion/[slug]` renderiza la oración completa con título, texto, intención de uso, fuente y breadcrumbs por categoría; slug inexistente devuelve 404 con estado definido.                                                                            |
| FR-ORAC-003 | Buscador full-text                        | Entrada del usuario de >= 2 caracteres dispara búsqueda full-text sobre título/texto del catálogo del CMS; resultados paginados y con resaltado simple.                                                                                                    |
| FR-ORAC-004 | Modo lectura con tema y tamaño de fuente  | El usuario puede alternar tema claro/oscuro y 3 tamaños de fuente; se persiste en `localStorage` y se aplica sin parpadeo (FOUC) en la carga.                                                                                                              |
| FR-ORAC-005 | Favoritos por oración                     | Usuario autenticado marca/desmarca favorito por `content_ref`; persistido en `oraciones.favorites` en Supabase con RLS; usuario anónimo ve CTA de iniciar sesión, no error.                                                                                |
| FR-ORAC-006 | Colecciones personales CRUD               | Usuario autenticado crea, lista, renombra y elimina colecciones propias en `oraciones.collections`; agrega/quita oraciones en `collection_items` con orden manual; acceso restringido por RLS a filas propias.                                             |
| FR-ORAC-007 | RUM de eventos de uso                     | La app emite `oracion.viewed` (slug, categoría) y `oracion.searched` (longitud de consulta, resultados, sin texto completo de la consulta) al Sistema de Log desde el primer despliegue.                                                                   |
| FR-ORAC-008 | Reporte de error de contenido             | Desde la ficha, el usuario reporta un problema (select de motivo + comentario opcional) a `oraciones.reports` (insert-only, con `session_hash` anónimo); sin requisito de sesión.                                                                          |
| FR-ORAC-009 | Recordatorio de devoción                  | Usuario autenticado puede programar recordatorio (tipo de devoción + hora) que se envía vía Sistema de Notificaciones; la app solo escribe la preferencia en `oraciones.preferences`, no envía notificaciones propias.                                     |
| FR-ORAC-010 | Estados de UI completos                   | Cada vista define estado de carga (skeleton), error (con reintento), vacío (con CTA) y éxito; no existe vista sin estados definidos.                                                                                                                       |

## Requisitos no funcionales

| ID           | Requisito                 | Objetivo                                                                  |
| ------------ | ------------------------- | ------------------------------------------------------------------------- |
| NFR-ORAC-001 | Disponibilidad            | 99.5 % MVP                                                                |
| NFR-ORAC-002 | Rendimiento (LCP p75)     | < 2.5 s                                                                   |
| NFR-ORAC-003 | TTFB p95                  | < 800 ms (SSR cacheado en CDN)                                            |
| NFR-ORAC-004 | Accesibilidad             | WCAG 2.2 AA                                                               |
| NFR-ORAC-005 | Cobertura de tests        | >= 80 % global, >= 90 % en módulos críticos (colecciones, favoritos)      |
| NFR-ORAC-006 | Privacidad                | RUM sin PII; reportes anónimos con hash                                   |
| NFR-ORAC-007 | Consistencia de contenido | Fuente única: CMS. Cero duplicación de contenido en la app o en BD propia |

## Integraciones

| ID          | Integración                            | Contrato                                                                                 | Version |
| ----------- | -------------------------------------- | ---------------------------------------------------------------------------------------- | ------- |
| IR-ORAC-001 | CMS (contenido oracional + taxonomías) | `GET /api/content/oracion` (filtros por taxonomía, slug)                                 | v1      |
| IR-ORAC-002 | Sistema de Logueo (Better Auth)        | Autenticación y sesión requeridas para favoritos/colecciones; middleware de autorización | v1      |
| IR-ORAC-003 | Sistema de Notificaciones              | Recordatorio de devoción: la app entrega preferencia programada; Notificaciones envía    | v1      |
| IR-ORAC-004 | Log (RUM + logs)                       | Eventos `oracion.viewed`, `oracion.searched`, errores de frontend                        | v1      |

## Criterios de aceptación transversales

- Todo el contenido mostrado proviene del CMS; no existe texto oracional hardcodeado en la app ni en la BD de Supabase.
- Toda fila personal de Supabase está protegida por RLS con `user_id` = `auth.uid()`.
- La app funciona degradada si el CMS no responde: cache SSR + banner informativo, sin crash.
- Sin sesión, las vistas de listado, ficha y búsqueda son 100 % funcionales.

## Matriz de trazabilidad SRS

| Requisito SRS | Origen PRD       | Refinado en FRD | Cubierto por Tests       |
| ------------- | ---------------- | --------------- | ------------------------ |
| FR-ORAC-001   | PRD-ORAC-001     | UC-ORAC-001     | TC-ORAC-001, TC-ORAC-002 |
| FR-ORAC-002   | PRD-ORAC-002     | UC-ORAC-002     | TC-ORAC-003, TC-ORAC-004 |
| FR-ORAC-003   | PRD-ORAC-003     | UC-ORAC-003     | TC-ORAC-005, TC-ORAC-006 |
| FR-ORAC-004   | PRD-ORAC-004     | UC-ORAC-004     | TC-ORAC-007              |
| FR-ORAC-005   | PRD-ORAC-005     | UC-ORAC-005     | TC-ORAC-008, TC-ORAC-009 |
| FR-ORAC-006   | PRD-ORAC-006     | UC-ORAC-006     | TC-ORAC-010, TC-ORAC-011 |
| FR-ORAC-007   | PRD-ORAC-007     | —               | TC-ORAC-012              |
| FR-ORAC-008   | PRD-ORAC-008     | UC-ORAC-007     | TC-ORAC-013              |
| FR-ORAC-009   | PRD-ORAC-009     | UC-ORAC-008     | TC-ORAC-014              |
| FR-ORAC-010   | PRD-ORAC-001/002 | UC-ORAC-001/002 | TC-ORAC-015              |
