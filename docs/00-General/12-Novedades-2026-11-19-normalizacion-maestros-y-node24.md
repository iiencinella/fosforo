---
tags:
  - proyecto/fosforo
  - novedades
  - documentación
  - ci
  - node
type: novedades
area: general
status: vigente
created: 2026-11-19
updated: 2026-11-19
related:
  - "[[12-Novedades-2026-11-19-inventario-vercel-cms-logueo|Novedades inventario Vercel CMS y Logueo]]"
  - "[[17-Control-de-Versiones-y-Releases|Control de Versiones y Releases]]"
  - "[[18-Guia-Despliegue-Vercel-Monorepo|Guia de Despliegue Vercel en Monorepo]]"
---

# Novedades 2026-11-19 - Normalizacion de estados y version de Node

> Ejecutado con OpenCode. Owner: Iván Ezequiel Iencinella. Rama: `docs/normalizacion-estados-maestros`.

## Resumen

Se cerraron las tres desalineaciones detectadas al revisar el inventario de proyectos
Vercel: estado documental de los maestros, configuracion de deploys afectados y
version de Node entre CI, `package.json` y Vercel.

## Por que se aplico

Los documentos maestros (`06-PRD`, `07-SRS`, `08-FRD`) eran los unicos 3 archivos de
`docs/00-General/` con `status: draft` mientras los otros 33 estan `vigente`, pese a
ser la fuente normativa del ecosistema segun `AGENTS.md` y `docs/README.md`. Ademas,
3 proyectos Vercel carecian de `enableAffectedProjectsDeployments` (la guia de
despliegue lo exige para saltar builds de apps no afectadas). Por ultimo, CI y
`engines.node` declaraban Node 22 mientras los 10 proyectos Vercel usan `24.x`,
dejando la version de produccion fuera del rango declarado.

## Que se hizo

- `status: draft` -> `vigente` en `06-PRD-Maestro.md`, `07-SRS-Maestro.md` y
  `08-FRD-Maestro.md`.
- `enableAffectedProjectsDeployments: true` en `fosforo-administracion`,
  `fosforo-cancionero` y `fosforo-horarios` (los 10 proyectos quedan uniformes).
- `engines.node: "^24"` en el `package.json` raiz y `node-version: 24` en los 5
  workflows de `.github/workflows/` (`build-and-types`, `lint`, `release`,
  `security-audit`, `unit-tests`), alineando CI con Vercel y con el default 24 LTS.

## Notas

- El cambio de `package.json` se hizo sobre `main` en un worktree: no toca los
  cambios sin commitear de la rama `chore/pnpm12-migracion-settings` (ese diff
  modifica `packageManager` y elimina el bloque `pnpm`, no `engines`).
- El Node local del entorno de desarrollo es 26, por lo que queda fuera de `^24`
  (ya lo estaba de `^22.23.1`); `engine-strict` no esta activo en `.npmrc`, asi que
  solo produce aviso, no error. Si se quiere incluir, cambiar a `>=24`.
- Cambio de configuracion y documentacion sin logica de aplicacion: sin changeset
  segun `17-Control-de-Versiones-y-Releases.md` (el paquete raiz queda fuera del
  alcance de versionado).
