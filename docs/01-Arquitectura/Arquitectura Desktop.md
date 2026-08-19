---
tags:
  - proyecto/fosforo
  - arquitectura
  - desktop
  - electron
type: documentación-tecnica
area: arquitectura
status: vigente
created: 2026-03-07
updated: 2026-05-06
related:
  - "[[README|Arquitectura]]"
  - "[[Estructura Monorepo|Monorepo]]"
---

# Arquitectura Desktop

La capa desktop se implementa en `src/desktop/` con Electron y se distribuye como aplicaciónes independientes.

## Stack

- Electron.
- Electron Vite.
- Electron Builder.
- electron-updater.

## Estado actual del workspace

- `pnpm-workspace.yaml` registra los workspaces desktop en `src/desktop/*`.
- En el estado actual del repositorio no hay apps desktop implementadas dentro de `src/desktop/`.
- La documentación desktop sigue describiendo la arquitectura objetivo para futuros workspaces.

## Estructura base

```text
src/desktop/[app]/
├── src/
│   ├── main/
│   ├── preload/
│   └── renderer/
├── package.json
└── electron-builder.yml
```

La documentación funcional de cada app desktop debe ubicarse en `docs/02-Aplicaciones/FASE_<N>-<nombre>/DESKTOP/`.

## Convenciones operativas

- Cada app desktop nueva debe crearse como workspace independiente en `src/desktop/<slug>/`.
- La separación entre procesos `main`, `preload` y `renderer` debe mantenerse explicita.
- Los recursos compartidos del ecosistema deben importarse desde `src/packages/` cuando exista una base reutilizable.
- La documentación funcional debe mantenerse en paralelo en `docs/02-Aplicaciones/FASE_<N>-<nombre>/DESKTOP/`.

## Comandos utiles

```bash
# Desarrollar un workspace desktop
pnpm dev --filter=<workspace-desktop>

# Ejecutar validaciónes generales
pnpm check-types
pnpm lint
pnpm test:unit
```

## Criterios de arquitectura

- La UI puede reutilizar patrones y contratos del ecosistema.
- Los recursos compartidos deben consumirse desde `src/packages/` cuando exista una base reutilizable.
- El empaquetado y autoactualización se gestionan por app.
- Los binarios se publican de forma desacoplada al canal web.
