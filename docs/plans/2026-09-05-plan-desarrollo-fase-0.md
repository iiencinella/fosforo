---
tags:
  - proyecto/fosforo
  - plan
  - desarrollo
  - fase-0
type: plan-desarrollo
area: general
status: vigente
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[2026-09-05-plan-maestro-fase-2-ecosistema|Plan Maestro Fase 2]]"
  - "[[2026-09-05-auditoria-horarios-migracion|Auditoria Horarios]]"
---

# Plan de Desarrollo - Fase 0 (Infraestructura compartida)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

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
