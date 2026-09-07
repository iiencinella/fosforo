---
tags:
  - proyecto/fosforo
  - novedades
  - fase-0
  - cierre
type: novedades
area: general
status: vigente
created: 2026-09-07
updated: 2026-09-07
related:
  - "[[03-Indice-General|Indice General]]"
  - "[[../plans/2026-09-05-plan-desarrollo-fase-0|Plan Desarrollo Fase 0]]"
  - "[[../plans/2026-09-05-plan-maestro-fase-2-ecosistema|Plan Maestro Fase 2]]"
---

# Novedades 2026-09-07 - Cierre de Fase 0 (infraestructura compartida)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

Se completo la Fase 0 del ecosistema: la base de plataforma (observabilidad con RUM y analiticas, identidad unificada y nucleo de notificaciones) queda implementada, secuencialmente, en 8 ramas con PR y merge a `main` entre pasos. Todo partio del plan de desarrollo aprobado (`docs/plans/2026-09-05-plan-desarrollo-fase-0.md`) y de los contratos documentados en draft (plan maestro Fase 2).

## Por que se aplico

La regla "base primero, contenido despues" del plan maestro exige que las capacidades compartidas existan como codigo reutilizable antes de construir las apps que las consumen (Misal, Santopedia, Oraciones, Vida de Misionero, Visita 7 Iglesias, Lectio Divina y el piloto Horarios). Con Fase 0 cerrada, cada app nueva integra Auth, RUM y Notificaciones sin reimplementar nada.

## Que se implemento (por paso, uno por rama)

### Paso 1 - `refactor/unificacion-roles-ecosistema` (PR #51)

Unico modelo de roles: la app log abandona `app_metadata.role` y resuelve via RBAC compartido (`profiles.role_id` -> `roles` + `permissions`). Roles de plataforma `dev/ops/product` sembrados; helpers SQL `current_user_role_slug()` y `user_has_app_permission()` para policies RLS; policies de `log_entries` migradas.

### Paso 2 - `feat/rum-esquema-db` (PR #52)

Tablas `rum_events`, `rum_vitals`, `rum_sessions`, `rum_sampling_config` + `rum_rate_limits` con RPC `check_rum_rate_limit`. Ingesta publica anonima (insert para anon/authenticated), lectura solo para dev/ops/product; sin IP ni user id.

### Paso 3 - `feat/rum-ingesta-endpoints` (PR #53)

`POST /api/rum` y `POST /api/rum/vitals`: taxonomia whitelist (`RUM_APP_REGISTRY`), anti-PII profundo (solo strings), metadata max 8KB, sampling configurable, descarte sin consentimiento, rate limit anonimo 1000/min con clave `SHA-256(IP|UA)`.

### Paso 4 - `feat/analytics-sdk` (PR #54)

Paquete `@repo/analytics`: init/track/captureVitals/setConsent/hasConsent/respectDNTStatus. Web Vitals (LCP/INP/CLS), errores de frontend, sendBeacon con fallback fetch keepalive, sesion anonima por sessionStorage, consentimiento y DNT. Nunca lanza; no-op en SSR. **2114 B gzip** (limite 5120) con script reproducible `size:check`.

### Paso 5 - `feat/rum-dashboard-producto` (PR #55)

`/dashboard-producto` (dev/ops/product) separado del operativo: top paginas, Web Vitals con % good, actividad diaria, eventos por app. Endpoints resumen/funnel/retention; 5 RPCs de agregacion en Postgres. Desviacion documentada: la "retencion por cohorte" no es medible por diseno de privacidad (ADR-LOG-RUM-004); el proxy es la actividad diaria.

### Paso 6 - `feat/notification-core-paquete` (PR #56)

Paquete `@repo/notification-core` (la carpeta fantasma se convirtio en workspace real): canales y categorias con categoria obligatoria, plantillas versionadas inmutables con render estricto, preferencias por canal+categoria con defaults conservadores, cola con idempotencia por event_id, maximo 3 intentos y backoff exponencial.

### Paso 7 - `feat/notificaciones-esquema-db` (PR #57)

4 tablas (`notification_templates`, `notification_events`, `notification_preferences`, `notification_queue`) con checks de canal/categoria, `event_id` unique, RLS (dueno para preferencias, admin/dev/ops para eventos, service_role para cola). Incluye fix-forward del `pnpm-lock.yaml` omitido en el paso 6.

### Paso 8 - `feat/logueo-app` (PR #58)

App `src/apps/logueo/`: login, registro (con confirmacion por email) y cuenta unica; logout con alcance local/global; `GET /api/auth/session` para las demas apps; `me` con perfil y consentimientos (PUT con refine anti no-op); tabla `consents` nueva con RLS por dueno; auditoria en `audit_log`; RUM dia 1 con banner de consentimiento (`PUBLIC_RUM_API_URL` en globalEnv). Matriz documental actualizada: Sistema de Logueo = Implementada.

## Validaciones ejecutadas

- `pnpm check-types` y `pnpm test:unit` por paso: **191 tests acumulados** (log 118, @repo/analytics 48, logueo 25, @repo/notification-core 23, @repo/auth 17) y builds completos de log y logueo.
- `db:scripts:validate` no ejecutable en el entorno (faltan `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`): la aplicacion de las 5 migraciones (20260906000001..000005) queda como paso operativo con verificaciones manuales detalladas en el plan de Fase 0.
- Cambios 100% secuencionales: cada rama nacio de un `main` con el paso anterior mergeado.

## Pendientes y riesgos

1. Aplicar las 5 migraciones en staging/produccion y verificar policies (detallado paso a paso en el plan de Fase 0).
2. Asignar roles de plataforma a los usuarios actuales del panel log: sin ese paso, pierden acceso al aplicar la migracion del modelo unificado.
3. Configurar `PUBLIC_RUM_API_URL` en los deploys y correr el E2E de RUM con un navegador real.
4. Consolidar el PR de Version Packages del bot de changesets.
5. Aprobar los contratos en draft (CMS, Motor, Notificaciones, Logueo) antes de arrancar la Fase 1; corregir en la doc de log la UC-LOG-RUM-003 (retencion por cohorte -> actividad diaria).

## Siguiente etapa

Fase 1 del orden de desarrollo: **CMS** y luego **Motor Liturgico**, previa aprobacion de sus contratos documentales.
