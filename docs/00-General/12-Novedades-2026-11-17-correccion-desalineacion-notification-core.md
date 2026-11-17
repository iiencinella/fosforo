---
tags:
  - proyecto/fosforo
  - novedades
  - notificaciones
  - documentacion
  - desalineacion
type: novedades
area: general
status: vigente
created: 2026-11-17
updated: 2026-11-17
related:
  - "[[../plans/2026-09-05-plan-maestro-fase-2-ecosistema|Plan Maestro Fase 2]]"
  - "[[../02-Aplicaciones/FASE_2-Sistema-de-Notificaciones/WEB/00-README|App Sistema de Notificaciones]]"
  - "[[../01-Arquitectura/Capacidades Compartidas/SRS-Notificaciones-y-Plantillas|SRS Notificaciones]]"
---

# Novedades 2026-11-17 - Correccion de desalineacion documental de notification-core

## Resumen

Se corrigio la desalineacion detectada en la revision de la Fase 2: tres documentos
declaraban que el paquete `src/packages/notification-core` era un "shell vacio sin logica",
pese a estar implementado desde el cierre de la Fase 0 (2026-09-07, PR #56 y #57).

## Por que se aplico

La documentacion vigente debe reflejar el estado real del codigo (AGENTS.md). La afirmacion
"shell vacio" era correcta al 2026-09-05 (fecha de la ola documental de Fase 2) pero quedo
desactualizada dos dias despues, al completarse la Fase 0, y contradecia las novedades de
cierre (`12-Novedades-2026-09-07-cierre-fase-0.md`).

## Que se cambio

1. `docs/02-Aplicaciones/FASE_2-Sistema-de-Notificaciones/WEB/00-README.md`
   - Seccion "Estado de implementacion" reescrita: logica real del paquete (canales y
     categorias, plantillas versionadas con render estricto, preferencias por
     canal+categoria, cola con idempotencia por `event_id`, 3 intentos y backoff
     exponencial; 23 tests en 3 suites), esquema DB de las 4 tablas en la migracion
     `20260906000004` (PR #57) y pendientes reales (lote DB en produccion, app dedicada
     `src/apps/notificaciones/`, integracion de consumidores y tests de integracion).
   - Frontmatter `updated` y fecha de metadatos: `2026-09-05` -> `2026-11-17`.
2. `docs/01-Arquitectura/Capacidades Compartidas/SRS-Notificaciones-y-Plantillas.md`
   - Parrafo "Estado de implementacion" actualizado al estado real (Fase 0, PR #56;
     migracion `20260906000004` pendiente en produccion).
   - Frontmatter `updated`: `2026-09-05` -> `2026-11-17`.
3. `docs/01-Arquitectura/Capacidades Compartidas/Catalogo-de-Capacidades-Compartidas.md`
   - Fila y observacion de `notification-core` corregidas.
   - Bonus de la misma revision: fila "Identidad y acceso" corregida (agrega `@repo/auth`;
     Logueo pasa de `draft` a `vigente; implementada PR #58`), observacion asociada y
     fecha del heading a `2026-11-17`.

## Validaciones ejecutadas

- `node scripts/docs-sync-app-status.mjs`: EXIT 0, matrices sin cambios.
- `grep "shell vac"` sobre `docs/`: sin restos, salvo el registro historico
  `12-Novedades-2026-09-05-documentacion-fase-2.md` (se mantiene: narra lo registrado
  ese dia, antes del cierre de Fase 0).

## Pendientes fuera de alcance de este cambio

1. Metadatos internos `- Estado: draft` desactualizados en los README de usuarios, log y
  logueo (el frontmatter ya es `vigente`; detectado en la auditoria 2026-11-15, punto C3
  parcialmente resuelto).
2. Aplicacion en produccion del lote DB de Fase 0 (`20260906000002..000005`).
