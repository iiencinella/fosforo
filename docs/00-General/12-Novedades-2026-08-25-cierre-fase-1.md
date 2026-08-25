---
tags:
  - proyecto/fosforo
  - novedades
  - fase-1
  - cierre
type: novedad-documental
area: general
status: vigente
created: 2026-08-25
updated: 2026-08-25
related:
  - "[[06-PRD-Maestro|PRD Maestro]]"
  - "[[04-Listado-de-Aplicaciones|Listado de Aplicaciones]]"
---

# Novedad documental - Verificación y complementación del cierre de Fase 1

## Contexto

Auditoría integral del estado de Fase 1 para habilitar producción: verificación de pendientes declarados por app contra código, base de datos remota y deployments reales; saneamiento de esquemas duplicados; implementación de matrices de tests pendientes y reclasificación documental.

## Hallazgos de la verificación (2026-08-25)

- **Deployments activos:** portal, biblia, calendario (`fosforo-calendario.vercel.app`, no reflejado en novedades previas), usuario y log responden health OK. Horarios y administracion sin deploy.
- **Portal:** health devolvía 500 por variables de entorno faltantes (hoy degradado controlado); feedback sin rate limit; limitador de contacto era in-memory duplicado.
- **Calendario:** gates de integración remota 3/3 OK; E2E en producción 3/5 — el deploy no entrega `s-maxage=300` que el código define (investigar adapter/build).
- **Duplicación estructural crítica:** administracion escribía iglesias/horarios en `churches`/`celebration_schedules` mientras la app pública horarios lee `horarios_temples`/`horarios_celebrations` — dos esquemas paralelos sin relación: los datos cargados por el panel nunca llegaban al sitio público.
- **Bug real detectado por la matriz de tests de horarios:** la validación de latitud aceptaba valores fuera de [-90, 90] (usaba el rango de longitud).
- **BD remota:** ninguna tabla huérfana (29/29 referenciadas); tablas de identidad, panel y catálogo de templos vacías; historial de migraciones con 4 scripts aplicados fuera del CLI.
- **Reclasificación aprobada:** Espiritualidad diaria, Notificaciones, CMS y Motor Litúrgico movidos a Fase 2.

## Cambios aplicados

### feat/consolidacion-esquema-templos

- Panel de administración opera sobre `horarios_temples`/`horarios_celebrations` (mismo flujo panel→app pública): mapeo weekday/tipos, slugs de id, RLS por roles admin/editor/viewer sobre las tablas consolidadas.
- Migración `20260826000001_consolidacion_templos.sql`: columnas aditivas (`country`, `contact_email`, `website`, `is_active`), índice único nombre+ciudad, auditoría con ids textuales, RPC de métricas reescrita y DROP de tablas legacy. **Aplicar con aprobación.**
- App horarios filtra `is_active = true`.

### test/horarios-admin-unitarios

- 54 tests nuevos cubriendo las matrices TC-0106 (10 casos) y TC-0107 (8 casos); corrección del bug de latitud; docs de tests actualizados con estado Implementado.

### fix/portal-feedback-ratelimit-health

- Rate limit compartido para contacto y feedback (5 req/min/IP); health degrada a 503 si falta configuración; helper `rate-limit.ts` con tests (candidato a promoverse a `@repo/api-utils`).

### test/biblia-ingesta-contrato

- Contrato de seguridad del endpoint de ingesta cubierto (503 fail-closed, 401/403, aceptación header/Bearer).

### chore/seeds-y-baseline

- `db/scripts/seed-admin-bootstrap.sql` (roles base + primer admin, idempotente) y `db/scripts/baseline-migraciones.sql`. **Sin aplicar: requieren aprobación del owner.**

### docs/reclasificacion-fase-1

- PRD Maestro §12: los cuatro módulos pasan a Fase 2 con nota de decisión. Catálogo del sync script y matrices regeneradas. READMEs de portal/calendario/usuarios alineados al estado real. Runbooks operativos nuevos para calendario y portal.

## Validaciones ejecutadas

- Suite unitaria completa: 10/10 paquetes verde (~250 tests tras los cambios).
- astro check limpio en administracion, horarios, portal y biblia.
- Gates de calendario contra Supabase remoto y E2E contra producción.
- `pnpm db:scripts:validate` requiere env global no disponible en este entorno (verificar en CI).
- `pnpm audit --prod`: 11 vulnerabilidades (1 crítica, 6 altas) todas en dependencias transitivas de build (`tar`, `brace-expansion`, `@babel/core`). Mantener `security-audit.yml` no bloqueante hasta aplicar overrides (`tar@>=7.5.17`) o actualizar cadenas afectadas.

## Pendiente (requiere owner)

1. Aprobar y aplicar migración de consolidación + seeds + baseline (MCP con email del primer admin).
2. Configurar env Vercel: Supabase del portal; `LOGS_API_URL`/`LOGS_API_KEY` al desplegar horarios y administracion.
3. URLs de recovery en dashboard Supabase para la app usuario.
4. Carga real de datos: templos/horarios vía panel ya preparado; contenido bíblico (uso interno por licencia).
5. Investigar caché de calendario en producción; desplegar horarios y administracion; overrides de audit y endurecer workflow de seguridad.
