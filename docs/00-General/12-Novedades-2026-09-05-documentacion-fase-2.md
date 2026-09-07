---
tags:
  - proyecto/fosforo
  - novedades
  - planificacion
  - fase-2
type: novedades
area: general
status: vigente
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[03-Indice-General|Indice General]]"
  - "[[../plans/2026-09-05-plan-maestro-fase-2-ecosistema|Plan Maestro Fase 2]]"
---

# Novedades 2026-09-05 - Documentación Fase 2 del ecosistema

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

Se documentó íntegramente la planificación de Fase 2 del ecosistema antes de implementar código: 10 apps nuevas con su secuencia documental completa (00-README a 11-SLA y SLO), reescritura de Log con extensión RUM/Analíticas, auditoría de Horarios de Misas como piloto de migración, y actualización de capacidades transversales e índices. Total: 133 documentos escritos o actualizados. Sin cambios de código.

## Por qué se aplicaron

El orden "base primero, contenido después" exige que las capacidades compartidas (CMS, Motor Litúrgico, Notificaciones, Logueo/Auth, Observabilidad+RUM) queden especificadas antes de construir las apps que las consumen (Misal, Santopedia, Oraciones, Vida de Misionero, Visita 7 Iglesias, Lectio Divina). Documentar antes de implementar sigue el flujo de AGENTS.md y deja contratos verificables (IDs PRD/FR/NFR/CA/TC/SEC/SLO) para el desarrollo.

## Qué se creó / modificó

### Bloque A - Capacidades transversales (4 archivos editados)

- `docs/01-Arquitectura/Capacidades Compartidas/SRS-Observabilidad-y-Auditoria.md`: ampliado con RUM (FR-OBS-010..013, NFR-OBS-010..012, CA-OBS-010/011).
- `SRS-Identidad-y-Acceso.md`: vinculado como contrato de la app Sistema de Logueo.
- `SRS-Notificaciones-y-Plantillas.md`: vinculado a la app; registrado que `notification-core` es shell vacío.
- `Catalogo-de-Capacidades-Compartidas.md`: nueva tabla de mapeo capacidades ↔ paquetes ↔ apps (draft/vigente/objetivo).

### Bloque B - Plataforma (4 apps, 48 docs nuevos)

- `docs/02-Aplicaciones/FASE_2-Sistema-de-Contenidos-CMS/WEB/` (IDs `CMS-*`): content types, flujo editorial, API de lectura con cache, taxonomías, medios.
- `FASE_2-Motor-Liturgico/WEB/` (IDs `MOTOR-LIT-*`): cálculo fecha→celebración, Pascua, colores, API `/api/liturgia/{fecha}`.
- `FASE_2-Sistema-de-Notificaciones/WEB/` (IDs `NOTIF-*`): plantillas versionadas, multicanal, preferencias, cola con reintentos, idempotencia.
- `FASE_1-Sistema-de-Logueo/WEB/` (IDs `AUTH-*`): SSO Supabase, roles, sesiones, consentimientos, auditoría de accesos. Desambiguado respecto de la app Log.

### Bloque C - Log + RUM (12 docs reescritos en `FASE_1-0105_log/WEB/`)

- Estado de vigente a draft (nueva extensión). MVP de logs conservado; añadido: SDK `@repo/analytics` (nuevo paquete), tablas `rum_events`/`rum_vitals`/`rum_sessions`/`rum_sampling_config`, dashboard de producto (`/dashboard-producto`) separado del operativo, anonimización/consentimiento/DNT, sampling configurable (IDs `RUM-MVP-*` y `LOG-RUM-*`).

### Bloque D - Contenido y comunidad (6 apps, 72 docs nuevos)

- `FASE_2-Misal/WEB/` (IDs `MISAL-*`): lecturas del día vía Motor + CMS, ordinario, modo lectura, favoritos.
- `FASE_2-Santopedia/WEB/` (IDs `SANTO-*`): enciclopedia de santos, buscador, santo del día, JSON-LD.
- `FASE_2-Oraciones/WEB/` (IDs `ORAC-*`): colecciones de oraciones, colecciones personales, modo lectura.
- `FASE_2-Vida-de-Misionero/WEB/` (IDs `MISION-*`): rutas, misiones diarias, progreso con idempotencia, insignias, streak con TZ.
- `FASE_2-Visita-7-Iglesias/WEB/` (IDs `V7I-*`): itinerarios por ciudad, registro idempotente de visitas, progreso x/7.
- `FASE_2-Lectio-Divina/WEB/` (IDs `LECTIO-*`): sesión guiada en 5 pasos, diario privado (RLS estricto), autoguardado.

Todas integran RUM desde el día 1 y declaran dependencias sobre las capacidades del Bloque B.

### Bloque E - Auditoría Horarios (solo lectura)

- `docs/plans/2026-09-05-auditoria-horarios-migracion.md`: 11 gaps (G-01..G-11) contra la base de plataforma, priorización P1/P2/P3, plan de migración y criterios de cierre. Los docs de `FASE_1-0106_horarios/` NO fueron modificados.

### Bloque F - Índices y cierre

- `scripts/docs-sync-app-status.mjs`: aliases corregidos (`sistema-de-notificaciones`, `sistema-de-contenidos-cms` sin acento; "Auth" unificado como alias de "Sistema de Logueo").
- `docs/00-General/04-Listado-de-Aplicaciones.md` y `docs/02-Aplicaciones/00-README.md`: regenerados con `pnpm docs:sync-app-status` (16 apps documentadas; CMS, Notificaciones y las 6 apps Fase 2 quedan "Documentada: Si").
- `docs/plans/2026-09-05-plan-maestro-fase-2-ecosistema.md`: estado de ejecución por bloque.

## Estado de documentos

- Todos los docs nuevos/reescritos: `status: draft`, owner `Iván Ezequiel Iencinella`, leyenda "Generado con Kimi K3 (Moonshot AI)".
- Apps preexistentes (portal, biblia, calendario, usuarios, horarios, log MVP vigente, cancionero): intactas fuera del alcance, salvo Log (reescritura de planificación).

## Validaciones ejecutadas

- Verificación de 12/12 docs con leyenda y 0 placeholders por cada app del alcance.
- Regeneración de índices con `pnpm docs:sync-app-status` (sin filas duplicadas; "Auth" ya no aparece como app fantasma).
- No aplica lint/typecheck/tests: cambio 100% documental (Markdown), sin código fuente.

## Pendientes y riesgos

- Los contratos de las capacidades (CMS/Motor/Notificaciones/Auth/RUM) están en draft: no congelar implementación hasta su aprobación (gap G-11 de la auditoría Horarios).
- `src/packages/analytics` (SDK RUM) y `src/packages/notification-core` (implementación) aún no existen.
- Decisión pendiente: changeset para este PR — el cambio es 100% documental sin paquetes afectados; se recomienda no versionar o definir una convención para cambios solo de docs.
- La auditoría detectó contradicción interna en Horarios (README vs 05-Tests sobre estado de tests) que deberá resolverse al migrar.
