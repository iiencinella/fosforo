---
tags:
  - proyecto/fosforo
  - novedades
  - documentación
  - agentes
type: app-changelog
area: general
status: vigente
version: -
created: 2026-11-15
related:
  - "[[17-Control-de-Versiones-y-Releases|Control de Versiones y Releases]]"
---

# Novedades - 2026-11-15 - Flujo del agente para crear ramas

## Que se implemento

Se agrego a `AGENTS.md` (seccion "Convención de ramas") un flujo operativo obligatorio para el agente de IA al crear ramas, y se definio `main` como la rama principal oficial de sincronizacion (alineado con la rama por defecto de GitHub, el `baseBranch` de Changesets y `docs/00-General/17-Control-de-Versiones-y-Releases.md`).

### Archivos modificados

- `AGENTS.md`: nueva subseccion "Flujo del agente al crear una rama" dentro de "Convención de ramas", con cuatro pasos ordenados: sincronizar `main`, analizar el pedido, crear la rama y aplicar los cambios; mas guardas sobre el arbol de trabajo (no descartar cambios ajenos, no commitear archivos fuera del pedido).

## Por que se aplico

Antes solo existia la nomenclatura (formato y tipos de rama), pero no el procedimiento: el agente podia ramificar desde una copia desactualizada o pisar trabajo sin commitear. Con este flujo, toda rama nueva nace de `main` al dia y con el alcance ya analizado.

## Impacto

- No cambia codigo de producto ni comportamiento de apps; es solo documentacion de instrucciones para agentes.
- No corresponde changeset: cambio exclusivamente documental (norma en `docs/00-General/17-Control-de-Versiones-y-Releases.md`).
