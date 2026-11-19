---
tags:
  - proyecto/fosforo
  - novedades
  - ci
  - turbo
  - base-de-datos
type: novedades
area: general
status: vigente
created: 2026-11-19
updated: 2026-11-19
related:
  - "[[12-Novedades-2026-11-19-normalizacion-maestros-y-node24|Novedades normalizacion y Node 24]]"
  - "[[17-Control-de-Versiones-y-Releases|Control de Versiones y Releases]]"
  - "[[19-Auditoria-Documental-2026-11-15|Auditoria Documental 2026-11-15]]"
---

# Novedades 2026-11-19 - Correccion de los checks rojos de CI

> Ejecutado con OpenCode. Owner: Iván Ezequiel Iencinella. Rama: `fix/ci-validacion-db-tipos-ui`.

## Resumen

Se corrigieron dos de los tres workflows de GitHub Actions que fallaban de forma
pre-existente: `Tests unitarios` (validacion de scripts de base de datos) y
`Build y tipos` (resolucion de `@repo/ui`). El tercero, `Auditoria de dependencias`,
queda pendiente por requerir una actualizacion de dependencias.

## Por que se aplico

La auditoria de CI mostro que los tres fallos ocurrian identicamente en `main` con
Node 22 y en la PR #82 con Node 24, por lo que no eran consecuencia del cambio de
version de Node. Llevaban rojos desde Fase 0 y dejaban sin ejecutar pasos posteriores
(`docs:sync-app-status`, `pnpm build`, tests unitarios).

- `db/scripts/validate.js` exigia `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN` y
  `SUPABASE_DB_PASSWORD` en CI, aunque nunca las usa (solo comprueba que esten
  definidas) y la guia de variables de entorno las declara de uso local/CLI. El repo
  no tiene secretos de GitHub configurados, asi que el paso fallaba siempre.
- `@repo/ui` es el unico paquete interno que exporta `./dist/index.js`; los demas
  exportan `./src/index.ts`. Como `check-types` en `turbo.json` solo dependia de
  `^check-types`, las dependencias internas nunca se construian antes de chequear
  tipos y faltaba `dist/index.d.ts` (`ts(2307)`).

## Que se hizo

- `db/scripts/validate.js`: en contexto CI (`CI=true` o `GITHUB_ACTIONS=true`) se
  valida solo la estructura versionada; el chequeo de credenciales se conserva
  intacto para ejecucion local. Documentado en `db/scripts/README.md`.
- `turbo.json`: `check-types` pasa a `dependsOn: ["^build", "^check-types"]`, de modo
  que los paquetes internos se construyen (y emiten declaraciones, `declaration: true`
  en `@repo/typescript-config/base.json`) antes de verificar tipos.
- Sin cambios en los archivos de workflow ni en las dependencias.

## Notas

- Sin changeset: cambios de CI/tooling sin comportamiento visible de aplicacion;
  `db/scripts/` y el paquete raiz quedan fuera del alcance de versionado segun
  `17-Control-de-Versiones-y-Releases.md` (lineas 39, 65 y 108).
- `Auditoria de dependencias` sigue en rojo por advisories nuevas (`astro <7.2.8`
  critical y `path-to-regexp <6.3.0` high); no se actualizo en este cambio.
- Esta correccion no se mergea por parte del agente (convencion `AGENTS.md`).
