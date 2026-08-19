---
tags:
  - proyecto/fosforo
  - arquitectura
  - design-system
  - estilos
type: plan-tecnico
area: arquitectura-web
status: propuesto
created: 2026-04-17
updated: 2026-04-17
related:
  - "[[README|Arquitectura - Ecosistema Fósforo]]"
  - "[[Estructura Monorepo|Estructura Monorepo]]"
---

# Plan de unificación de estilos globales (opcion 2)

## Decision de alcance

Se adopta **opcion 2**: una sola estetica visual para todas las apps web del monorepo.

- Mismo lenguaje visual en `portal`, `auth`, `biblia`, `calendario`, `oraciones`, `santopedia`.
- Sin skins por app.
- Se mantienen diferencias funcionales y de contenido, no diferencias de marca visual.

## Estado actual resumido

- `src/apps/portal` ya consume `@repo/ui` y `@repo/ui/portal.css`.
- `src/apps/oraciones` y `src/apps/santopedia` usan CSS propio con patrones casi iguales.
- `src/apps/biblia` y `src/apps/calendario` tienen CSS inline en paginas `.astro`.
- `src/apps/auth` combina clases utilitarias con CSS local.
- `src/packages/tailwind-config/shared-styles.css` hoy solo define un set minimo de tokens.

## Objetivo tecnico

Construir un **sistema unico de estilos** y migrar todas las apps para que usen:

1. Tokens compartidos.
2. Primitivas de layout y componentes base.
3. Estilos de dominio solo cuando sean estrictamente necesarios.

## Arquitectura objetivo

### 1) Capa de tokens (single source of truth)

Archivo objetivo: `src/packages/tailwind-config/shared-styles.css`

- Color: fondo, superficie, texto, muted, borde, acento, estados.
- Tipografia: familias, escala de tamaños, pesos, alturas de linea.
- Espaciado: escala 4/8.
- Radio, sombras, transiciones y focus ring.
- Breakpoints comúnes.

### 2) Capa foundation (base global)

Archivo nuevo sugerido: `src/packages/ui/src/foundation.css`

- Reset base y accesibilidad minima.
- Elementos globales (`body`, `a`, `button`, `input`, `select`, `textarea`).
- Utilidades semanticas de composicion (`.app-shell`, `.page`, `.section`, `.stack`, `.cluster`).

### 3) Capa de componentes reutilizables

Ubicación: `src/packages/ui/src/*`

Componentes base a estandarizar:

- `AppShell` (layout general con header/footer opcionales)
- `PageHero`
- `FilterBar`
- `SurfaceCard`
- `TagList` + `TagChip`
- `Pagination`
- `EmptyState`
- `ApiLinkList`

### 4) Capa de dominio (minima)

Cada app conserva solo estilos para piezas de dominio no genericas.

## Mapa de componentes: unico -> reutilizable

### Candidatos directos para pasar a `@repo/ui`

- `PrayerCard` -> base `ContentCard` + variantes de metadata.
- `SaintCard` -> base `ProfileCard`.
- `SaintHeaderCard` -> base `DetailHeaderCard`.
- bloques de filtros/paginación en `oraciones` y `santopedia` -> `FilterBar` + `Pagination`.
- paneles de API en `biblia`/`calendario` -> `ApiLinkList` + `InfoPanel`.

### Se mantienen de dominio

- Render de pasajes biblicos.
- Grid de dias y logica liturgica del calendario.
- Tabla y drawer de auditoria en admin auth.

## Plan por fases

## Fase 0 - Baseline y control

- Congelar referencias visuales (capturas desktop/mobile de todas las pantallas principales).
- Definir checklist de regresion visual y accesibilidad.
- Acordar criterios de aceptación comúnes.

## Fase 1 - Tokens globales

- Expandir `src/packages/tailwind-config/shared-styles.css` con tokens semanticos.
- Eliminar tokens duplicados por app (`--accent`, `--line`, etc.) y mapearlos a globales.
- Mantener compatibilidad temporal con alias para migración incremental.

## Fase 2 - Foundation compartida

- Crear `foundation.css` en `src/packages/ui`.
- Exportarlo desde `src/packages/ui/package.json`.
- Importarlo en todas las apps web desde un punto unico de entrada por layout.

## Fase 3 - Componentes base reutilizables

- Implementar primitives en `src/packages/ui` (Astro-friendly + React-friendly donde aplique).
- Documentar API minima de props por componente.
- Sustituir primero usos repetidos en `oraciones` y `santopedia`.

## Fase 4 - Migración de apps con mayor deuda

- `biblia`: sacar estilos inline a css compartido + dominio minimo.
- `calendario`: mismo enfoque, conservando solo reglas del grid liturgico.
- `auth`: alinear dashboard/login al sistema unico (sin paleta separada).

## Fase 5 - Consolidación final

- Unificar imports CSS para que cada app cargue solo:
  - `@repo/tailwind-config`
  - `@repo/ui/foundation.css`
  - css de dominio minimo (si aplica)
- Limpiar CSS legado y clases obsoletas.

## Fase 6 - QA y hardening

- `pnpm lint`
- `pnpm check-types`
- `pnpm test:unit`
- validación responsive (>=320px), focus visible y contraste.

## Backlog operativo por app

### portal

- Reemplazar `portal.css` monolitico por foundation + modulos por componente.
- Mantener solo estilos realmente especificos del home/marketing.

### oraciones

- Migrar layout, hero, filtros, chips y paginación a primitives.
- Dejar solo estilos de lectura/oración de dominio.

### santopedia

- Compartir las mismas primitives que `oraciones`.
- Mantener solo estilos de perfil/imagen de santos como dominio.

### biblia

- Extraer `<style>` de `index.astro` y `desarrolladores.astro`.
- Aplicar componentes compartidos de panel, formulario, tags y feedback.
- Si una app necesita mantener exactamente el mismo look del header compartido que `portal`, hacerlo mediante scope de app sobre las clases compartidas (`body.<app>-theme`) y no con una implementación paralela del header.

### calendario

- Extraer `<style>` de `index.astro`.
- Reusar shell, panel, filtros, botones y cards globales.
- Conservar reglas del grid calendario como dominio.

### auth

- Unificar `ecosystem.css`, `auth.css`, `dashboard.css` con tokens globales.
- Reemplazar estilos hardcodeados por componentes base.

## Definition of Done (DoD)

Se considera completa la unificación cuando:

- Todas las apps web usan el mismo set de tokens globales.
- No quedan estilos inline en paginas Astro.
- Los componentes repetidos viven en `@repo/ui`.
- Las variaciónes visuales por app quedan reducidas a dominio funcional.
- Lint, tipos y tests unitarios pasan en el monorepo.

## Contrato de estilos (source of truth)

### Foundation (`@repo/ui/foundation.css`)

- Debe contener solo estilos base globales del sistema:
  - reset, tipografia base, focus, enlaces, media defaults.
  - layout primitives (`.page`, `.section`, `.app-shell`).
  - primitives de superficie y botones (`.surface-card`, `.button-primary`, `.button-secondary`).
- No debe incluir estilos de una pagina concreta ni reglas de dominio de una app.

### Shared domain blocks (`@repo/ui/*.css`)

- `portal.css`, `catalog.css`, `calendar.css` son capas compartidas por feature-domain.
- Pueden incluir componentes visuales de ese dominio, pero siempre referenciando tokens globales.
- Deben evitar redefinir tokens globales y resets.

### App domain CSS (`src/apps/*/src/styles/*.css`)

- Solo estilos no generalizables por negocio (ej.: card de santo, render de pasaje, grid liturgico).
- Evitar reglas de base ya resueltas en `foundation.css`.
- Evitar inline styles salvo casos de variable dinamica en runtime (ej.: `style="--card-bg: ..."`).

### Tokens (`src/packages/tailwind-config/shared-styles.css`)

- Unica fuente de verdad para color, tipografia, spacing, radio, sombra, transiciones y focus.
- Cualquier nuevo token nace aqui y luego se consume en foundation/shared/app domain.

## Riesgos y mitigación

- Riesgo: regresion visual al migrar CSS legacy.
  - Mitigación: migración por pantalla + baseline de capturas.
- Riesgo: sobre-generalización de componentes.
  - Mitigación: primitives pequeñas, API de props minima.
- Riesgo: mezcla de estilos utilitarios y semanticos en auth.
  - Mitigación: estandar de composicion unico desde foundation.
