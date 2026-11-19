---
tags:
  - proyecto/fosforo
  - novedades
  - vercel
  - despliegue
  - documentación
type: novedades
area: general
status: vigente
created: 2026-11-19
updated: 2026-11-19
related:
  - "[[18-Guia-Despliegue-Vercel-Monorepo|Guia de Despliegue Vercel en Monorepo]]"
  - "[[04-Listado-de-Aplicaciones|Listado de Aplicaciones]]"
  - "[[../01-Arquitectura/Capacidades Compartidas/Guia-Variables-de-Entorno|Guia de Variables de Entorno]]"
---

# Novedades 2026-11-19 - Inventario Vercel de CMS y Logueo

> Ejecutado con OpenCode. Owner: Iván Ezequiel Iencinella. Rama: `docs/inventario-vercel-cms-logueo`.

## Resumen

Se crearon en Vercel los proyectos `fosforo-cms` y `fosforo-logueo`, enlazados a
`iiencinella/fosforo` en la rama `main`, con `rootDirectory` `src/apps/cms` y
`src/apps/logueo` respectivamente y la misma configuracion que los otros 8 proyectos
del ecosistema (Astro, Node 24.x, `turbo-ignore` por workspace). Se ajustaron sus
variables de entorno y se disparo el primer deploy de `main`. En documentacion se
completo el mapa de apps de la guia de despliegue, la matriz de variables por
proyecto y se corrigio el uso de "Sistema de Logueo" en los documentos maestros.

## Por que se aplico

La guia de despliegue establece "un proyecto de Vercel por app web en `src/apps/*`",
pero su mapa solo listaba 8 de las 10 apps implementadas: faltaban `cms` y `logueo`.
Ese hueco, sumado a que los documentos maestros usaban "Sistema de Logueo" para
hablar de observabilidad, permitia confundir `logueo` (identidad/SSO) con `log`
(observabilidad/RUM) y deducir que sobraba un proyecto. La revision confirmo que
son apps distintas, con workspaces, rutas, carpetas documentales y proyectos Vercel
propios, por lo que `fosforo-logueo` se conserva.

## Que se hizo

- Creados `fosforo-cms` y `fosforo-logueo` (rama `main`, repo `iiencinella/fosforo`).
- Configuracion replicada: `framework: astro`, `nodeVersion: 24.x`,
  `sourceFilesOutsideRootDirectory`, `enableAffectedProjectsDeployments`,
  `gitProviderOptions.createDeployments: enabled` y SSO desactivado.
- Variables de entorno: se quitaron las exclusivas de CLI/CI
  (`SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`) y las
  exclusivas de `administracion` (`ADMIN_SESSION_COOKIE`,
  `ADMIN_SESSION_MAX_AGE_SECONDS`); se agregaron `PUBLIC_LOGUEO_URL`,
  `PUBLIC_RUM_API_URL` y `CMS_CACHE_TTL_SECONDS` segun la guia y los README de app.
- Primer deploy de `main` para validar el build de ambos workspaces.
- Documentacion actualizada: `18-Guia-Despliegue-Vercel-Monorepo.md`,
  `Guia-Variables-de-Entorno.md`, `06-PRD-Maestro.md`, `07-SRS-Maestro.md` y
  `08-FRD-Maestro.md`.

## Desambiguacion

`log` (`src/apps/log`) = observabilidad, logs operativos, RUM y analiticas.
`logueo` (`src/apps/logueo`) = identidad, SSO con Supabase Auth, sesiones y
consentimientos. No son la misma app; ver `04-Listado-de-Aplicaciones.md` y
`12-Novedades-2026-09-05-documentacion-fase-2.md` ("Desambiguado respecto de la app Log").
