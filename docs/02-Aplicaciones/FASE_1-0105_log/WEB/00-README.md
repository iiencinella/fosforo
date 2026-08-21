---
tags:
  - proyecto/fosforo
  - aplicacion/log
  - monitoreo
  - observabilidad
type: app-readme
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-08-21
related:
  - "[[../00-README|Indice de aplicaciones]]"
---

# 0105_log

## Metadatos

- Plataforma: WEB
- Estado: vigente
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-05-26

## Descripcion

Sistema de observabilidad interna del ecosistema Fósforo. Recibe, almacena y visualiza logs, eventos y errores generados por todas las aplicaciones del ecosistema. Permite a los equipos de desarrollo y operaciones detectar patrones, anomalías y problemas en tiempo real, con herramientas de visualización, búsqueda y alertas básicas.

El acceso está restringido exclusivamente a usuarios con roles `dev` u `ops` mediante Supabase Auth + RLS.

## Validación de la idea

- Existe necesidad real de centralizar logs entre apps del ecosistema (hoy no hay visibilidad centralizada).
- Reduce tiempo de diagnóstico de incidentes al unificar eventos en un solo panel.
- Permite detectar tempranamente patrones de error recurrentes.

## Arquitectura

- **Frontend:** Astro 6 + React 19 (islands) + Tailwind CSS v4 + `@repo/ui`
- **Backend:** Astro API endpoints (SSR) + Supabase (PostgreSQL, Auth, RLS)
- **Datos:** Supabase PostgreSQL — tabla principal `log_entries`
- **Integración:** API REST `POST /api/logs` para ingesta desde apps del ecosistema

## Estado de implementación

- **Completado:** MVP funcional de punta a punta: ingesta con API key + rate limiting (100 req/min), listado con paginación y filtros (nivel, app, fechas, texto), vista detalle, dashboard ops con métricas agregadas en SQL, alertas por threshold, auth dev/ops con revocación de sesión, secure headers y matriz de tests unitarios completa (29 tests). Integración de envío activa en portal, biblia, cancionero, usuario, administracion, calendario y horarios via `@repo/api-utils/log-client`.
- **En curso:** Verificación E2E con Supabase remoto (ingesta real desde cada app).
- **Pendiente:** Alertas por email/Slack/webhook; exportación; trazas distribuidas (fuera de MVP).

Detalle del proceso: [12-Plan-Desarrollo-MVP](12-Plan-Desarrollo-MVP.md).

## Ubicación del codigo

- App: `src/apps/log/`
- Componentes: `src/apps/log/src/components/`
- Estilos: `src/apps/log/src/styles/` + `src/packages/tailwind-config/` + `src/packages/ui/`
- API: `src/apps/log/src/pages/api/`

## Alcance MVP

| ID          | Funcionalidad                                                      | Prioridad |
| ----------- | ------------------------------------------------------------------ | --------- |
| LOG-MVP-001 | Ingesta de logs via API REST (`POST /api/logs`)                    | Must      |
| LOG-MVP-002 | Listado paginado de logs con filtros (nivel, app, fecha, texto)    | Must      |
| LOG-MVP-003 | Vista detalle de log individual con metadata y stack trace         | Must      |
| LOG-MVP-004 | Dashboard con metricas basicas (total logs, errores 24h, top apps) | Must      |
| LOG-MVP-005 | Autenticacion y autorizacion por rol (dev/ops)                     | Must      |
| LOG-MVP-006 | Alertas basicas en UI (threshold de errores por app)               | Should    |

## No alcance MVP

- Alertas por email/Slack/webhook
- Deduplicacion automatica de logs
- Exportacion de logs
- Correlacion de trazas distribuidas

## KPI principal

- Tiempo entre generacion de un error y su visualizacion en el dashboard (< 5 segundos)
- Tasa de adopcion: % de apps del ecosistema que envian logs

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------- |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | vigente |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | vigente |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | vigente |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | vigente |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | vigente |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md)      | vigente |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | vigente |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | vigente |

## Documentos complementarios

| Documento                                                        | Descripcion                              | Estado  |
| ---------------------------------------------------------------- | ---------------------------------------- | ------- |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)                    | Estrategia y matriz de pruebas unitarias | vigente |
| [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md) | Stack, modulos e implementación          | vigente |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
