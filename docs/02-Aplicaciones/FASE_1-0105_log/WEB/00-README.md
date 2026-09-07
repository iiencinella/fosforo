---
tags:
  - proyecto/fosforo
  - aplicacion/log
  - monitoreo
  - observabilidad
  - rum
  - analiticas
type: app-readme
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[../00-README|Indice de aplicaciones]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Observabilidad-y-Auditoria|SRS Observabilidad]]"
  - "[[../../plans/2026-09-05-plan-maestro-fase-2-ecosistema|Plan Maestro Fase 2]]"
---

# 0105_log

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

Sistema de observabilidad interna y analítica de producto del ecosistema Fósforo. Recibe, almacena y visualiza:

1. **Logs operativos** (MVP vigente): eventos y errores generados por todas las apps del ecosistema, con búsqueda, filtros, dashboard ops y alertas básicas.
2. **RUM (Real User Monitoring)** (extensión 2026-09-05): telemetría anonimizada de usuarios reales en las apps del ecosistema (pageviews, Web Vitals LCP/INP/CLS, errores de frontend, eventos de producto).
3. **Analíticas de producto** (extensión 2026-09-05): dashboard de producto con embudos, retención, top páginas y segmentación por app, separado del dashboard operativo.

El acceso está restringido a usuarios con roles `dev`, `ops` o `product` mediante Supabase Auth + RLS. El dashboard de producto es accesible para roles `dev`, `ops` y `product`; el dashboard operativo solo para `dev` y `ops`.

## Validación de la idea

### Logs operativos (MVP vigente)

- Existe necesidad real de centralizar logs entre apps del ecosistema (sin Log, no hay visibilidad centralizada).
- Reduce tiempo de diagnóstico de incidentes al unificar eventos en un solo panel.
- Permite detectar tempranamente patrones de error recurrentes.

### RUM y analíticas (extensión)

- Sin RUM, las apps del ecosistema no tienen visibilidad sobre rendimiento percibido por usuarios reales (Web Vitals) ni sobre comportamiento de uso (pageviews, embudos).
- Un dashboard de producto unificado permite a dev/ops/product medir impacto de features sin herramientas externas.
- Un SDK compartido garantiza consistencia y minimiza esfuerzo de integración en cada app.

## Arquitectura

- **Frontend:** Astro 6 + React 19 (islands) + Tailwind CSS v4 + `@repo/ui`
- **Backend:** Astro API endpoints (SSR) + Supabase (PostgreSQL, Auth, RLS)
- **Datos operativos:** Supabase PostgreSQL — tablas `log_entries`, `api_keys`
- **Datos RUM:** Supabase PostgreSQL — tablas `rum_events`, `rum_vitals`, `rum_sessions`
- **Integración:**
  - API REST `POST /api/logs` para ingesta de logs operativos
  - API REST `POST /api/rum` y `POST /api/rum/vitals` para ingesta RUM
  - SDK compartido `@repo/analytics` integrable en apps del ecosistema
  - Webhooks de emisión cuando apps publican contenido (CMS)

## Estado de implementación

### Logs operativos (MVP)

- **Completado:** MVP funcional de punta a punta: ingesta con API key + rate limiting (100 req/min), listado con paginación y filtros (nivel, app, fechas, texto), vista detalle, dashboard ops con métricas agregadas en SQL, alertas por threshold, auth dev/ops con revocación de sesión, secure headers y matriz de tests unitarios completa (29 tests). Integración de envío activa en portal, biblia, cancionero, usuario, administracion, calendario y horarios via `@repo/api-utils/log-client`.
- **En curso:** Verificación E2E con Supabase remoto (ingesta real desde cada app).

### RUM y analíticas (extensión 2026-09-05)

- **Pendiente:**
  - SDK `@repo/analytics` (<5KB, sendBeacon, no bloqueante, try-catch global)
  - Ingesta RUM: tablas, endpoints, validación, rate limiting
  - Captura de Web Vitals (LCP, INP, CLS) automática
  - Captura de errores de frontend con contexto
  - Dashboard de producto: embudos, retención, top páginas, segmentación
  - Consentimiento y anonimización (DNT, sin PII)
  - Sampling configurable por app y tipo de evento

## Ubicación del codigo

- App: `src/apps/log/`
- Componentes: `src/apps/log/src/components/`
- Estilos: `src/apps/log/src/styles/` + `src/packages/tailwind-config/` + `src/packages/ui/`
- API: `src/apps/log/src/pages/api/`
- SDK RUM (a crear): `src/packages/analytics/`

## Alcance MVP

### MVP Logs operativos (vigente)

| ID          | Funcionalidad                                                      | Prioridad |
| ----------- | ------------------------------------------------------------------ | --------- |
| LOG-MVP-001 | Ingesta de logs via API REST (`POST /api/logs`)                    | Must      |
| LOG-MVP-002 | Listado paginado de logs con filtros (nivel, app, fecha, texto)    | Must      |
| LOG-MVP-003 | Vista detalle de log individual con metadata y stack trace         | Must      |
| LOG-MVP-004 | Dashboard con metricas basicas (total logs, errores 24h, top apps) | Must      |
| LOG-MVP-005 | Autenticacion y autorizacion por rol (dev/ops)                     | Must      |
| LOG-MVP-006 | Alertas basicas en UI (threshold de errores por app)               | Should    |

### MVP RUM y analíticas (extensión)

| ID          | Funcionalidad                                                                                 | Prioridad |
| ----------- | --------------------------------------------------------------------------------------------- | --------- |
| RUM-MVP-001 | SDK `@repo/analytics` integrable (init, track, captureVitals, respectDNT)                     | Must      |
| RUM-MVP-002 | Ingesta de eventos RUM via `POST /api/rum` con taxonomía común                                | Must      |
| RUM-MVP-003 | Captura automática de Web Vitals (LCP, INP, CLS) por página                                   | Must      |
| RUM-MVP-004 | Captura de errores de frontend con contexto (app, versión, browser, stack)                    | Must      |
| RUM-MVP-005 | Dashboard de producto: embudos, retención, top páginas, segmentación por app                  | Must      |
| RUM-MVP-006 | Consentimiento del usuario y respeto de DNT (sin PII, sin IP, sin user ID crudo)              | Must      |
| RUM-MVP-007 | Sampling configurable por app y tipo de evento (default 100% pageview/errors, 10% custom)     | Should    |
| RUM-MVP-008 | Separación de roles: dashboard operativo (dev/ops) vs dashboard de producto (dev/ops/product) | Must      |

## No alcance MVP

### Logs operativos

- Alertas por email/Slack/webhook
- Deduplicacion automatica de logs
- Exportacion de logs
- Correlacion de trazas distribuidas

### RUM y analíticas

- Session recording / replay
- Heatmaps
- Data warehousing avanzado
- Analítica de marketing con PII
- Tracking cross-session de usuarios
- Integración con herramientas externas (Google Analytics, Mixpanel, PostHog)

## KPI principal

### Logs operativos

- Tiempo entre generacion de un error y su visualizacion en el dashboard (< 5 segundos)
- Tasa de adopcion: % de apps del ecosistema que envian logs

### RUM y analíticas

- Latencia p95 de ingesta RUM < 1 segundo
- 100% de apps nuevas del ecosistema integran SDK RUM desde el día 1
- SDK `@repo/analytics` < 5KB comprimido
- Tasa de eventos RUM perdidos < 2%

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
- Esta app se extiende para incluir RUM y analíticas (ver [Plan Maestro Fase 2](../../plans/2026-09-05-plan-maestro-fase-2-ecosistema)).
