---
tags:
  - proyecto/fosforo
  - flujos
  - aplicacion/log
  - rum
  - analiticas
type: app-flujos
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
  - "[[03-FRD|FRD Log]]"
---

# Flujos y Secuencias - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Objetivo

Describir como interactuan los actores (apps emisoras, usuarios dev, usuarios ops, apps anfitrionas con SDK RUM) con las funcionalidades principales de la app de logs y RUM.

## Flujo principal - Logs operativos

1. **App emisora** genera un evento (error, warning, info, etc.) y lo envia via `POST /api/logs`.
2. **Sistema** valida el payload, lo almacena en `log_entries` y responde `201 Created`.
3. **Usuario dev/ops** ingresa a la app, se autentica via Supabase Auth.
4. **Sistema** verifica el rol del usuario (dev/ops). Si no tiene rol, muestra acceso denegado.
5. **Usuario** ve el dashboard operativo con metricas generales.
6. **Usuario** navega al listado de logs, aplica filtros (nivel, app, fecha, texto).
7. **Usuario** hace clic en un log para ver el detalle completo.

## Flujos secundarios - Logs operativos

- **Flujo A - Alerta activa:** Cuando una app supera el threshold de errores (10 errores/min), el sistema muestra un AlertBanner. El usuario ops hace clic y ve los logs filtrados de esa app.
- **Flujo B - Sin datos:** Cuando no hay logs registrados, el sistema muestra un empty state con instrucciones para integrar la app emisora.

## Flujo principal - RUM y analíticas

1. **Dev** integra el SDK `@repo/analytics` en una app del ecosistema llamando `analytics.init({appName, samplingConfig})` en el layout principal.
2. **SDK** verifica `navigator.doNotTrack` y el consentimiento del usuario. Si DNT activo o consentimiento rechazado, SDK queda inactivo.
3. **Usuario** carga una página de la app. **SDK** captura automáticamente el pageview y los Web Vitals (LCP, INP, CLS).
4. **SDK** envía la telemetría vía `sendBeacon` (no bloqueante) a `POST /api/rum` y `POST /api/rum/vitals`.
5. **Sistema** valida el payload (taxonomía común, sin PII), aplica sampling si corresponde y persiste en `rum_events` y `rum_vitals`.
6. **Usuario product/dev/ops** navega a `/dashboard-producto` y ve embudos, retención, top páginas y distribución de Web Vitals segmentados por app.

## Flujos secundarios - RUM y analíticas

- **Flujo A - Consentimiento:** Usuario carga la app por primera vez → app muestra banner de consentimiento → usuario acepta o rechaza → SDK activa/desactiva tracking → elección persiste en localStorage.
- **Flujo B - Evento custom:** Dev llama `analytics.track('misal.lectio.started', {lectura: 'mc 5,1-12'})` → SDK valida → si sampling lo permite → `sendBeacon` a `POST /api/rum` → sistema persiste.
- **Flujo C - Error de frontend:** Ocurre un error JS en una página → SDK captura el error con contexto (app, versión, browser, stack) → `sendBeacon` → sistema persiste con `event_name='frontend.error'`.
- **Flujo D - Fallo de red del SDK:** SDK intenta enviar y la red falla → encola en buffer interno → reintenta con backoff limitado → tras N fallos descarta silenciosamente sin afectar la app anfitriona.

## Secuencias clave

### Secuencia 1 - Ingesta de log operativo

1. App emisora: Construye payload JSON con `{ app, level, message, timestamp, metadata?, stack_trace? }`
2. App emisora: `POST /api/logs` con header `X-API-Key`
3. Sistema: Valida API key contra tabla `api_keys`
4. Sistema: Valida payload con esquema Zod
5. Sistema: Inserta registro en `log_entries`
6. Sistema: Responde `201 { id }`
7. App emisora: Recibe confirmacion

### Secuencia 2 - Consulta con filtros

1. Usuario: Navega a `/logs`
2. Sistema: Renderiza pagina SSR con tabla de ultimos 50 logs
3. Usuario: Selecciona filtro `level = error`
4. Cliente (React island): Envia request a API con filtro
5. Sistema: Ejecuta query con WHERE level = 'error'
6. Sistema: Devuelve resultados filtrados + total count
7. Cliente: Renderiza tabla actualizada

### Secuencia 3 - Dashboard operativo

1. Usuario ops: Navega a `/dashboard`
2. Sistema: Ejecuta queries agregadas en paralelo:
   - `SELECT COUNT(*) FROM log_entries`
   - `SELECT COUNT(*) FROM log_entries WHERE level IN ('error','fatal') AND timestamp > now() - interval '24h'`
   - `SELECT app, COUNT(*) as count FROM log_entries GROUP BY app ORDER BY count DESC LIMIT 5`
   - `SELECT date_trunc('hour', timestamp) as hour, COUNT(*) as count FROM log_entries WHERE timestamp > now() - interval '24h' GROUP BY hour ORDER BY hour`
3. Sistema: Renderiza dashboard con datos
4. Usuario: Ve metricas y grafico de evolucion

### Secuencia 4 - Inicialización de SDK RUM en una app nueva

1. Dev: Agrega `@repo/analytics` como dependencia en `package.json` de la app.
2. Dev: En el layout principal, llama `analytics.init({ appName: 'mi-app', samplingConfig: { pageview: 1.0, custom: 0.1, error: 1.0 } })`.
3. SDK: Lee configuración de sampling desde el servidor (o usa la config local).
4. SDK: Verifica `navigator.doNotTrack`. Si activo, queda inactivo.
5. SDK: Verifica consentimiento del usuario en localStorage. Si rechazado, queda inactivo.
6. SDK: Si está activo, registra listener para captura automática de pageview y Web Vitals en cada navegación.
7. Dev (opcional): Llama `analytics.track('app.opened', { version: '1.0.0' })` desde un punto crítico de la app.
8. Usuario: Carga una página → SDK captura pageview + Web Vitals → `sendBeacon` a `/api/rum` y `/api/rum/vitals` → sistema persiste.

### Secuencia 5 - Captura de Web Vitals

1. SDK: Al cargar una página, instala observers de Web Vitals:
   - `PerformanceObserver` para LCP (Largest Contentful Paint)
   - `PerformanceObserver` para INP (Interaction to Next Paint)
   - `PerformanceObserver` para CLS (Cumulative Layout Shift)
2. Navegador: Dispara eventos de Web Vitals durante la interacción del usuario.
3. SDK: Cada vez que se dispara un evento, captura el valor y el rating (good/needs-improvement/poor).
4. SDK: Cuando la página se descarga (evento `visibilitychange` o `pagehide`), envía todos los Web Vitals acumulados via `sendBeacon` a `POST /api/rum/vitals` con payload `{app, page_url, metric_name, metric_value, rating, session_id_anon}`.
5. Sistema: Valida payload, persiste en `rum_vitals`.
6. Dashboard de producto: Agrega Web Vitals por app y muestra distribución por rating.

### Secuencia 6 - Captura de error de frontend

1. App anfitriona: Ocurre un error JS no capturado (ej: TypeError en un componente).
2. SDK: Listener global de `window.onerror` y `window.onunhandledrejection` captura el error.
3. SDK: Construye payload con contexto: `{app, event_name: 'frontend.error', page_url, session_id_anon, metadata: {message, stack, source, lineno, colno, browser, app_version}}`.
4. SDK: `sendBeacon` a `POST /api/rum`.
5. Sistema: Valida payload, persiste en `rum_events`.
6. Dashboard de producto: Lista errores de frontend por app, con stack trace y frecuencia.

### Secuencia 7 - Consulta dashboard de producto

1. Usuario product: Navega a `/dashboard-producto`
2. Sistema: Verifica rol (dev/ops/product). Sin rol → 403.
3. Sistema: Ejecuta queries agregadas en paralelo:
   - Top páginas: `SELECT page_path, COUNT(*) as count FROM rum_events WHERE event_name='pageview' GROUP BY page_path ORDER BY count DESC LIMIT 20`
   - Embudo Misal (ejemplo): cuenta usuarios que dispararon `misal.home.viewed` → `misal.lectio.started` → `misal.lectio.completed`
   - Retención por cohorte: agrupa `session_id_anon` por día de primera visita y mide retorno en días siguientes
   - Distribución Web Vitals: `SELECT metric_name, rating, COUNT(*) FROM rum_vitals GROUP BY metric_name, rating`
4. Sistema: Renderiza dashboard de producto con cards y gráficos.
5. Usuario: Ve métricas y puede filtrar por rango de fechas y app.
