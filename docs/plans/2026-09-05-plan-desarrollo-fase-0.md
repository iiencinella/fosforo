---
tags:
  - proyecto/fosforo
  - plan
  - desarrollo
  - fase-0
type: plan-desarrollo
area: general
status: completado
created: 2026-09-05
updated: 2026-09-07
related:
  - "[[2026-09-05-plan-maestro-fase-2-ecosistema|Plan Maestro Fase 2]]"
  - "[[2026-09-05-auditoria-horarios-migracion|Auditoria Horarios]]"
  - "[[../00-General/12-Novedades-2026-09-07-cierre-fase-0|Novedades cierre Fase 0]]"
---

# Plan de Desarrollo - Fase 0 (Infraestructura compartida)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Estado de ejecucion (2026-09-07) - COMPLETADO

Los 8 pasos se ejecutaron secuencialmente, uno por rama, con PR y merge a
`main` entre pasos. Commits de cierre: `4049ef3` (p1), `649f20c` (p2),
`e747f40` (p3), `7476b07` (p4), `80e9840` (p5), `0e458f8` (p6, PR #56),
`f38b585` (p7, PR #57), `6552eaa` (p8, PR #58).

| Paso | Rama                                    | Resultado                                                                                        | Estado   |
| ---- | --------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| 0    | `docs/documentacion-fase-2-ecosistema`  | Planificacion documental Fase 2 + plan de Fase 0 (PR #50)                                        | Mergeado |
| 1    | `refactor/unificacion-roles-ecosistema` | RBAC unificado, roles dev/ops/product, policies RLS de log migradas (PR #51)                     | Mergeado |
| 2    | `feat/rum-esquema-db`                   | Tablas rum_events/rum_vitals/rum_sessions/rum_sampling_config + RLS + RPC rate limit (PR #52)    | Mergeado |
| 3    | `feat/rum-ingesta-endpoints`            | POST /api/rum y /api/rum/vitals: taxonomia, anti-PII, sampling, rate limit 1000/min (PR #53)     | Mergeado |
| 4    | `feat/analytics-sdk`                    | Paquete @repo/analytics (48 tests, 2114 B gzip vs limite 5120, script size:check) (PR #54)       | Mergeado |
| 5    | `feat/rum-dashboard-producto`           | /dashboard-producto + 3 endpoints + 5 RPCs de agregacion (PR #55)                                | Mergeado |
| 6    | `feat/notification-core-paquete`        | Paquete @repo/notification-core: plantillas versionadas, preferencias, cola con backoff (PR #56) | Mergeado |
| 7    | `feat/notificaciones-esquema-db`        | 4 tablas notification_* + RLS (PR #57; incluye fix de lockfile pendiente del paso 6)             | Mergeado |
| 8    | `feat/logueo-app`                       | App logueo completa + tabla consents + RUM dia 1 (PR #58)                                        | Mergeado |

Totales: ~4.600 lineas de codigo productivo, 191 tests unitarios (log 118,
@repo/analytics 48, logueo 25, @repo/notification-core 23, @repo/auth 17),
5 migraciones SQL (20260906000001..000005), 2 paquetes nuevos, 1 app nueva,
changesets en log, @repo/auth, @repo/analytics, @repo/notification-core y
logueo.

### Pendientes operativos (fuera del codigo)

- Aplicar las 5 migraciones en staging/produccion (`pnpm db:link` /
  `pnpm db:push` con SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN y
  SUPABASE_DB_PASSWORD; `db:scripts:validate` no fue ejecutable en el
  entorno de desarrollo).
- Migrar los usuarios actuales de log a los roles dev/ops/product (los
  que solo tenian app_metadata.role pierden acceso al panel tras aplicar
  la migracion del paso 1 hasta que un admin les asigne rol).
- Configurar PUBLIC_RUM_API_URL en los deploys de las apps (logueo la
  consume; las demas al integrar el SDK).
- E2E de punta a punta con Supabase real: login/logout en logueo, ingesta
  RUM desde un navegador con consentimiento, dashboard de producto con
  datos.
- Version Packages PR del bot de changesets: consolidar versiones.

### Desviaciones documentadas durante la ejecucion

- Retencion por cohorte de usuarios no medible por diseno de privacidad
  (ADR-LOG-RUM-004): el dashboard implementa el proxy de actividad diaria.
  Correccion doc pendiente en FASE_1-0105_log/WEB/03-FRD.md
  (UC-LOG-RUM-003).
- El SDK @repo/analytics no duplica la whitelist de taxonomia ni el
  anti-PII: el servidor es autoridad y descarta en silencio
  (fire-and-forget).
- Sampling del lado cliente del SDK por defecto sin filtro (1/1/1); el
  default 100/10/100 vive en el servidor (rum_sampling_config).

## Decisiones previas confirmadas

| Decision              | Resolucion                                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modelo de roles       | Unificar en RBAC de `@repo/auth` (tabla `roles` + `permissions`); la app `log` migra de `app_metadata.role` al modelo común; se añaden roles de plataforma `dev`, `ops`, `product` |
| Ingesta RUM           | Pública y anónima (sin API key), con rate limit por IP/origen + sampling + validación anti-PII                                                                                     |
| Granularidad          | 8 pasos, uno por rama, secuenciales (cada paso mergeado en `main` antes del siguiente)                                                                                             |
| Dashboard de producto | Incluido en Fase 0 (paso 5)                                                                                                                                                        |

## Flujo obligatorio entre pasos

`git checkout main && git pull` → `git checkout -b <rama>` → commits atómicos → `pnpm changeset` (si afecta workspaces) → push → PR → merge → siguiente paso.

## Pasos

### Paso 0 - Prerequisito (sin código)

Mergear el PR `docs/documentacion-fase-2-ecosistema` (planificación Fase 2, 142 archivos).

### Paso 1 - `refactor/unificacion-roles-ecosistema` (bloqueante)

Un único modelo de roles. `log` abandona `app_metadata.role`.

- Migración `roles_plataforma_rbac.sql`: roles `dev/ops/product` en `public.roles`, permisos por `app_slug`, funciones `public.current_user_role_slug()` y `public.user_has_app_permission(app_slug)`, policies de `log_entries` migradas.
- `src/apps/log/src/lib/authz.ts` y `auth-supabase.ts` resuelven por perfil RBAC.
- Validación: check-types, lint, test:unit, `db:scripts:validate`, `db:push` (staging). Changeset: `log` minor (+ `@repo/auth` si aplica).

### Paso 2 - `feat/rum-esquema-db`

Tablas `rum_events`, `rum_vitals`, `rum_sessions`, `rum_sampling_config` + índices + RLS (escritura pública solo insert, lectura dev/ops/product) + RPC `check_rum_rate_limit`.

- Validación: `db:scripts:validate`, `db:push` (staging). Sin changeset (solo DB).

### Paso 3 - `feat/rum-ingesta-endpoints`

`POST /api/rum` y `POST /api/rum/vitals` en app `log`: Zod, taxonomía whitelist, anti-PII, rate limit separado (429), sampling por `rum_sampling_config`.

- Archivos: `rum-data.ts`, `rum-repository.ts`, `pages/api/rum.ts`, `api/rum/vitals.ts` + tests (TC-LOG-RUM-001..015).
- Validación: check-types, lint, test:unit (≥90% críticos). Changeset: `log` minor.

### Paso 4 - `feat/analytics-sdk`

Paquete `@repo/analytics` source-only: `init/track/captureVitals/respectDNT/hasConsent/setConsent`, `sendBeacon` + fallback, <5KB, try-catch global, DNT y consentimiento.

- Validación: check-types, lint, test:unit, tamaño verificado. Changeset: `@repo/analytics` minor.
- Nota: si expone `PUBLIC_RUM_API_URL`, añadirla a `globalEnv` de `turbo.json`.

### Paso 5 - `feat/rum-dashboard-producto`

`/dashboard-producto` (dev/ops/product) separado del operativo: embudos, retención, top páginas, Web Vitals.

- Validación: check-types, lint, test:unit. Changeset: `log` minor.

### Paso 6 - `feat/notification-core-paquete`

Convertir `notification-core` (carpeta fantasma sin `package.json`) en paquete real source-only: plantillas versionadas, taxonomía de eventos, preferencias, cola con reintentos e idempotencia por `event_id`. Lógica pura, sin DB ni red.

- Validación: check-types, lint, test:unit. Changeset: `@repo/notification-core` minor.

### Paso 7 - `feat/notificaciones-esquema-db`

Tablas `notification_templates`, `notification_events` (idempotencia por `event_id`), `notification_preferences` (RLS por dueño), `notification_queue`.

- Validación: `db:scripts:validate`, `db:push` (staging). Sin changeset.

### Paso 8 - `feat/logueo-app`

App `src/apps/logueo/` (Astro SSR + `@repo/ui`) con endpoints `api/auth/{login,logout,session,me}`, `api/consents`, `api/sessions`, delegando en `@repo/auth` (RBAC).

- Validación: check-types, lint, test:unit. Changeset: `logueo` minor.

## Dependencias

`0` → `1` → `2` → `3` → `4` → `5` → `6` → `7` → `8`

Los pasos 2-3 y 7 dependen del modelo de roles del paso 1; el 4 depende del endpoint del 3; el 8 consolida la auth iniciada en 1.

## Riesgos

- Paso 1 toca RLS en producción de `log`: requiere verificación de policies (riesgo de dejar la app sin acceso).
- Ingesta pública: el rate limit es la única barrera; revisar umbrales tras el primer despliegue.
- Tamaño del SDK <5KB: añadir check en CI en el paso 4.
- `notification-core` no tiene `package.json`: el nombre del workspace se fija en el paso 6.
