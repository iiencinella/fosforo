---
tags:
  - proyecto/fosforo
  - arquitectura
  - mobile
  - react-native
type: documentación-tecnica
area: arquitectura
status: vigente
created: 2026-03-07
updated: 2026-05-06
related:
  - "[[README|Arquitectura]]"
  - "[[Estructura Monorepo|Monorepo]]"
---

# Arquitectura Mobile

La capa mobile se implementa en `src/mobile/` con aplicaciónes separadas sobre React Native + Expo, orquestadas por Turborepo.

## Stack

- React Native.
- Expo.
- Expo Router.
- AsyncStorage para persistencia local.

## Estado actual del workspace

- `pnpm-workspace.yaml` registra los workspaces mobile en `src/mobile/*`.
- En el estado actual del repositorio no hay apps mobile implementadas dentro de `src/mobile/`.
- La base compartida hoy disponible para mobile es `src/packages/mobile-auth-client`.

## Estructura base

```text
src/mobile/mobile-[app]/
├── src/
├── tests/unit/
├── app.json
├── package.json
└── vitest.config.ts
```

La documentación funcional de cada app mobile debe ubicarse en `docs/02-Aplicaciones/FASE_<N>-<nombre>/MOVIL/`.

## Convenciones operativas

- Cada app mobile nueva debe vivir en `src/mobile/<slug>/` como workspace aislado.
- La autenticación, sesion y pantallas compartidas deben reutilizar `src/packages/mobile-auth-client` cuando aplique.
- Los contratos compartidos deben centralizarse en `src/packages/` antes de duplicarse entre apps.
- La documentación funcional debe mantenerse en paralelo en `docs/02-Aplicaciones/FASE_<N>-<nombre>/MOVIL/`.

## Comandos utiles

```bash
# Desarrollar un workspace mobile
pnpm dev --filter=<workspace-mobile>

# Ejecutar validaciónes generales
pnpm check-types
pnpm lint
pnpm test:unit
```

## Criterios de arquitectura

- Cada app mobile mantiene su propio ciclo de release.
- La sesion y autenticación compartida se apoya en `src/packages/mobile-auth-client`.
- Las apps consumen APIs del ecosistema y reusan contratos definidos en la capa web/backend.
- La navegación se organiza con Expo Router y convenciones por pantalla.
