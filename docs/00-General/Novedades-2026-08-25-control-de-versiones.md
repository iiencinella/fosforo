---
tags:
  - proyecto/fosforo
  - novedades
  - versionado
  - releases
type: app-changelog
area: general
status: vigente
version: -
created: 2026-08-25
related:
  - "[[17-Control-de-Versiones-y-Releases|Control de Versiones y Releases]]"
---

# Novedades - 2026-08-25 - Control de versiones y releases

## Que se implemento

Se incorporo el control de versiones por aplicacion y paquete al ecosistema, con Changesets como herramienta oficial y el bot oficial (`changesets/action`) para consolidar releases. Motivacion: el PRD Maestro exige procesos de release claros y hasta hoy las apps tenian versiones hardcodeadas sin uso, sin tags ni changelogs.

### Archivos creados

- `docs/00-General/17-Control-de-Versiones-y-Releases.md`: normativa SemVer por app, flujo trunk-based de release, reglas para packages compartidos y reglas futuras mobile/desktop.
- `.changeset/config.json`: configuracion con `privatePackages { version: true, tag: true }` para versionar y taguear workspaces privados sin publicar a npm.
- `.github/workflows/release.yml`: workflow con el bot oficial que crea/actualiza automaticamente el PR "Version Packages" en `main`; su merge ejecuta build completo y pushea tags `<nombre>@<version>` via GitHub API.

### Archivos modificados

- `package.json`: agregados `@changesets/cli@^3.0.1` y scripts `changeset`, `changeset:status`, `changeset:version`, `release`.
- `src/packages/ui/package.json`: agregado `"private": true`. Sin ese campo el paso de publicacion habria intentado publicar `@repo/ui` a npm y roto el release.
- `AGENTS.md`: nueva seccion "Control de versiones y releases" con la obligacion de agregar changesets en cada PR visible.
- `docs/README.md`, `docs/00-General/03-Indice-General.md`, `docs/00-General/02-Guia-Navegacion.md`: referencias al nuevo documento normativo.
- Plantillas spec-driven web/mobile/desktop y sus versiones rellenables (11 a 16): Gate 5 ahora incluye changeset y referencia al documento 17.

## Como funciona

1. En cada PR con cambio visible se corre `pnpm changeset` y se describe el impacto.
2. Al mergear a `main`, el bot abre o actualiza solo el PR "Version Packages".
3. El merge de ese PR consolida versiones, genera `CHANGELOG.md` por workspace y crea los tags; Vercel despliega por su integracion nativa.

## Validaciones ejecutadas

- `pnpm install`: ok, lockfile sincronizado.
- `pnpm changeset:status`: configuracion valida; prueba end-to-end con changeset temporal detecto correctamente un bump patch de `biblia` (luego eliminado).
- Sintaxis validada de `.github/workflows/release.yml` (YAML) y `.changeset/config.json` (JSON).
- Inventario de workspaces: todos con `name`, `version` y `private` consistentes tras el fix de `@repo/ui`.
