---
tags:
  - proyecto/fosforo
  - novedades
  - tooling
  - limpieza
type: novedades
area: general
status: vigente
created: 2026-11-15
updated: 2026-11-15
related:
  - "[[19-Auditoria-Documental-2026-11-15|Auditoria Documental 2026-11-15]]"
---

# Novedades 2026-11-15 - Eliminacion de graphify del proyecto

> Ejecutado con GLM 5.3 (Z.ai). Owner: Iván Ezequiel Iencinella. Rama: `chore/eliminar-graphify`.

## Resumen

A pedido del owner se elimino toda relación de graphify (el plugin de grafo de conocimiento para
agentes) del monorepo. graphify era un plugin de OpenCode que inyectaba recordatorios para usar
`graphify-out/` en consultas de codebase; ya no forma parte del flujo de trabajo del proyecto.

## Por que se aplico

Decisión directa del owner: el proyecto no usa el grafo de conocimiento como herramienta de
trabajo y su mantenimiento (directivas en AGENTS.md, plugin, ignore de cache) era carga innecesaria.

## Que se elimino

1. `.opencode/plugins/graphify.js` — el plugin (eliminado con `git rm`).
2. `.opencode/opencode.json` — se quito el registro del plugin (queda solo el `$schema`).
3. `AGENTS.md` — se elimino la seccion `## graphify` con sus directivas para agentes.
4. `.gitignore` — se quito la entrada del cache `graphify-out/`.
5. `README.md` y `docs/01-Arquitectura/Estructura Monorepo.md` — se quito `graphify-out/` de los
   listados de artefactos generados excluidos del arbol versionado.
6. `docs/02-Aplicaciones/FASE_1-0102_biblia/WEB/12-Novedades-2026-08-07.md` — se quito la linea
   de validacion "`graphify update .`" del registro historico de validaciones (quedan las
   validaciones sustantivas: check-types, lint y tests). Nota: es el unico caso donde se edito un
   registro historico, por pedido explicito de eliminar toda relacion.

## Validaciones

- `grep -ri graphify` sobre el repo (sin node_modules ni .git): 0 coincidencias en el arbol
  versionado, salvo este archivo de novedades que documenta la eliminacion.
- `graphify-out/` no existia en el disco (no habia grafo generado que borrar).

## Sin changeset

No requiere: no cambia ningun paquete publicado ni codigo de aplicacion (solo tooling de agentes
y documentacion).
