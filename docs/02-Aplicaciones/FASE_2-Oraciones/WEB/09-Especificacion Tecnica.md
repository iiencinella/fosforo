---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
  - web
  - fase-2
  - especificacion-tecnica
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[08-Decisiones de Arquitectura]]"
  - "[[06-Esquema de Datos]]"
---

# Oraciones - Web - Especificación Técnica

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Stack

| Capa                  | Tecnología                                                |
| --------------------- | --------------------------------------------------------- |
| Framework web         | Astro 6 (SSR, Vercel adapter)                             |
| Islas interactivas    | React 19                                                  |
| Estilos               | Tailwind v4 vía `@repo/tailwind-config` + `@repo/ui`      |
| Contenido             | CMS (contrato `GET /api/content/oracion`)                 |
| Datos personales      | Supabase (esquema `oraciones`, RLS)                       |
| Auth (runtime compat) | Sistema de Logueo (Better Auth)                           |
| Telemetría            | Sistema de Log (RUM)                                      |
| Notificaciones        | Sistema de Notificaciones (recordatorios)                 |
| Tests                 | Vitest                                                    |
| Monorepo              | Turborepo (app en `src/apps/oraciones`, workspace propio) |

## Estructura de módulos

```
src/apps/oraciones/
├── astro.config.mjs
├── package.json
├── pages/
│   ├── index.astro              # home: categorías + destacadas
│   ├── categoria/[slug].astro   # listado por taxonomía (cacheado)
│   ├── busqueda.astro           # buscador (estática + island de búsqueda)
│   ├── oracion/[slug].astro     # ficha de oración (cacheada + island de acciones)
│   ├── favoritos.astro          # mis favoritos (auth)
│   └── colecciones.astro        # listado y detalle de colecciones (auth)
├── components/
│   ├── ResultadosBuscador.tsx   # island de búsqueda full-text
│   ├── AccionesOracion.tsx      # island favorito/coleccion/reportar
│   ├── ModoLecturaToggle.tsx    # island de tema/tamaño de fuente
│   └── ColeccionItems.tsx       # island de orden manual de colección
├── lib/
│   ├── cms.ts                   # cliente del CMS (filtros, slug, taxonomías, cache tags)
│   ├── colecciones.ts           # CRUD de colecciones/items en Supabase
│   ├── favoritos.ts             # toggle de favoritos
│   ├── reportes.ts              # insert de reportes (anonimizado)
│   ├── preferencias.ts          # preferencias + recordatorio → Notificaciones
│   └── rum.ts                   # emisión de eventos oracion.viewed / oracion.searched
└── test/
    └── fixtures/oraciones.ts
```

## Endpoints (páginas + API)

| Endpoint                               | Método | Descripción                                                                 | Cache/Auth                                                          |
| -------------------------------------- | ------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `GET /`                                | GET    | Home: categorías + oraciones destacadas                                     | SSR cacheado (tag `home`)                                           |
| `GET /categoria/[slug]`                | GET    | Listado por taxonomía (`comunes`, `por-intencion`, `devociones`, `rosario`) | SSR cacheado (tag `categoria=[slug]`)                               |
| `GET /oracion/[slug]`                  | GET    | Ficha con texto completo, intención, fuente, JSON-LD                        | SSR cacheado (tag `oracion=[slug]`) + estado personal si hay sesión |
| `GET /busqueda?q=`                     | GET    | Búsqueda full-text en el catálogo (>= 2 chars, RB-ORAC-003)                 | Dinámica                                                            |
| `GET /colecciones`                     | GET    | Lista colecciones del usuario                                               | Auth                                                                |
| `POST /colecciones`                    | POST   | Crear colección (ORAC-001)                                                  | Auth                                                                |
| `PATCH /colecciones/[id]`              | PATCH  | Renombrar / reordenar items                                                 | Auth (RLS)                                                          |
| `DELETE /colecciones/[id]`             | DELETE | Soft-delete de colección                                                    | Auth (RLS)                                                          |
| `POST /colecciones/[id]/items`         | POST   | Agregar oración a colección (ORAC-003)                                      | Auth (RLS)                                                          |
| `DELETE /colecciones/[id]/items/[ref]` | DELETE | Quitar oración de colección                                                 | Auth (RLS)                                                          |
| `POST /api/favoritos`                  | POST   | Toggle favorito (`content_ref`)                                             | Auth (RLS)                                                          |
| `POST /api/reportes`                   | POST   | Reporte de error (insert-only, anónimo)                                     | Anónimo (rate limit)                                                |
| `POST /api/recordatorio`               | POST   | Programar/actualizar recordatorio de devoción                               | Auth + delega a Notificaciones                                      |

## Modelos de datos (resumen)

Ver detalle completo y DDL en [06-Esquema de Datos](06-Esquema%20de%20Datos.md). Referencias:

- `Favorite { user_id, content_ref }`
- `Collection { user_id, nombre(1-50), slug, deleted_at? }`
- `CollectionItem { collection_id, content_ref, orden }`
- `Preference { user_id, tema, font_size, recordatorio_tipo?, recordatorio_hora? }`
- `Report { content_ref, motivo, comentario?, session_hash }`

## UI/UX

- **Root shell**: shell compartido de `@repo/ui` (header, nav, hamburguesa móvil obligatoria) + tokens de `src/packages/tailwind-config/shared-styles.css`. Soporte light/dark con `data-theme` y View Transitions de Astro (ClientRouter) entre listado ↔ ficha.
- **Listados**: grilla de tarjetas de oración (título, extracto, categoría) con estado vacío, error y skeleton consistentes con el ecosistema.
- **Ficha**: layout de lectura centrado, breadcrumbs por categoría, tipografía optimizada para lectura de oración, acciones flotantes discretas (favorito, colección, reportar, modo lectura).
- **Modo lectura**: 3 tamaños de fuente (`s/m/l`) y tema claro/oscuro; aplicados via variables CSS y persistidos en localStorage sin FOUC (ADR-ORAC-004).
- **Colecciones**: vista de índice con tarjetas de colección + vista de detalle con las oraciones en `orden` manual (mover arriba/abajo). Estados vacíos con CTA claro.
- **Accesibilidad**: WCAG 2.2 AA (contraste, navegación por teclado, `aria-label` en acciones con solo icono, foco visible).
- **Skeletons**: obligatorios en navegación client-side y estados de carga de islands según ecosistema UI/UX.
- **Estados**: cada vista define loading / error / vacío / éxito (FR-ORAC-010) en formato ecosistema (skeleton + mensaje + CTA).

## Observaciones transversales

- `lib/cms.ts` nunca escribe al CMS; solo lee y define cache tags para invalidación cuando el CMS notifica cambios.
- Todas las mutaciones a Supabase pasan por lib del server o por el cliente autenticado con RLS (nunca `service_role` en el navegador).
- El RUM se emite con transporte ligero (fire-and-forget) y fallo silencioso; nunca bloquea render.
