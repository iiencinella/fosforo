---
tags:
  - proyecto/fosforo
  - novedades
  - tooling
type: app-changelog
area: general
status: vigente
version: -
created: 2026-11-15
related:
  - "[[17-Control-de-Versiones-y-Releases|Control de Versiones y Releases]]"
---

# Novedades - 2026-11-15 - Eliminacion de graphify

## Que se implemento

Se elimino por completo graphify (grafo de conocimiento) del repositorio. Motivacion: el plugin de OpenCode (`.opencode/plugins/graphify.js`) fallaba al cargar en el server y el equipo decidio dejar de usarlo, por lo que se removieron el plugin, su registro y todas las referencias en docs y configuracion.

### Archivos eliminados

- `.opencode/plugins/graphify.js`: plugin de OpenCode que fallaba al cargar (Status: failed, Runtime: server). Era el origen del error `err_78eabb8d`.
- `.opencode/opencode.json`: existia unicamente para registrar ese plugin; la carpeta `.opencode/` quedo vacia.

### Archivos modificados

- `AGENTS.md`: eliminada la seccion "graphify" con las reglas de query/path/explain/update.
- `.gitignore`: eliminada la entrada `graphify-out/` con su comentario.
- `README.md`: quitada la mencion de `graphify-out/` entre los artefactos locales generados.
- `docs/01-Arquitectura/Estructura Monorepo.md`: quitada la mencion de `graphify-out/` en el parrafo de archivos no versionados.
- `docs/02-Aplicaciones/FASE_1-0102_biblia/WEB/12-Novedas-2026-08-07.md`: eliminada la linea de validacion `graphify update .` para que el historico no referencie una herramienta que ya no existe en el repo.

## Por que no corresponde changeset

El cambio no toca codigo de ningun workspace (apps ni packages compartidos): solo tooling de agentes, configuracion y documentacion. Los changesets existen para versionar workspaces (el paquete raiz no tiene version) y la practica observada en PRs solo de documentacion es no agregarlos.

## Impacto

- Desaparece el error de carga del plugin al iniciar OpenCode (requiere reiniciar la sesion/server para que el error desaparezca).
- No cambia ningun comportamiento de producto.
