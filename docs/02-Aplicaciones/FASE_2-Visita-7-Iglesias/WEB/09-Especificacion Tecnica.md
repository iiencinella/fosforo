---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
  - especificacion-tecnica
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS]]"
  - "[[06-Esquema de Datos]]"
  - "[[08-Decisiones de Arquitectura]]"
---

# Especificación Técnica - Visita 7 Iglesias

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Herramientas y tecnologías

- Plataforma: WEB (PWA-ready post-MVP; el service worker queda fuera del MVP).
- Framework principal: Astro 6 (SSR en Vercel) + React 19 (islands para interacción).
- Lenguaje principal: TypeScript estricto.
- Estilos: Tailwind v4 con tokens compartidos (`src/packages/tailwind-config/shared-styles.css`) y primitivas de `@repo/ui` (cards, headers, shell, estados vacíos, skeletons).
- Datos personales: Supabase (Postgres, esquema `visita7`, RLS) con `@supabase/ssr` para sesión server-side.
- Autenticación: Sistema de Logueo (Better Auth) del ecosistema.
- Contenido: CMS vía API de lectura `GET /api/content/{content_type}` con API key (solo SSR).
- Telemetría: Sistema de Log (RUM + logs) del ecosistema.
- Testing: Vitest (ver [05-Tests Unitarios](05-Tests%20Unitarios.md)).

## Arquitectura técnica

- Patrón de arquitectura: SSR con cache agresivo (contenido casi estático) + islands React para interacción de marca/progreso + API routes para escritura.
- Módulos principales:

```
src/apps/visita-7-iglesias/
  src/
    pages/
      index.astro                      # Home: ciudades + CTA (contexto litúrgico no bloqueante)
      itinerarios.astro                # Listado de itinerarios por ciudad (SSR + cache CMS)
      itinerario/[slug].astro          # Ficha: 7 iglesias + oraciones + mapa embebido (SSR + cache)
      mi-peregrinacion.astro           # Progreso x/7 + modo peregrino (island, requiere sesión para marcar)
      api/
        peregrinaciones.post.ts        # Crear peregrinación activa (auth)
        peregrinaciones/[id]/visitas.post.ts  # Marcar visita (auth + idempotencia + transición 7/7)
        reportes.post.ts               # Reporte de datos de iglesia (insert-only, anónimo)
    lib/
      cms.ts                           # Cliente CMS (API key SSR, mapeo content types itinerario/iglesia)
      peregrinacion.ts                 # Dominio: crear peregrinación, marcar visita (idempotente), calcular progreso, transición a completada
      liturgia.ts                      # Cliente Motor Litúrgico no bloqueante (timeout corto, fallback silencioso)
      rum.ts                           # Emisores v7i.* (sin PII)
      validaciones.ts                  # V7I-001..005
    components/
      ItinerarioCard.tsx               # Tarjeta de itinerario (ciudad, 7 iglesias, distancia, verificado)
      IglesiaItem.tsx                  # Fila de iglesia: nombre, dirección, mapa embebido (iframe), oración
      ModoPeregrino.tsx                # Lista con checkboxes + reordenar (island)
      BarraProgreso.tsx                # Progreso x/7 accesible (aria-valuenow, base 7)
      Celebracion.tsx                  # Vista de celebración 7/7
      ReporteIglesia.tsx               # Formulario de reporte (select motivo + comentario)
      ContextoLiturgico.tsx            # Banner informativo Cuaresma/Jueves Santo
```

- Dependencias compartidas: `@repo/ui` (primitivas y estilos), `src/packages/tailwind-config/shared-styles.css` (tokens), auth middleware del Sistema de Logueo, cliente Log/RUM compartido.

## Modelos de datos

Aplicación (TypeScript) espejando el esquema `visita7` (ver [06-Esquema de Datos](06-Esquema%20de%20Datos.md)):

- **Pilgrimage:** `{ id: uuid; user_id: uuid; itinerary_ref: string; status: 'activa' | 'completada'; started_at: string; completed_at: string | null }`
- **Visit:** `{ id: uuid; pilgrimage_id: uuid; church_ref: string; visit_order: 1|2|3|4|5|6|7; visited_at: string }`
- **Preferences:** `{ user_id: uuid; custom_order: Record<string, ChurchRef[]> | null; theme: 'light' | 'dark' | 'system'; geo_consent: boolean }`
- **DTO de contenido (del CMS):** `ItinerarioCMS { slug, ciudad, iglesias: IglesiaCMS[7] }`, `IglesiaCMS { church_ref, nombre, direccion, mapa_url, oracion_ref, imagen }` — la app nunca persiste estos DTOs, solo los renderiza.

## Endpoints

| Metodo | Ruta                                       | Proposito                                                                                  | Auth                  |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------- |
| GET    | `/itinerarios?ciudad={term}`               | Listado de itinerarios por ciudad (SSR, cacheado por tag `ciudad`)                         | Pública (lectura)     |
| GET    | `/itinerario/[slug]`                       | Ficha del itinerario con las 7 iglesias + oraciones (SSR, cacheada por tag `itinerario`)   | Pública (lectura)     |
| POST   | `/api/peregrinaciones`                     | Crear peregrinación activa `{ itinerary_ref }` (idempotente por usuario+itinerario)        | Obligatoria (401 sin) |
| POST   | `/api/peregrinaciones/{id}/visitas`        | Marcar visita `{ church_ref, visit_order }`; idempotente; transición a `completada` en 7/7 | Obligatoria (401 sin) |
| GET    | `/mi-peregrinacion`                        | Progreso propio x/7 + modo peregrino (RLS; estado vacío si no hay peregrinación)           | Obligatoria           |
| POST   | `/api/reportes`                            | Reporte de datos de iglesia (insert-only, `session_hash` anónimo)                          | Pública (sin sesión)  |
| GET    | CMS `GET /api/content/itinerario` (server) | Fuente de itinerarios e iglesias (por taxonomía de ciudad / slug), API key solo en SSR     | API key (SSR)         |
| GET    | Motor `GET /api/liturgia/{fecha}` (server) | Contexto Cuaresma/Jueves Santo (no bloqueante)                                             | Pública (lectura)     |

Códigos de error del endpoint de marca: `401` (V7I-001, sin sesión), `422` (V7I-002, iglesia ajena al itinerario), `409` (V7I-003, peregrinación completada), `200` idempotente (marca repetida, RB-V7I-002).

## Consideraciones UI/UX

- **Navegación principal:** home con ciudades → listado de itinerarios → ficha → modo peregrino → progreso; navegación móvil con hamburger del ecosistema (obligatorio) y view transitions (ClientRouter) entre listado y ficha.
- **Lista de iglesias con checkbox + orden:** en la ficha, cada iglesia es una fila con checkbox (marcar), número de orden, nombre, dirección textual (fuente primaria) y mapa embebido plegable; en el modo peregrino la lista prioriza acción táctil (checkbox grande, target >= 44px) y permite reordenar (mover arriba/abajo, accesible por teclado).
- **Mapa embebido:** iframe perezoso (`loading="lazy"`) por iglesia, sin API keys en cliente (ADR-V7I-005); la dirección textual siempre visible junto al mapa.
- **Barra de progreso 7/7:** componente compartido con `role="progressbar"`, `aria-valuenow`/`aria-valuemax=7` y texto "3 de 7"; visible en ficha y en `/mi-peregrinacion`.
- **Celebración al completar:** al llegar 7/7, vista de celebración (7/7) con recapitulación (fecha, itinerario, iglesias); estado persistente "completada" con opción de iniciar nueva peregrinación; una sola emisión del evento y de la celebración por peregrinación (RB-V7I-006).
- **Estados de interfaz:** skeleton en cargas (listado, ficha, progreso), estados vacíos con CTA (ciudad sin itinerarios; sin peregrinación iniciada), error con reintento (toast) y éxito; banner de degradación si el CMS no responde (ver estados en [03-FRD](03-FRD.md)).
- **Accesibilidad base:** WCAG 2.2 AA — checkboxes nativos con `label` asociado, foco visible, navegación por teclado en reordenar, contraste AA en claro/oscuro (`data-theme`), mensajes de estado anunciados (`aria-live="polite"` para el progreso).
- **Tema:** claro/oscuro vía `data-theme` con tokens del ecosistema; preferencia persistida en `visita7.preferences.theme` (usuario con sesión) con fallback a `system`.
