---
tags:
  - proyecto/fosforo
  - flujos
  - aplicacion/log
type: app-flujos
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|README Log]]"
  - "[[03-FRD|FRD Log]]"
---

# Flujos y Secuencias - 0105_log

## Objetivo

Describir como interactuan los actores (apps emisoras, usuarios dev, usuarios ops) con las funcionalidades principales de la app de logs.

## Flujo principal

1. **App emisora** genera un evento (error, warning, info, etc.) y lo envia via `POST /api/logs`.
2. **Sistema** valida el payload, lo almacena en `log_entries` y responde `201 Created`.
3. **Usuario dev/ops** ingresa a la app, se autentica via Supabase Auth.
4. **Sistema** verifica el rol del usuario (dev/ops). Si no tiene rol, muestra acceso denegado.
5. **Usuario** ve el dashboard con metricas generales.
6. **Usuario** navega al listado de logs, aplica filtros (nivel, app, fecha, texto).
7. **Usuario** hace clic en un log para ver el detalle completo.
8. **Sistema** muestra informacion completa del log: timestamp, app, nivel, mensaje, metadata, stack trace.

## Flujos secundarios

- **Flujo A - Alerta activa:** Cuando una app supera el threshold de errores (10 errores/min), el sistema muestra un AlertBanner. El usuario ops hace clic y ve los logs filtrados de esa app.
- **Flujo B - Sin datos:** Cuando no hay logs registrados, el sistema muestra un empty state con instrucciones para integrar la app emisora.

## Secuencias clave

### Secuencia 1 - Ingesta de log

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

### Secuencia 3 - Dashboard

1. Usuario ops: Navega a `/dashboard`
2. Sistema: Ejecuta queries agregadas en paralelo:
   - `SELECT COUNT(*) FROM log_entries`
   - `SELECT COUNT(*) FROM log_entries WHERE level IN ('error','fatal') AND timestamp > now() - interval '24h'`
   - `SELECT app, COUNT(*) as count FROM log_entries GROUP BY app ORDER BY count DESC LIMIT 5`
   - `SELECT date_trunc('hour', timestamp) as hour, COUNT(*) as count FROM log_entries WHERE timestamp > now() - interval '24h' GROUP BY hour ORDER BY hour`
3. Sistema: Renderiza dashboard con datos
4. Usuario: Ve metricas y grafico de evolucion
