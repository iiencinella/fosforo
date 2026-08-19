---
tags:
  - proyecto/fosforo
  - frd
  - aplicacion/log
type: app-frd
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|README Log]]"
  - "[[02-SRS|SRS Log]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - 0105_log

## 1. Ficha

- ID base: `RB-0105-LOG-*`, `UC-0105-LOG-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. Casos de uso

| ID              | Caso de uso           | Flujo principal                                                                                                                                                                                                             | Excepciones                                                                                           |
| --------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| UC-0105-LOG-001 | Enviar log via API    | 1. App emisora construye payload JSON valido. 2. Envia POST a /api/logs con header X-API-Key. 3. Sistema valida payload y API key. 4. Sistema inserta en log_entries. 5. Responde 201 con id del log.                       | Payload invalido → 422. API key invalida → 401. DB error → 500.                                       |
| UC-0105-LOG-002 | Ver listado de logs   | 1. Usuario autenticado (dev/ops) navega a /logs. 2. Sistema muestra tabla paginada con 50 logs por pagina. 3. Usuario puede navegar entre paginas.                                                                          | Usuario no autenticado → redirect a login. Usuario sin rol → pagina denegado. Sin logs → empty state. |
| UC-0105-LOG-003 | Filtrar logs          | 1. Usuario selecciona filtros (nivel, app, fechas) o escribe texto de busqueda. 2. Sistema actualiza la tabla con los resultados filtrados. 3. Usuario ve resultados o mensaje "sin resultados".                            | Filtros sin match → empty state. Error de query → mensaje de error.                                   |
| UC-0105-LOG-004 | Ver detalle de log    | 1. Usuario hace clic en un log del listado. 2. Sistema muestra vista detalle con: timestamp, app, nivel, mensaje, metadata JSON formateada, stack trace (si existe). 3. Usuario puede volver al listado.                    | Log no encontrado (ID invalido) → 404.                                                                |
| UC-0105-LOG-005 | Ver dashboard         | 1. Usuario con rol ops navega a /dashboard. 2. Sistema muestra: total logs acumulados, errores ultimas 24h, top 5 apps por volumen, grafico de evolucion temporal (ultimas 24h). 3. Las metricas se actualizan al recargar. | Usuario sin rol ops ve dashboard reducido (sin grafico). Sin datos → empty state informativo.         |
| UC-0105-LOG-006 | Detectar alerta en UI | 1. Sistema evalua si alguna app supera threshold de errores/min. 2. Si supera, muestra AlertBanner en el header de la app. 3. Usuario hace clic en la alerta para ver logs filtrados de esa app.                            | Threshold no configurado → no hay alertas.                                                            |

## 3. Reglas de negocio

| ID              | Regla                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| RB-0105-LOG-001 | Un log debe tener al menos: `app`, `level`, `message`, `timestamp`. El resto de campos son opcionales. |
| RB-0105-LOG-002 | Los niveles de severidad validos son: `debug`, `info`, `warn`, `error`, `fatal`.                       |
| RB-0105-LOG-003 | Solo usuarios con `app_metadata.role = 'dev'` o `app_metadata.role = 'ops'` pueden acceder a la app.   |
| RB-0105-LOG-004 | Solo usuarios con rol `ops` pueden ver el grafico de evolucion en el dashboard.                        |
| RB-0105-LOG-005 | El threshold de alerta de errores por app se define como `> 10 errores en ventana de 1 minuto`.        |
| RB-0105-LOG-006 | Los logs con nivel `fatal` se marcan visualmente con color rojo intenso y borde destacado.             |
| RB-0105-LOG-007 | La paginacion del listado tiene un maximo de 50 items por pagina.                                      |

## 4. Validaciones y errores esperados

| Contexto       | Validacion                                               | Error                                                                                |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| POST /api/logs | Payload debe ser JSON valido                             | 400 Bad Request - "Invalid JSON payload"                                             |
| POST /api/logs | `level` debe ser uno de: debug, info, warn, error, fatal | 422 Unprocessable - "Invalid level. Must be one of: debug, info, warn, error, fatal" |
| POST /api/logs | `app` debe ser string no vacio                           | 422 Unprocessable - "Field 'app' is required and must be a non-empty string"         |
| POST /api/logs | `message` debe ser string no vacio                       | 422 Unprocessable - "Field 'message' is required and must be a non-empty string"     |
| POST /api/logs | API key debe ser valida                                  | 401 Unauthorized - "Invalid or missing API key"                                      |
| GET /logs/:id  | ID debe ser UUID valido                                  | 400 Bad Request - "Invalid log ID format"                                            |
| GET /logs/:id  | Log debe existir                                         | 404 Not Found - "Log not found"                                                      |
| Frontend       | Usuario sin rol dev/ops                                  | 403 Forbidden - pagina de acceso denegado                                            |

## 5. Estados funcionales

- Estado `loading`: Skeleton de tabla mientras se cargan los logs. Skeleton de cards en dashboard.
- Estado `empty`: Mensaje "No hay logs registrados" con icono y accion de "Ir a documentacion de integracion" para empezar a enviar logs.
- Estado `error`: Mensaje de error con descripcion y boton "Reintentar". Si es error de red, sugerencia de verificar conexion.
- Estado `success`: Datos visibles normalmente. En dashboard, metricas actualizadas.

## 6. Trazabilidad FRD -> SRS

| FRD             | SRS                                                                |
| --------------- | ------------------------------------------------------------------ |
| UC-0105-LOG-001 | FR-0105-LOG-001, FR-0105-LOG-002, FR-0105-LOG-003                  |
| UC-0105-LOG-002 | FR-0105-LOG-004                                                    |
| UC-0105-LOG-003 | FR-0105-LOG-005, FR-0105-LOG-006, FR-0105-LOG-007, FR-0105-LOG-008 |
| UC-0105-LOG-004 | FR-0105-LOG-009                                                    |
| UC-0105-LOG-005 | FR-0105-LOG-010                                                    |
| UC-0105-LOG-006 | FR-0105-LOG-011                                                    |
| RB-0105-LOG-003 | FR-0105-LOG-012, FR-0105-LOG-013                                   |
