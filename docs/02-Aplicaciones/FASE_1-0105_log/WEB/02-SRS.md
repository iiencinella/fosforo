---
tags:
  - proyecto/fosforo
  - srs
  - aplicacion/log
  - rum
  - analiticas
type: app-srs
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
  - "[[01-PRD|PRD Log]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Observabilidad-y-Auditoria|SRS Observabilidad]]"
---

# SRS - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `FR-0105-LOG-*`, `NFR-0105-LOG-*`, `IR-0105-LOG-*`, `CA-0105-LOG-*` (logs operativos)
- ID base RUM: `FR-LOG-RUM-*`, `NFR-LOG-RUM-*`, `IR-LOG-RUM-*`, `CA-LOG-RUM-*` (RUM y analíticas)
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Proposito y alcance tecnico

Sistema web de observabilidad operativa y analítica de producto para el ecosistema Fósforo. Proporciona:

1. **Logs operativos** (MVP vigente): ingesta centralizada de logs via API REST, visualizacion con dashboard de metricas, listado con filtros, vista detalle y alertas basicas en UI.
2. **RUM y analíticas** (extensión): ingesta anonimizada de eventos de producto (pageview, custom events), captura automática de Web Vitals (LCP, INP, CLS), captura de errores de frontend y dashboard de producto (embudos, retención, top páginas).

El acceso está restringido mediante Supabase Auth y RLS. Roles: `dev` y `ops` para dashboard operativo y producto; `product` solo para dashboard de producto.

## 3. Actores

### Logs operativos

- **Usuario dev:** Desarrollador del ecosistema. Puede ver todos los logs, buscar, filtrar y acceder al detalle. No puede configurar alertas.
- **Usuario ops:** Operaciones/DevOps. Puede ver todo igual que dev, mas configurar alertas y ver dashboard de metricas.
- **App emisora:** Aplicacion del ecosistema que envia logs via API. Se autentica via API key.

### RUM y analíticas

- **Usuario dev:** Puede ver dashboard de producto y métricas RUM para debugging de rendimiento.
- **Usuario ops:** Puede ver dashboard de producto y métricas RUM para monitoreo de salud de apps.
- **Usuario product:** Puede ver dashboard de producto, construir embudos y analizar retención.
- **App anfitriona:** Aplicacion del ecosistema que integra el SDK `@repo/analytics` para reportar telemetría.

## 4. Requisitos funcionales

### Logs operativos (MVP vigente)

| ID              | Requisito                             | Criterio verificable                                            |
| --------------- | ------------------------------------- | --------------------------------------------------------------- |
| FR-0105-LOG-001 | Ingesta de logs via POST /api/logs    | Enviar log valido → respuesta 201 + log visible en DB           |
| FR-0105-LOG-002 | Validacion de payload en ingesta      | Payload invalido → respuesta 422 con detalle de error           |
| FR-0105-LOG-003 | Autenticacion en API de ingesta       | Request sin API key → respuesta 401                             |
| FR-0105-LOG-004 | Listado de logs con paginacion        | GET /logs devuelve pagina de 50 logs con total count            |
| FR-0105-LOG-005 | Filtro por nivel de severidad         | Filtrar por `level=error` devuelve solo logs de tipo error      |
| FR-0105-LOG-006 | Filtro por app origen                 | Filtrar por `app=portal` devuelve solo logs de portal           |
| FR-0105-LOG-007 | Filtro por rango de fechas            | Filtrar por `since` y `until` devuelve logs en ese rango        |
| FR-0105-LOG-008 | Busqueda por texto libre              | Buscar "timeout" devuelve logs cuyo message contiene "timeout"  |
| FR-0105-LOG-009 | Vista detalle de log                  | Al hacer clic en un log se muestra toda su metadata formateada  |
| FR-0105-LOG-010 | Dashboard con metricas                | Muestra: total logs, errores 24h, top 5 apps, grafico evolutivo |
| FR-0105-LOG-011 | Alerta por threshold de errores       | Si app X supera N errores/min, se muestra marcador en UI        |
| FR-0105-LOG-012 | Autenticacion de usuarios en frontend | Login via Supabase Auth; solo usuarios con rol dev/ops acceden  |
| FR-0105-LOG-013 | Control de acceso por rol             | Usuario sin rol dev/ops ve pagina de acceso denegado            |

### RUM y analíticas (extensión)

| ID              | Requisito                                                                                     | Criterio verificable                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-LOG-RUM-001  | SDK `@repo/analytics` no bloqueante, `sendBeacon`/async, < 5KB comprimido                     | Una página con SDK carga sin diferencia perceptible de performance vs sin SDK                                                                                       |
| FR-LOG-RUM-002  | Ingesta de eventos de producto via `POST /api/rum` con taxonomía común                        | Dev llama `analytics.track('misal.lectio.started', {lectura: 'mc 5,1-12'})` → evento aparece en tabla `rum_events` con `app`, `event_name`, `page_path`, `metadata` |
| FR-LOG-RUM-003  | Captura automática de Web Vitals (LCP, INP, CLS) por página                                   | Al cargar una página, el SDK captura LCP/INP/CLS y los envía via `POST /api/rum/vitals`                                                                             |
| FR-LOG-RUM-004  | Captura de errores de frontend con contexto (app, versión, browser, stack)                    | Un error JS en una página se reporta con contexto completo en `rum_events` con `event_name='frontend.error'`                                                        |
| FR-LOG-RUM-005  | Dashboard de producto con embudos, retención, top páginas, segmentación por app               | Usuario con rol `product` puede ver `GET /dashboard-producto` con embudo de Misal construido solo con eventos de producto                                           |
| FR-LOG-RUM-006  | Consentimiento del usuario y respeto de DNT (sin PII, sin IP, sin user ID crudo)              | SDK no envía eventos si `navigator.doNotTrack='1'` o si el usuario rechazó consentimiento; payload nunca contiene user ID ni IP                                     |
| FR-LOG-RUM-007  | Sampling configurable por app y tipo de evento                                                | Admin configura `sampling: { pageview: 1.0, custom: 0.1 }` para una app; solo 10% de eventos custom se reportan                                                     |
| FR-LOG-RUM-R008 | Separación de roles: dashboard operativo (dev/ops) vs dashboard de producto (dev/ops/product) | Usuario con rol `product` no puede acceder a `/dashboard` (operativo); usuarios con rol `dev`/`ops` pueden acceder a ambos                                          |

## 5. Requisitos no funcionales

### Logs operativos

| ID               | Requisito                  | Objetivo                                                                               |
| ---------------- | -------------------------- | -------------------------------------------------------------------------------------- |
| NFR-0105-LOG-001 | Disponibilidad/Estabilidad | 99.5% uptime en horario laboral (08-20 UTC-3)                                          |
| NFR-0105-LOG-002 | Rendimiento - Ingesta      | Respuesta a POST /api/logs en < 500ms (p95)                                            |
| NFR-0105-LOG-003 | Rendimiento - Consulta     | Listado de logs con filtros en < 2s (p95) para tablas de hasta 1M registros            |
| NFR-0105-LOG-004 | Seguridad - Acceso         | Solo usuarios autenticados con rol dev/ops; RLS en tabla log_entries                   |
| NFR-0105-LOG-005 | Seguridad - Ingesta        | API key requerida para POST /api/logs; validacion y sanitizacion de payload            |
| NFR-0105-LOG-006 | Escalabilidad              | Soporte para > 100 logs/minuto sin degradacion                                         |
| NFR-0105-LOG-007 | Mantenibilidad             | Codigo con tipos TypeScript estrictos; componentes UI en @repo/ui si son reutilizables |

### RUM y analíticas

| ID              | Requisito                  | Objetivo                                                                                         |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| NFR-LOG-RUM-001 | SDK no degradante          | SDK < 5KB comprimido, `sendBeacon`, no bloqueante, try-catch global (nunca rompe app anfitriona) |
| NFR-LOG-RUM-002 | Aislamiento de ingesta     | Ingesta RUM no degrada ingesta de logs operativos (rate limiting separado)                       |
| NFR-LOG-RUM-003 | Anonimización y privacidad | Sin user ID crudo, sin IP persistida, sin PII en payload; respeto de DNT                         |
| NFR-LOG-RUM-004 | Rendimiento ingesta        | Latencia p95 de `POST /api/rum` < 1 segundo                                                      |

## 6. Integraciones

### Logs operativos

| ID              | Integracion         | Contrato                                        | Version |
| --------------- | ------------------- | ----------------------------------------------- | ------- |
| IR-0105-LOG-001 | Supabase PostgreSQL | Tabla `log_entries` con RLS                     | v1      |
| IR-0105-LOG-002 | Supabase Auth       | JWT con claims de rol (app_metadata.role)       | v1      |
| IR-0105-LOG-003 | API REST de ingesta | JSON sobre HTTP; API key via header `X-API-Key` | v1      |

### RUM y analíticas

| ID             | Integracion                                | Contrato                                                                                              | Version |
| -------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------- |
| IR-LOG-RUM-001 | SDK `@repo/analytics` (paquete compartido) | `init(appName, samplingConfig)`, `track(eventName, metadata)`, `captureVitals()`, `respectDNT()`      | v1      |
| IR-LOG-RUM-002 | API REST de ingesta RUM                    | `POST /api/rum` con JSON `{app, event_name, page_url, page_path, session_id_anon, metadata}`          | v1      |
| IR-LOG-RUM-003 | API REST de ingesta Web Vitals             | `POST /api/rum/vitals` con JSON `{app, page_url, metric_name, metric_value, rating, session_id_anon}` | v1      |
| IR-LOG-RUM-004 | Tablas Supabase                            | `rum_events`, `rum_vitals`, `rum_sessions` con RLS para dev/ops/product                               | v1      |
| IR-LOG-RUM-005 | SRS Observabilidad transversal             | Cumplimiento de FR-OBS-010 a FR-OBS-013                                                               | v1      |

## 7. Criterios de aceptacion

### Logs operativos

| ID              | Criterio                                                                          |
| --------------- | --------------------------------------------------------------------------------- |
| CA-0105-LOG-001 | Un desarrollador puede loguearse, ver la lista de logs y filtrar por nivel        |
| CA-0105-LOG-002 | Un usuario sin rol dev/ops recibe "acceso denegado" al intentar acceder           |
| CA-0105-LOG-003 | Una app del ecosistema puede enviar un log y este aparece en < 5s en el dashboard |
| CA-0105-LOG-004 | El dashboard muestra metricas correctas basadas en los datos almacenados          |

### RUM y analíticas

| ID             | Criterio                                                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-LOG-RUM-001 | Una app nueva del ecosistema reporta pageviews y Web Vitals desde su primer despliegue sin configuración adicional (más allá de `init(appName)`)    |
| CA-LOG-RUM-002 | Un embudo de conversión de Misal u Oraciones puede construirse solo con eventos de producto (`analytics.track()`), sin consultas manuales a la base |
| CA-LOG-RUM-003 | El dashboard de producto es accesible para roles `dev`, `ops` y `product`; el dashboard operativo es accesible solo para roles `dev` y `ops`        |
| CA-LOG-RUM-004 | El SDK RUM no rompe la app anfitriona ante fallo de ingesta o de la red (try-catch global, fallback silencioso)                                     |
| CA-LOG-RUM-005 | Los datos RUM no contienen user ID crudo, IP persistida ni PII; respetan `Do Not Track` cuando está activo                                          |

## 8. Trazabilidad PRD -> SRS

### Logs operativos

| PRD              | SRS                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------- |
| PRD-0105-LOG-001 | FR-0105-LOG-001, FR-0105-LOG-002, FR-0105-LOG-003                                   |
| PRD-0105-LOG-002 | FR-0105-LOG-004, FR-0105-LOG-005, FR-0105-LOG-006, FR-0105-LOG-007, FR-0105-LOG-008 |
| PRD-0105-LOG-003 | FR-0105-LOG-009                                                                     |
| PRD-0105-LOG-004 | FR-0105-LOG-010                                                                     |
| PRD-0105-LOG-005 | FR-0105-LOG-012, FR-0105-LOG-013, NFR-0105-LOG-004                                  |
| PRD-0105-LOG-006 | FR-0105-LOG-011                                                                     |

### RUM y analíticas

| PRD             | SRS                             |
| --------------- | ------------------------------- |
| PRD-LOG-RUM-001 | FR-LOG-RUM-001, IR-LOG-RUM-001  |
| PRD-LOG-RUM-002 | FR-LOG-RUM-002, NFR-LOG-RUM-004 |
| PRD-LOG-RUM-003 | FR-LOG-RUM-003, IR-LOG-RUM-003  |
| PRD-LOG-RUM-004 | FR-LOG-RUM-004                  |
| PRD-LOG-RUM-005 | FR-LOG-RUM-005                  |
| PRD-LOG-RUM-006 | FR-LOG-RUM-006, NFR-LOG-RUM-003 |
| PRD-LOG-RUM-007 | FR-LOG-RUM-007                  |
| PRD-LOG-RUM-008 | FR-LOG-RUM-R008                 |
