---
tags:
  - proyecto/fosforo
  - horarios
  - arquitectura
  - especificación-tecnica
  - aplicación
type: app-tech-spec
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
---

# Especificación Tecnica - 0106_horarios

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro (SSR) con islands para interacciones puntuales de filtros/listados.
- Lenguaje principal: TypeScript.
- Herramientas de build: Astro build, pnpm y Turborepo.
- Testing: Vitest para logica de dominio y componentes puros + pruebas de integracion de endpoints.

## Arquitectura tecnica

- Patrón de arquitectura: app web por capas con paginas Astro, componentes UI compartidos y servicios server-side para dominio de horarios.
- Modulos principales: `home-search`, `results-list`, `temple-detail`, `filters`, `liturgical-links`, `api`, `observability`, `shared-shell`.
- Dependencias compartidas: `@repo/ui`, `@repo/tailwind-config`, contratos utilitarios de ecosystem y capacidad de logs.

## Modelos de datos

- Modelo 1: catalogo de templos y celebraciones en Supabase (`horarios_temples`, `horarios_celebrations`).
- Modelo 2: telemetria de consultas (`horarios_search_events`) con retencion acotada y sin PII directa.

## Endpoints (si aplica)

| Metodo | Ruta                 | Proposito                                                                 |
| ------ | -------------------- | ------------------------------------------------------------------------- |
| GET    | `/api/celebraciones` | Buscar celebraciones por texto, tipo, fecha, horario y cercania opcional. |
| GET    | `/api/templos/[id]`  | Obtener detalle de templo y proximas celebraciones.                       |
| GET    | `/api/health`        | Exponer estado de salud operativo y version desplegada.                   |
| POST   | `/api/events/search` | Registrar telemetria basica de busquedas (MVP interno).                   |

## Consideraciónes UI/UX

- Navegación principal: home con buscador visible + acceso a santoral y evangelio del dia; header/footer alineados al ecosistema.
- Estados de interfaz (loading/empty/error/success): skeleton de resultados, vacio guiado, error recuperable y confirmacion de resultados encontrados.
- Accesibilidad base: foco visible, labels explicitos en controles de filtro, soporte teclado y contraste objetivo AA.
