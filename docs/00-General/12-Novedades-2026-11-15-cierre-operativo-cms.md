---
tags:
  - proyecto/fosforo
  - novedades
  - cms
  - cierre-operativo
  - base-de-datos
type: novedades
area: general
status: vigente
created: 2026-11-15
updated: 2026-11-15
related:
  - "[[12-Novedades-2026-09-07-cierre-cms|Novedades cierre CMS]]"
  - "[[../plans/2026-09-05-plan-maestro-fase-2-ecosistema|Plan Maestro Fase 2]]"
---

# Novedades 2026-11-15 - Cierre operativo del CMS (migraciones, API key y desalineacion documental)

> Ejecutado con GLM 5.3 (Z.ai). Owner: Iván Ezequiel Iencinella.

## Resumen

Se cerraron los pendientes operativos heredados del cierre del CMS (2026-09-07): se aplicaron en
produccion la migracion de prerrequisito RBAC (`20260906000001`) y las 5 migraciones del CMS
(`20260907000001..000005`), se registro el historial via `migration repair`, se verificaron
policies, grants, bucket de Storage e inmutabilidad de auditoria, y se sembro la primera API key
de lectura. Ademas se corrigio la desalineacion documental del README de la app CMS
(`docs/02-Aplicaciones/FASE_2-Sistema-de-Contenidos-CMS/WEB/00-README.md`), que seguia declarando
"Sin implementacion" pese al cierre del 2026-09-07.

## Por que se aplico

Los pendientes #1, #3 y #5 del cierre del CMS bloqueaban cualquier uso real del panel y de la API
de lectura: sin tablas ni API key no hay contenido que publicar ni apps consumidoras que leer. La
desalineacion documental, detectada en el analisis de estado del 2026-11-15, contradecia a la
matriz de apps y al plan maestro.

## Que se hizo

### 1. Correccion documental del README del CMS

Rama `docs/cms-readme-estado-implementacion` (2 commits): `status`/`Estado` de `draft` a
`vigente`, seccion "Estado de implementacion" actualizada (MVP completado, cierre operativo,
incrementos post-MVP), "Ubicacion del codigo" sin "(a crear)" y enlace a las novedades de cierre
en `related`.

### 2. Analisis de drift del historial de migraciones

Vinculo del proyecto con la CLI (`pnpm db:link`): `pvhrntbwhzlosetallpl` (fosforo, production).
`migration list` mostro historial remoto con 32 entradas cuyas versiones en su mayoria NO
coinciden con los 25 archivos locales (solo `20260820001510` matchea); `migration up` en bloque
habria chocado con colisiones (ej. `202605260001` presente en ambos lados).

Introspeccion de produccion (solo lectura) previa a migrar:

- Tablas CMS: NINGUNA (pendiente confirmado). `roles`/`permissions`: presentes.
- Funciones `current_user_role_slug`/`user_has_app_permission`: ausentes (dependencia de las
  policies del CMS, definidas por `20260906000001`).
- `profiles` con `role_id`: presente. `log_entries`: presente con policies equivalentes.
  `audit_log` (app Log): presente. `consents` y tablas `rum_*`: ausentes (pipeline RUM de Fase 0,
  fuera del alcance de hoy).
- Roles en produccion: admin(1), sacerdote(20), coordinador(40), musico(60), usuario(100).

### 3. Aplicacion controlada de migraciones (6 archivos)

Aplicacion manual y secuencial con `supabase db query --file <archivo> --remote --yes`
(CLI v3.1.0), en este orden:

1. `20260906000001_unificacion_roles_plataforma.sql` (prerrequisito: funciones RBAC, roles
   plataforma dev/ops/product y reescritura de policies de `log_entries`)
2. `20260907000001_cms_roles.sql`
3. `20260907000002_cms_core.sql`
4. `20260907000003_cms_api_keys.sql`
5. `20260907000004_cms_media_busqueda.sql`
6. `20260907000005_cms_webhooks.sql`

Sin errores en ningun paso. Luego `supabase migration repair --status applied --remote --yes`
para las 6 versiones, dejando el historial del CLI consistente.

### 4. Verificacion post-migracion (catalogo, solo lectura)

- 11 tablas `content_*` creadas; RLS habilitado en las 11; 26 policies aplicadas.
- Funciones presentes: `current_user_role_slug`, `user_has_app_permission`, `has_cms_access`,
  `search_content_entries`, `check_content_api_key_rate_limit`.
- Roles editoriales: `editor`(30) y `revisor`(31) con permiso de app `cms` (admin/editor/revisor).
- Bucket `cms-media`: publico, limite 2MB, con las 4 policies de Storage.
- Grants: anon/authenticated con SELECT (RLS filtra), `content_api_keys` y
  `content_api_key_rate_limits` revocadas para anon/authenticated.
- `content_audit_log` inmutable: policies solo insert (editorial) y select (admin/dev/ops).
- RPC `check_content_api_key_rate_limit` con EXECUTE solo para `service_role` (la prueba
  manual devolvio "permission denied" desde otro rol: hardening SEC-CMS-006 funcionando).

### 5. Primera API key de lectura

Sembrada en `content_api_keys` con el patron del ecosistema (`generate-log-api-keys.js`): key
aleatoria de 64 hex, hash SHA-256 en `key_hash`, key en claro entregada una sola vez por chat
(no versionada en el repo ni en este archivo). Registro: id
`4383ae31-119e-47ba-bd92-e45d43b849d9`, `app_name` `cms-e2e`, `is_active` true.

## Validaciones ejecutadas

- `node db/scripts/validate.js`: OK (credenciales de CLI completas en `.env` gitignoreado).
- Introspeccion antes/despues via `db query --read-only` (informacion_schema + catalogo).
- `pnpm docs:sync-app-status`: sin cambios (matriz ya consistente).
- Verificacion de conflictos del PR Version Packages del bot: `git merge-tree` limpio
  (mergeable sin conflictos).

## Decisiones y desviaciones documentadas

- **Aplicacion manual + `migration repair` en vez de `migration up`**: el historial remoto de
  produccion derivo de ejecuciones historicas fuera del CLI; aplicar en bloque habria fallado por
  colisiones de version. Se aplico solo lo necesario para el CMS y se registro su historial. El
  drift restante (≈23 locales sin par remoto, ≈30 remotas sin archivo local) queda como hallazgo.
- **Prerrequisito fuera del scope de las 5 migraciones**: `20260906000001` se aplico porque las
  policies del CMS dependen de sus funciones RBAC; sin el, `content_types_write_admin` y demas
  policies fallarian al evaluarse.
- **Consents/RUM no aplicados**: el CMS no consulta `consents` directamente (va via
  `PUBLIC_RUM_API_URL`); su tabla pertenece al pipeline RUM de Fase 0, pendiente de desplegar.
- **Defensa en profundidad (recomendacion)**: los default privileges de Supabase dejan SELECT a
  anon en `content_audit_log` y `content_webhook_subscriptions`; RLS los protege (0 filas), pero
  un `revoke` explicito endurece el estado. Queda como incremento, para no desviar la DB del
  estado canonico de las migraciones.

## Pendientes y riesgos

1. Merge de los PRs `docs/cms-readme-estado-implementacion` y `docs/cierre-operativo-cms`.
2. Merge del PR Version Packages del bot (sin conflictos verificados).
3. Configurar en Vercel (proyecto cms) y redesplegar: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `PUBLIC_LOGUEO_URL` (base URL de logueo), `PUBLIC_RUM_API_URL` (base URL de log; el SDK agrega
   `/api/rum`) y `CMS_CACHE_TTL_SECONDS` (opcional, tope 5 min). `SUPABASE_SERVICE_ROLE_KEY`
   donde haga falta para escrituras privilegiadas.
4. E2E HTTP completo post-deploy: content type -> entrada -> revision -> publicar -> leer via API
   con la key -> webhook firmado.
5. Verificacion de policies con usuarios reales asignados a editor/revisor (hoy no hay profiles
   con esos roles).
6. Auditoria de drift de migraciones (hallazgo del punto 2) y aplicacion del lote Fase 0
   (`20260906000002..000005`: rum_core, rum_dashboard_metrics, notificaciones_core,
   consentimientos) cuando se despliegue el pipeline RUM/Notificaciones.
7. `/api/rum` requiere la `LOGS_API_KEY`/config del app log al desplegar el pipeline.

## Siguiente etapa

Fase 1.2: **Motor Liturgico** (calculo determinista + API `/api/liturgia/{fecha}`), que libera
Misal y Lectio Divina, segun el plan maestro Fase 2.
