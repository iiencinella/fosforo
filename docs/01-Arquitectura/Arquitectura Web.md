---
tags:
  - proyecto/fosforo
  - arquitectura
  - web
  - astro
type: documentación-tecnica
area: arquitectura
status: vigente
created: 2026-03-07
updated: 2026-05-26
related:
  - "[[README|Arquitectura]]"
  - "[[Estructura Monorepo|Monorepo]]"
  - "[[Stack Tecnologico|Stack Tecnologico]]"
---

# Arquitectura Web

La capa web del ecosistema se implementa en `src/apps/` dentro del monorepo Turborepo.

## Stack

- Astro para rutas, render y endpoints.
- React para componentes interactivos.
- TailwindCSS para estilos compartidos.
- TypeScript para tipado.

## Estado actual del workspace

- `pnpm-workspace.yaml` registra los workspaces web en `src/apps/*`.
- El repositorio ya contiene workspaces web en `src/apps/`: `src/apps/biblia`, `src/apps/calendario`, `src/apps/log`, `src/apps/portal` y `src/apps/usuario`.
- No todas las apps documentadas en `docs/02-Aplicaciones/` tienen todavía implementación funcional completa; algunas existen como scaffold o implementación parcial.
- La documentación de producto web en `docs/02-Aplicaciones/` representa el alcance funcional esperado y debe contrastarse con el estado real de cada workspace.

## Estructura base

```text
src/apps/[app]/
├── src/
│   ├── pages/
│   ├── layouts/
│   ├── components/
│   ├── lib/
│   └── types/
├── public/
├── tests/unit/
├── astro.config.mjs
├── package.json
└── vitest.config.ts
```

La documentación funcional de cada aplicación web vive en `docs/02-Aplicaciones/FASE_<N>-<nombre>/WEB/`.

## Convenciones operativas

- Cada nueva app web debe crearse como workspace independiente dentro de `src/apps/<slug>/`.
- La navegación y las rutas HTTP deben vivir en `src/pages/`, incluyendo `src/pages/api/` para endpoints.
- Los componentes y estilos compartidos deben consumirse desde `src/packages/ui` y `src/packages/tailwind-config` antes de crear variantes locales.
- La documentación minima por app debe mantenerse sincronizada en `docs/02-Aplicaciones/FASE_<N>-<nombre>/WEB/`.

## Comandos utiles

```bash
# Desarrollar un workspace web
pnpm dev --filter=<workspace-web>

# Validar tipos del monorepo
pnpm check-types

# Ejecutar lint del monorepo
pnpm lint

# Ejecutar tests unitarios
pnpm test:unit
```

## Criterios de arquitectura

- Cada app web vive como paquete independiente dentro de Turborepo.
- Las capacidades compartidas se resuelven desde `src/packages/`.
- Los endpoints de negocio residen en `src/pages/api/`.
- La base visual compartida debe reutilizar `src/packages/ui` y `src/packages/tailwind-config`.
- La observabilidad y autenticación se integran con capacidades transversales del ecosistema.
