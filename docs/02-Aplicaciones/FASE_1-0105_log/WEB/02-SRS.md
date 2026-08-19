---
tags:
  - proyecto/fosforo
  - srs
  - aplicacion/log
type: app-srs
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|README Log]]"
  - "[[01-PRD|PRD Log]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - 0105_log

## 1. Ficha

- ID base: `FR-0105-LOG-*`, `NFR-0105-LOG-*`, `IR-0105-LOG-*`, `CA-0105-LOG-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-05-26
- Estado: vigente

## 2. Proposito y alcance tecnico

Sistema web de observabilidad para el ecosistema Fósforo. Proporciona ingesta centralizada de logs via API REST, visualizacion con dashboard de metricas, listado con filtros, vista detalle y alertas basicas en UI. El acceso esta restringido a usuarios autenticados con rol `dev` u `ops` mediante Supabase Auth y RLS.

## 3. Actores

- **Usuario dev:** Desarrollador del ecosistema. Puede ver todos los logs, buscar, filtrar y acceder al detalle. No puede configurar alertas.
- **Usuario ops:** Operaciones/DevOps. Puede ver todo igual que dev, mas configurar alertas y ver dashboard de metricas.
- **App emisora:** Aplicacion del ecosistema que envia logs via API. No es un usuario humano. Se autentica via API key o JWT de service.

## 4. Requisitos funcionales

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

## 5. Requisitos no funcionales

| ID               | Requisito                  | Objetivo                                                                               |
| ---------------- | -------------------------- | -------------------------------------------------------------------------------------- |
| NFR-0105-LOG-001 | Disponibilidad/Estabilidad | 99.5% uptime en horario laboral (08-20 UTC-3)                                          |
| NFR-0105-LOG-002 | Rendimiento - Ingesta      | Respuesta a POST /api/logs en < 500ms (p95)                                            |
| NFR-0105-LOG-003 | Rendimiento - Consulta     | Listado de logs con filtros en < 2s (p95) para tablas de hasta 1M registros            |
| NFR-0105-LOG-004 | Seguridad - Acceso         | Solo usuarios autenticados con rol dev/ops; RLS en tabla log_entries                   |
| NFR-0105-LOG-005 | Seguridad - Ingesta        | API key requerida para POST /api/logs; validacion y sanitizacion de payload            |
| NFR-0105-LOG-006 | Escalabilidad              | Soporte para > 100 logs/minuto sin degradacion                                         |
| NFR-0105-LOG-007 | Mantenibilidad             | Codigo con tipos TypeScript estrictos; componentes UI en @repo/ui si son reutilizables |

## 6. Integraciones

| ID              | Integracion         | Contrato                                        | Version |
| --------------- | ------------------- | ----------------------------------------------- | ------- |
| IR-0105-LOG-001 | Supabase PostgreSQL | Tabla `log_entries` con RLS                     | v1      |
| IR-0105-LOG-002 | Supabase Auth       | JWT con claims de rol (app_metadata.role)       | v1      |
| IR-0105-LOG-003 | API REST de ingesta | JSON sobre HTTP; API key via header `X-API-Key` | v1      |

## 7. Criterios de aceptacion

| ID              | Criterio                                                                          |
| --------------- | --------------------------------------------------------------------------------- |
| CA-0105-LOG-001 | Un desarrollador puede loguearse, ver la lista de logs y filtrar por nivel        |
| CA-0105-LOG-002 | Un usuario sin rol dev/ops recibe "acceso denegado" al intentar acceder           |
| CA-0105-LOG-003 | Una app del ecosistema puede enviar un log y este aparece en < 5s en el dashboard |
| CA-0105-LOG-004 | El dashboard muestra metricas correctas basadas en los datos almacenados          |

## 8. Trazabilidad PRD -> SRS

| PRD              | SRS                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------- |
| PRD-0105-LOG-001 | FR-0105-LOG-001, FR-0105-LOG-002, FR-0105-LOG-003                                   |
| PRD-0105-LOG-002 | FR-0105-LOG-004, FR-0105-LOG-005, FR-0105-LOG-006, FR-0105-LOG-007, FR-0105-LOG-008 |
| PRD-0105-LOG-003 | FR-0105-LOG-009                                                                     |
| PRD-0105-LOG-004 | FR-0105-LOG-010                                                                     |
| PRD-0105-LOG-005 | FR-0105-LOG-012, FR-0105-LOG-013, NFR-0105-LOG-004                                  |
| PRD-0105-LOG-006 | FR-0105-LOG-011                                                                     |
