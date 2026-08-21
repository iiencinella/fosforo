---
tags:
  - proyecto/fosforo
  - novedades
  - aplicacion/log
type: novedad-documental
area: general
status: vigente
created: 2026-08-21
updated: 2026-08-21
related:
  - "[[../02-Aplicaciones/FASE_1-0105_log/WEB/00-README|README Log]]"
  - "[[../02-Aplicaciones/FASE_1-0105_log/WEB/12-Plan-Desarrollo-MVP|Plan Desarrollo MVP Log]]"
---

# Novedad documental - Completación del MVP de Log e integración del ecosistema

## Cambio

Se completó la implementación del MVP de la app **0105_log** sobre la prueba de concepto existente y se integró el envío de logs desde las aplicaciones del ecosistema. Rama: `feat/log-mvp-completacion`.

### App log (`src/apps/log`)

- Listado `/logs`: paginación real (default 50, controles anterior/siguiente), filtros por fecha `since`/`until`, estado de error con "Reintentar" y skeleton al filtrar.
- Componente `AlertBanner` extraído y reutilizado en listado y dashboard.
- Login con feedback de error visible; logout revoca el token en Supabase además de limpiar cookies.
- Seguridad OWASP: rate limiting de ingesta (100 req/min por API key, ventana fija en DB vía RPC atómica), fallback a datos mock restringido a desarrollo, tracking `last_used_at` de API keys, secure headers (CSP, HSTS, nosniff, etc.) en middleware.
- Performance: métricas del dashboard calculadas por RPC SQL agregada (`get_log_dashboard_metrics`) en lugar de descargar la tabla completa.
- Tests: matriz TC-001→018 cubierta (29 tests en 3 suites).

### Base de datos (`db/supabase/migrations`)

- `202608210001_log_rate_limit.sql`: tabla `api_key_rate_limits` + RPC `check_api_key_rate_limit`.
- `202608210002_log_dashboard_metrics.sql`: RPC `get_log_dashboard_metrics`.

### Ecosistema

- `@repo/api-utils/log-client`: timeout de 3s con `AbortSignal`, soporte de override por opciones; fire-and-forget.
- `.env.example`: agregadas `LOGS_API_URL` y `LOGS_API_KEY`.
- Script `db/scripts/generate-log-api-keys.js`: genera una API key por app (cruda para el entorno, hash para DB).
- Instrumentación de errores en APIs de `administracion`, `calendario` y `horarios` (se suman a portal, biblia, cancionero y usuario que ya la tenían).

## Motivo

La documentación definía un MVP (SRS/FRD/OWASP/Tests) que la prueba de concepto no cerraba: faltaban paginación, filtros de fecha, rate limiting, revocación de sesión y eficiencia en métricas. Además, el objetivo final del sistema —centralizar logs del ecosistema— requería que todas las apps emitieran eventos al panel.

## Documentación actualizada

- `00-README.md` de la app: estado de implementación.
- `10-OWASP.md`: controles marcados como implementados con evidencia.
- `05-Tests Unitarios.md`: matriz y criterios de aprobación.
- `12-Plan-Desarrollo-MVP.md` (nuevo): registro del proceso.
- `db/scripts/README.md`: uso del generador de API keys.

## Pendiente

- Configurar `LOGS_API_URL` + `LOGS_API_KEY` en Vercel para calendario, horarios y administracion cuando cada app se despliegue (portal, biblia, cancionero y usuario ya tienen sus keys vigentes en produccion).

## Resultados E2E en produccion (2026-08-21)

- Deploy inicial de la app log: `https://fosforo-log.vercel.app` (proyecto Vercel `fosforo-log`, env vars Supabase configuradas).
- Migraciones aplicadas al proyecto remoto via MCP: `log_rate_limit` y `log_dashboard_metrics`; RPC de metricas verificada (24 buckets, threshold 10).
- Usuario panel: `eze14_12@hotmail.com` promovido a rol `ops` en `app_metadata`.
- API keys: se detectaron keys vigentes para portal, biblia, cancionero y usuario; se generaron e insertaron hashes nuevos para calendario, horarios y administracion.
- Verificacion funcional: health OK; ingesta con key real → 201 y persistencia en DB; key invalida → 401; rafaga paralela de 120 requests → 100x201 + 20x429 (rate limit verificado); `last_used_at` actualizado; logs de prueba eliminados luego de la verificacion.
- Cobertura de tests elevada a 95.5% statements / 90.8% branches (51 tests) con umbrales configurados; workflow `security-audit.yml` agregado (pnpm audit no bloqueante hasta remediar inventario preexistente).
