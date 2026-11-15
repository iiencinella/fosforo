---
tags:
  - proyecto/fosforo
  - novedades
  - documentación
  - auditoria
  - remediacion
type: novedades
area: general
status: vigente
created: 2026-11-15
updated: 2026-11-15
related:
  - "[[19-Auditoria-Documental-2026-11-15|Auditoria Documental 2026-11-15]]"
  - "[[12-Novedades-2026-11-15-cierre-operativo-cms|Novedades cierre operativo CMS]]"
  - "[[01-Guia-Lectura-Desarrolladores-e-IA|Guia de lectura]]"
---

# Novedades 2026-11-15 - Remediacion documental (plan de la auditoria)

> Ejecutado con GLM 5.3 (Z.ai). Owner: Iván Ezequiel Iencinella. Rama: `docs/auditoria-documental`.

## Resumen

Se ejecuto el plan de remediacion completo propuesto por la auditoria documental del mismo dia
(`19-Auditoria-Documental-2026-11-15.md`): canon del doc 09 fijado sin tilde en la raiz
generadora, 19 enlaces relativos y 10 wiki-links corregidos, estados de implementacion
realineados con el codigo, vocabulario de `status` normalizado, frontmatter completado y
renombrados de archivos "Novedas". Verificacion final: **0 enlaces rotos** (634 relativos +
wiki dentro de `docs/`).

## Por que se aplico

La auditoria detecto deuda sistemica: una convencion dual con/sin tilde que generaba enlaces
rotos en cada app nueva, READMEs de apps implementadas que declaraban estado desactualizado
(draft o pendientes ya resueltos), y un vocabulario de `status` sin normalizar. Dejarlo asi
degradaba la confiabilidad de la documentacion como fuente de verdad, que es su rol principal
segun la guia de lectura.

## Que se hizo

1. **Canon (A1)**: `AGENTS.md`, `docs/README.md` y el scaffold `scripts/docs-new-app.mjs`
   ahora especifican `09-Especificacion Tecnica.md` (sin tilde), coincidiendo con la practica
   real de las 18 apps.
2. **Enlaces relativos (D2)**: 19 corregidos — doc 09 con tilde en 8 READMEs de app + plantilla,
   "Maestro" con espacio en la matriz de trazabilidad, SRS con tilde/ñ, `Plan-Unificación`,
   profundidad de `../` en `log/01-PRD` y `db/README.md` en Santopedia 06/07.
3. **Wiki-links (D1)**: `06-PRD-Maestro`, `03-Indice-General`, rutas reales de plantilla
   (sin subcarpeta WEB) y del indice de capacidades compartidas. `../LICENSE`/`../NOTICE`
   quedan sin cambio: resuelven en la raiz del repo, fuera del vault de `docs/`.
4. **Estados de apps (C2-C4)**: usuarios y log `draft`→`vigente` (implementadas y desplegadas);
   logueo ademas con su seccion "Estado de implementación" reescrita (la app se cerro en el PR
   #58 de Fase 0 y el README declaraba "Pendiente: App dedicada"); Santopedia con su
   documentacion WEB pasada a "Completado" (mantiene `draft` por no tener workspace, correcto);
   administracion: su seccion ya existia (falso positivo de la auditoria por tilde), solo se
   actualizo su linea de tests (ya hay 5 suites).
5. **Frontmatter (B)**: vocabulario normalizado (`completado`→`archivado` en plan Fase 0,
   `propuesto`→`vigente` en Plan Unificacion Estilos, `active`→`vigente` en Plantilla SRS);
   frontmatter nuevo en `02-Aplicaciones/00-README.md` y 2 planes de `docs/plans/`; `updated:`
   agregado a 8 archivos; tag `novedas`→`novedades`; renombrado
   `Novedades-2026-08-25-control-de-versiones.md` → `12-Novedades-2026-08-25-control-de-versiones.md`.
6. **Renombres (A2)**: 6 archivos `12-Novedas-*` → `12-Novedades-*` en biblia (4) y calendario
   (2), con titulos internos corregidos.
7. **Canon extendido (A3)**: AGENTS.md formaliza las extensiones habilitadas de slots 12/13
   por app (`12-Novedades-*`, `12-Plan-Desarrollo-MVP.md`, `13-Runbook-Operativo.md`).
8. **Informe corregido**: conteo real de relativos (19, no 27) y dos valores de frontmatter
   reportados intercambiados; se agrego la seccion "Remediacion ejecutada" al informe.

## Validaciones ejecutadas

- Checker de enlaces (wiki por nombre base + relativos con `unquote`): **0 rotos** al final
  (desde 14 wiki + 19 relativos).
- `node scripts/docs-sync-app-status.mjs`: sin cambios en bloques generados (matriz coherente;
  el frontmatter agregado al README de aplicaciones se preserva).
- Verificacion de existencia de targets: plantilla (`_Plantilla-App/`), catalogo de capacidades
  compartidas, SRS-Observabilidad, DB README.
- No ejecutables: `pnpm check-types`/`lint`/`test:unit` (node_modules ausente; cambios 100%
  documentales + 1 script de scaffold, sin logica de app).

## Decisiones documentadas

- **Canon sin tilde** (no renombrar 18 archivos): coincide con la practica universal del repo.
- **`archivado` para planes ejecutados** (Fase 0, portal-supabase, gestion-roles): el
  vocabulario `vigente`/`draft` no describia planes ya cerrados; `archivado` preserva el
  registro historico sin sugerir vigencia operativa.
- **Vinculos cruzados a la otra rama**: el informe enlaza las novedades del cierre operativo
  CMS (`12-Novedades-2026-11-15-cierre-operativo-cms.md`), que vive en
  `docs/cierre-operativo-cms` (pendiente de merge); el enlace resuelve al mergear ese PR.
- **`../LICENSE`/`../NOTICE`**: se dejan — apuntan a la raiz del repo real (existen); el
  checker del vault no debe tratarlos como rotos.

## Pendientes

1. Merge de los 3 PRs documentales pendientes
   (`docs/cms-readme-estado-implementacion`, `docs/cierre-operativo-cms`,
   `docs/auditoria-documental`).
2. Ejecutar `pnpm lint`/`check-types` al tener node_modules (solo toca `scripts/docs-new-app.mjs`,
   sin logica nueva).
3. Documentar en la guia de lectura el vocabulario de `status` completo
   (`vigente`/`draft`/`archivado`), que queda como convencion tras esta remediacion.
