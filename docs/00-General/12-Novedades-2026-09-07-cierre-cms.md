---
tags:
  - proyecto/fosforo
  - novedades
  - cms
  - cierre
  - fase-1
type: novedades
area: general
status: vigente
created: 2026-09-07
updated: 2026-09-07
related:
  - "[[03-Indice-General|Indice General]]"
  - "[[12-Novedades-2026-09-07-cierre-fase-0|Novedades cierre Fase 0]]"
  - "[[../plans/2026-09-05-plan-maestro-fase-2-ecosistema|Plan Maestro Fase 2]]"
---

# Novedades 2026-09-07 - Cierre del CMS (Fase 1, paso 1.1)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

Se completo la aplicacion CMS del ecosistema (`src/apps/cms`), primera etapa de la Fase 1 del orden de desarrollo. Nueve pasos secuenciales (una rama por paso, PR y merge entre pasos) implementaron el MVP completo de los contratos documentados en `docs/02-Aplicaciones/FASE_2-Sistema-de-Contenidos-CMS/WEB/`: roles editoriales, esquema con RLS por rol, flujo editorial con revisiones inmutables, taxonomias, API de lectura publica con cache, medios en Storage, busqueda y webhooks firmados de publicacion.

## Por que se aplico

El CMS es la fuente de verdad de contenido del ecosistema: Misal, Santopedia, Oraciones, Vida de Misionero, Visita 7 Iglesias y Lectio Divina consumen su API de lectura; ninguna de esas apps puede arrancar sin el. Documentar antes de construir (plan maestro) y desarrollar por pasos con PRs revisables replico la metodologia validada en la Fase 0.

## Que se implemento (por paso, uno por rama)

### Paso 1 - `feat/cms-roles-editor-revisor` (PR #60)

Roles editoriales `editor` (30) y `revisor` (31) en el RBAC compartido + permisos de app cms para admin/editor/revisor; `@repo/auth` ampliado (ECOSYSTEM_ROLE_SLUGS/HIERARCHY).

### Paso 2 - `feat/cms-esquema-db` (PR #61)

Las 8 tablas del contrato (`content_types`, `content_entries`, `content_revisions`, `content_taxonomies`, `content_terms`, `content_entry_terms`, `content_media`, `content_audit_log`) con las transiciones de estado aplicadas EN RLS: el editor no puede dejar filas en published/archived (RB-CMS-004 en DB, no solo UI); el revisor solo mueve review→published|draft; admin sin restricciones. Revisiones inmutables (revokes) y auditoria append-only.

### Paso 3 - `feat/cms-app-base` (PR #62)

Scaffold Astro SSR con auth delegada en la app logueo (`PUBLIC_LOGUEO_URL` + `return_to`, guard `requireAppPermission(cms)` estrenado), RUM dia 1 con banner de consentimiento, y primitivas reutilizables en `@repo/ui` (`DataTable.astro`, `FormField.astro`) segun la regla AGENTS.md. Deps de Markdown al catalogo (marked, sanitize-html).

### Paso 4 - `feat/cms-content-types` (PR #63)

CRUD admin de content types con seis tipos de campo (`text/number/date/markdown/reference/media`) y opciones tipadas; `buildEntryDataSchema` genera la validacion Zod del jsonb `data` en modo strict (ADR-CMS-003); slug inmutable (RB-CMS-008); CMS_001 (409) con auditoria.

### Paso 5 - `feat/cms-entries-flujo-editorial` (PR #64)

El corazon del panel: entradas con revisiones inmutables por guardado, maquina de estados con doble enforcement (app + RLS), rechazo con motivo obligatorio, locking optimista por `updated_at` (ERM-CMS-001), auditoria por operacion y transicion con registro de la version publicada reemplazada (RB-CMS-003), render Markdown sanitizado server-side (marked + sanitize-html, SEC-CMS-007) con vista previa, y panel con listado paginado filtrable, editor y acciones por rol/estado.

### Paso 6 - `feat/cms-taxonomias` (PR #65)

Taxonomias y terminos (solo admin, slugs inmutables, unicidad por taxonomia), asignacion N:M a entradas (set completo con reemplazo, auditoria), filtro de listado por slug de termino, y seccion de checkboxes por taxonomia en el editor.

### Paso 7 - `feat/cms-api-lectura` (PR #66)

API publica `GET /api/content/{content_type}` para las apps consumidoras: API key por app (tabla `content_api_keys` con hash SHA-256 + RPC de rate limit 100 req/min), solo `published`, filtros por slug y termino, contrato `{ ok, data, total, page, limit }` (hueco documental fijado), entradas con `title`, `data`, `rendered` sanitizado y `terms` (CA-CMS-003). Cache doble capa: en memoria con TTL configurable (`CMS_CACHE_TTL_SECONDS`, tope 5 min) e invalidacion por content type + edge `s-maxage=300, stale-while-revalidate=600` con `x-cache: HIT/MISS`.

### Paso 8 - `feat/cms-medios-busqueda` (PR #67)

Bucket publico `cms-media` en Storage con policies de escritura solo admin/editor; subida webp/jpeg ≤2MB (CMS_004) con registro en `content_media` y URL publica; RPC de busqueda security-invoker (la RLS filtra por rol en el panel; la API publica pasa `published`); `GET /api/admin/search` y `GET /api/content/search` (API key + rate limit, minimo 3 caracteres).

### Paso 9 - `feat/cms-webhook-publicacion` (PR #68)

Suscripciones con URL https y secreto HMAC-SHA256 por suscripcion (panel solo admin); al aprobar una entrada, fire-and-forget: invalidacion de cache → webhook firmado (`x-cms-signature`, 3 intentos con backoff) → evento `cms.entry.published` al RUM. La transicion nunca se bloquea por el despacho (SLO-CMS-006).

## Validaciones ejecutadas

- `pnpm check-types` y `pnpm test:unit` por paso: **147 tests unitarios en cms** (15 suites) + 17 en `@repo/auth` actualizados; builds completos de la app en cada paso.
- `db:scripts:validate` no ejecutable en el entorno (env vars de Supabase): las 5 migraciones del CMS (`20260907000001..000005`) quedan como paso operativo con verificaciones manuales.
- Desarrollo 100% secuencial: cada rama nacio de un `main` con el paso anterior mergeado.

## Decisiones y desviaciones documentadas

- **Contrato de respuesta de la API** (`{ ok, data, total, page, limit }`) y estados `archived→draft` solo admin: huecos documentales fijados durante los pasos 2 y 7.
- **Retencion por cohorte**: proxy de actividad diaria por privacidad (ADR-LOG-RUM-004) — correccion doc pendiente en la app Log.
- **Notificacion a revisores/editores (IR-CMS-004)**: queda ligada a la app Sistema de Notificaciones (pendiente de construir); el audit_log ya deja trazabilidad.
- **Gestion de API keys**: sin panel en MVP (se siembran a mano en `content_api_keys`); incremento futuro.
- **Editor de content types con JSON textarea**: pragmatico para admin tecnico; editor visual post-MVP (docs: fuera del alcance WYSIWYG).

## Pendientes y riesgos

1. Aplicar las 5 migraciones del CMS en staging/produccion y verificar las policies por rol (un editor no puede publicar; un revisor no puede crear).
2. Configurar `PUBLIC_LOGUEO_URL`, `PUBLIC_RUM_API_URL` y `CMS_CACHE_TTL_SECONDS` (opcional) en los deploys.
3. Sembrar la primera API key (`content_api_keys`) y probar el flujo E2E: crear content type → entrada → revision → publicar → leer via API → recibir webhook.
4. Consolidar el PR de Version Packages del bot de changesets.
5. La app CMS consume `consents`/`audit_log` del ecosistema: verificar permisos tras aplicar migraciones previas.

## Siguiente etapa

Fase 1.2: **Motor Liturgico** (calculo determinista + API `/api/liturgia/{fecha}`), que libera Misal y Lectio Divina. Luego Fase 2 (piloto Horarios) y Fase 3 (Misal primero).
