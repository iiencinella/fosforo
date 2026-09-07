---
tags:
  - proyecto/fosforo
  - frd
  - aplicacion/log
  - rum
  - analiticas
type: app-frd
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
  - "[[02-SRS|SRS Log]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `RB-0105-LOG-*`, `UC-0105-LOG-*` (logs operativos)
- ID base RUM: `RB-LOG-RUM-*`, `UC-LOG-RUM-*` (RUM y analíticas)
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Casos de uso

### Logs operativos (MVP vigente)

| ID              | Caso de uso             | Flujo principal                                                                                                                                                                                          | Excepciones                                                                                           |
| --------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| UC-0105-LOG-001 | Enviar log via API      | 1. App emisora construye payload JSON valido. 2. Envia POST a /api/logs con header X-API-Key. 3. Sistema valida payload y API key. 4. Sistema inserta en log_entries. 5. Responde 201 con id del log.    | Payload invalido → 422. API key invalida → 401. DB error → 500.                                       |
| UC-0105-LOG-002 | Ver listado de logs     | 1. Usuario autenticado (dev/ops) navega a /logs. 2. Sistema muestra tabla paginada con 50 logs por pagina. 3. Usuario puede navegar entre paginas.                                                       | Usuario no autenticado → redirect a login. Usuario sin rol → pagina denegado. Sin logs → empty state. |
| UC-0105-LOG-003 | Filtrar logs            | 1. Usuario selecciona filtros (nivel, app, fechas) o escribe texto de busqueda. 2. Sistema actualiza la tabla con los resultados filtrados. 3. Usuario ve resultados o mensaje "sin resultados".         | Filtros sin match → empty state. Error de query → mensaje de error.                                   |
| UC-0105-LOG-004 | Ver detalle de log      | 1. Usuario hace clic en un log del listado. 2. Sistema muestra vista detalle con: timestamp, app, nivel, mensaje, metadata JSON formateada, stack trace (si existe). 3. Usuario puede volver al listado. | Log no encontrado (ID invalido) → 404.                                                                |
| UC-0105-LOG-005 | Ver dashboard operativo | 1. Usuario con rol ops navega a /dashboard. 2. Sistema muestra: total logs acumulados, errores ultimas 24h, top 5 apps por volumen, grafico de evolucion temporal (ultimas 24h).                         | Usuario sin rol ops ve dashboard reducido (sin grafico). Sin datos → empty state informativo.         |
| UC-0105-LOG-006 | Detectar alerta en UI   | 1. Sistema evalua si alguna app supera threshold de errores/min. 2. Si supera, muestra AlertBanner en el header de la app. 3. Usuario hace clic en la alerta para ver logs filtrados de esa app.         | Threshold no configurado → no hay alertas.                                                            |

### RUM y analíticas (extensión)

| ID             | Caso de uso                       | Flujo principal                                                                                                                                                                                                                                                                               | Excepciones                                                                                                                  |
| -------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| UC-LOG-RUM-001 | Integrar SDK RUM en una app nueva | 1. Dev agrega `@repo/analytics` como dependencia. 2. Dev llama `analytics.init({appName: 'mi-app', samplingConfig: {...}})` en el layout principal. 3. SDK captura automáticamente pageviews, Web Vitals y errores de frontend. 4. SDK envía telemetría vía `sendBeacon` sin bloquear la app. | Sin consentimiento → no envía. DNT activo → no envía. SDK falla → try-catch global, no rompe app.                            |
| UC-LOG-RUM-002 | Enviar evento de producto custom  | 1. Dev llama `analytics.track('misal.lectio.started', {lectura: 'mc 5,1-12'})` desde la app. 2. SDK valida el evento (taxonomía común, metadata sanitizada). 3. Si sampling lo permite, SDK envía via `sendBeacon` a `POST /api/rum`. 4. Sistema valida, persiste en `rum_events`.            | Sampling 0% → no envía. Event name no whitelisted → 422. Payload con PII → rechazado por validación.                         |
| UC-LOG-RUM-003 | Ver dashboard de producto         | 1. Usuario con rol dev/ops/product navega a `/dashboard-producto`. 2. Sistema muestra: top páginas por tráfico, embudos predefinidos por app, retención por cohorte, distribución de Web Vitals (LCP/INP/CLS) por rating.                                                                     | Sin datos → empty state. Usuario sin rol dev/ops/product → 403.                                                              |
| UC-LOG-RUM-004 | Configurar sampling por app       | 1. Admin navega a `/admin/rum-sampling`. 2. Selecciona una app y configura `sampling: {pageview: 1.0, custom: 0.1, error: 1.0}`. 3. Sistema persiste en tabla `rum_sampling_config`. 4. SDK de la app lee la config al `init()`.                                                              | Config inválida (sampling > 1 o < 0) → 422.                                                                                  |
| UC-LOG-RUM-005 | Gestionar consentimiento          | 1. Usuario carga una app del ecosistema. 2. App muestra banner de consentimiento. 3. Usuario acepta o rechaza. 4. SDK activa/desactiva tracking según elección. 5. Elección se persiste en localStorage de la app.                                                                            | DNT activo → no muestra banner, asume rechazo. Usuario navega entre apps → estado de consentimiento se mantiene por dominio. |

## 3. Reglas de negocio

### Logs operativos

| ID              | Regla                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| RB-0105-LOG-001 | Un log debe tener al menos: `app`, `level`, `message`, `timestamp`. El resto de campos son opcionales. |
| RB-0105-LOG-002 | Los niveles de severidad validos son: `debug`, `info`, `warn`, `error`, `fatal`.                       |
| RB-0105-LOG-003 | Solo usuarios con `app_metadata.role = 'dev'` o `app_metadata.role = 'ops'` pueden acceder a la app.   |
| RB-0105-LOG-004 | Solo usuarios con rol `ops` pueden ver el grafico de evolucion en el dashboard.                        |
| RB-0105-LOG-005 | El threshold de alerta de errores por app se define como `> 10 errores en ventana de 1 minuto`.        |
| RB-0105-LOG-006 | Los logs con nivel `fatal` se marcan visualmente con color rojo intenso y borde destacado.             |
| RB-0105-LOG-007 | La paginacion del listado tiene un maximo de 50 items por pagina.                                      |

### RUM y analíticas

| ID             | Regla                                                                                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RB-LOG-RUM-001 | Todos los eventos RUM son anónimos: sin user ID crudo, sin IP persistida, sin PII identificable en `metadata`.                                                                                                    |
| RB-LOG-RUM-002 | Web Vitals (LCP, INP, CLS) se capturan automáticamente al cargar cada página, sin acción del dev.                                                                                                                 |
| RB-LOG-RUM-003 | Sampling por defecto: 100% pageviews, 100% errores de frontend, 10% eventos custom. Configurable por app.                                                                                                         |
| RB-LOG-RUM-004 | El dashboard de producto (`/dashboard-producto`) es separado del dashboard operativo (`/dashboard`) y accesible para roles `dev`, `ops` y `product`. El dashboard operativo es accesible solo para `dev` y `ops`. |
| RB-LOG-RUM-005 | El SDK respeta `navigator.doNotTrack` y el consentimiento del usuario: si DNT está activo o el usuario rechazó, no se envía ningún evento.                                                                        |
| RB-LOG-RUM-006 | El SDK NUNCA lanza errores hacia la app anfitriona. Todo está envuelto en try-catch global; ante cualquier fallo, el SDK falla silenciosamente.                                                                   |
| RB-LOG-RUM-007 | El `session_id_anon` es un hash aleatorio generado al inicio de cada sesión de navegador; no persiste entre sesiones ni entre apps.                                                                               |

## 4. Validaciones y errores esperados

### Logs operativos

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

### RUM y analíticas

| Contexto             | Validacion                                              | Error                                                           |
| -------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| POST /api/rum        | Payload debe ser JSON valido                            | 400 Bad Request - "Invalid JSON payload"                        |
| POST /api/rum        | `app` debe ser string no vacio                          | 422 Unprocessable - "Field 'app' is required"                   |
| POST /api/rum        | `event_name` debe ser string whitelisted                | 422 Unprocessable - "Event name not in taxonomy"                |
| POST /api/rum        | `metadata` no debe contener PII (regex email, IP, etc.) | 422 Unprocessable - "Metadata contains PII"                     |
| POST /api/rum        | Rate limit excedido (separado de logs)                  | 429 Too Many Requests - "Rate limit exceeded"                   |
| POST /api/rum/vitals | `metric_name` debe ser uno de: LCP, INP, CLS            | 422 Unprocessable - "Invalid metric name"                       |
| POST /api/rum/vitals | `metric_value` debe ser numeric                         | 422 Unprocessable - "Metric value must be numeric"              |
| Frontend             | DNT activo o consentimiento rechazado                   | SDK no envía eventos; comportamiento silencioso                 |
| Frontend             | SDK intenta enviar y la red falla                       | SDK encola en buffer con retry limitado; tras N fallos descarta |

## 5. Estados funcionales

### Logs operativos

- Estado `loading`: Skeleton de tabla mientras se cargan los logs. Skeleton de cards en dashboard.
- Estado `empty`: Mensaje "No hay logs registrados" con icono y accion de "Ir a documentacion de integracion" para empezar a enviar logs.
- Estado `error`: Mensaje de error con descripcion y boton "Reintentar".
- Estado `success`: Datos visibles normalmente.

### RUM y analíticas

- Estado `loading`: Skeleton de cards y gráficos en dashboard de producto.
- Estado `empty`: Mensaje "No hay eventos RUM registrados. Integra el SDK `@repo/analytics` en tu app" con CTA a docs.
- Estado `error`: Mensaje de error con descripción y botón "Reintentar".
- Estado `success`: Datos visibles normalmente en dashboard de producto.
- Estado `opt-in-pending`: Banner de consentimiento visible al usuario; tracking inactivo hasta decisión.
- Estado `tracking-active`: Consentimiento dado; SDK envía eventos.
- Estado `tracking-rejected`: Consentimiento rechazado; SDK inactivo.
- Estado `dnt-respected`: DNT detectado; SDK inactivo sin mostrar banner.

## 6. Trazabilidad FRD -> SRS

### Logs operativos

| FRD             | SRS                                                                |
| --------------- | ------------------------------------------------------------------ |
| UC-0105-LOG-001 | FR-0105-LOG-001, FR-0105-LOG-002, FR-0105-LOG-003                  |
| UC-0105-LOG-002 | FR-0105-LOG-004                                                    |
| UC-0105-LOG-003 | FR-0105-LOG-005, FR-0105-LOG-006, FR-0105-LOG-007, FR-0105-LOG-008 |
| UC-0105-LOG-004 | FR-0105-LOG-009                                                    |
| UC-0105-LOG-005 | FR-0105-LOG-010                                                    |
| UC-0105-LOG-006 | FR-0105-LOG-011                                                    |
| RB-0105-LOG-003 | FR-0105-LOG-012, FR-0105-LOG-013                                   |

### RUM y analíticas

| FRD            | SRS                                                            |
| -------------- | -------------------------------------------------------------- |
| UC-LOG-RUM-001 | FR-LOG-RUM-001, FR-LOG-RUM-003, FR-LOG-RUM-004, IR-LOG-RUM-001 |
| UC-LOG-RUM-002 | FR-LOG-RUM-002, FR-LOG-RUM-007, IR-LOG-RUM-002                 |
| UC-LOG-RUM-003 | FR-LOG-RUM-005, FR-LOG-RUM-R008                                |
| UC-LOG-RUM-004 | FR-LOG-RUM-007                                                 |
| UC-LOG-RUM-005 | FR-LOG-RUM-006, RB-LOG-RUM-005                                 |
| RB-LOG-RUM-001 | FR-LOG-RUM-006, NFR-LOG-RUM-003                                |
| RB-LOG-RUM-002 | FR-LOG-RUM-003, IR-LOG-RUM-003                                 |
| RB-LOG-RUM-003 | FR-LOG-RUM-007                                                 |
| RB-LOG-RUM-004 | FR-LOG-RUM-R008                                                |
| RB-LOG-RUM-005 | FR-LOG-RUM-006                                                 |
| RB-LOG-RUM-006 | NFR-LOG-RUM-001                                                |
