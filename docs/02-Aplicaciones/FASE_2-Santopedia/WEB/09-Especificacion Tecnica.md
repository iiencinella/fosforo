---
tags:
  - proyecto/fosforo
  - santopedia
  - especificacion-tecnica
  - web
type: app-arquitectura
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[08-Decisiones de Arquitectura|08-Decisiones de Arquitectura]]"
  - "[[10-OWASP|10-OWASP]]"
---

# Santopedia — Especificación Técnica

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Stack

| Capa          | Tecnología                                                                          |
| ------------- | ----------------------------------------------------------------------------------- |
| Framework     | Astro 6 (SSR, monorepo Turborepo)                                                   |
| UI reactiva   | React 19 (islas: buscador, favorito, reporte)                                       |
| Estilos       | Tailwind v4 con tokens de `@repo/ui` + `packages/tailwind-config/shared-styles.css` |
| UI compartida | `@repo/ui` (cards, header, shell, skeleton, empty states, paginación)               |
| Contenido     | CMS del ecosistema (content type `santo`) vía API                                   |
| Liturgia      | Motor Litúrgico (resolución de fiesta)                                              |
| Auth          | Sistema de Logueo (sesiones compartidas del ecosistema)                             |
| Datos         | Supabase Postgres, esquema `santopedia` con RLS                                     |
| Telemetría    | Log: RUM cliente consentido + logs SSR estructurados                                |
| Tests         | Vitest                                                                              |

## 2. Estructura de módulos

```
src/apps/santopedia/
├── astro.config.mjs
├── package.json
└── src/
    ├── pages/
    │   ├── index.astro                  # Home: buscador, santo del día, accesos por categoría
    │   ├── santos.astro                 # Listado alfabético + filtros (?categoria=&siglo=&pais=&page=)
    │   ├── santo/
    │   │   └── [slug].astro             # Ficha de santo (SSR + cache)
    │   ├── santo-del-dia.astro          # Santo del día (Motor + CMS)
    │   ├── favoritos.astro              # Colección del usuario (guard de sesión)
    │   └── api/
    │       ├── favoritos.ts             # POST/DELETE favoritos (sesión + RLS)
    │       └── reportes.ts              # POST reportes (insert-only, rate limit)
    ├── components/
    │   ├── SantoCard.tsx                # Card reutilizada del patrón @repo/ui
    │   ├── Buscador.tsx                 # Isla: input con debounce + dropdown resultados
    │   ├── BotonFavorito.tsx            # Isla: toggle optimista + CTA login
    │   ├── FormularioReporte.tsx        # Isla: mini-form de reporte de error
    │   ├── FichaSanto.tsx               # Layout de ficha (biografía, iconografía, atributos)
    │   ├── NotaLiturgica.tsx            # Nota de traslación del Motor
    │   ├── SkeletonFicha.astro          # Skeleton de ficha
    │   └── SkeletonListado.astro        # Skeleton de grid
    └── lib/
        ├── cms.ts        # Cliente único del CMS: getSantoBySlug, getSantos (filtros), buscarSantos, getFiestaHoy
        ├── motor.ts      # Wrapper del Motor Litúrgico: getFiesta(santo, fecha), cache diario 24h
        ├── busqueda.ts   # Debounce 300ms, min 2 chars, cancelación de requests, normalización de query
        ├── favoritos.ts  # Toggle + listado de colección (Supabase, sesión, RLS)
        ├── reportes.ts   # Validación de tipos, hash de sesión, insert-only
        ├── rum.ts        # Eventos tipados santo.viewed / santo.searched (consentimiento)
        ├── seo.ts        # JSON-LD Person, meta title/description, canonical
        └── validacion.ts # Patrón de slug, enum de tipos, límites de comentario
```

## 3. Endpoints y páginas

| Ruta / endpoint         | Método | Autenticación  | Descripción                                                                                 |
| ----------------------- | ------ | -------------- | ------------------------------------------------------------------------------------------- |
| `GET /`                 | —      | —              | Home: buscador, santo del día, accesos por categoría                                        |
| `GET /santo/[slug]`     | —      | —              | Ficha de santo (SSR + cache por slug + JSON-LD); slug inválido → 404                        |
| `GET /santos`           | —      | —              | Listado paginado: `?categoria=&siglo=&pais=&page=&pageSize=`; orden alfabético              |
| `GET /santo-del-dia`    | —      | —              | Santo(s) del día via Motor + CMS, con nota litúrgica si hay traslación                      |
| `GET /favoritos`        | —      | sesión         | Colección del usuario; sin sesión → redirige a login                                        |
| `POST /api/favoritos`   | POST   | sesión         | `{contentRef}` → 201; sin sesión → 401; duplicate → idempotente (upsert)                    |
| `DELETE /api/favoritos` | DELETE | sesión         | `{contentRef}` → 204; sin sesión → 401                                                      |
| `POST /api/reportes`    | POST   | — (rate limit) | `{contentRef, tipo, comentario}` → 201; validación de enum y largo; insert-only anonimizado |

Dependencias externas invocadas server-side (`lib/cms.ts`, `lib/motor.ts`): `GET /api/content/santo?slug=X`, `GET /api/content/santos?categoria=&siglo=&pais=&page=&pageSize=`, `GET /api/content/santos?q=&page=`, `GET /api/content/santos/fiesta?fecha=YYYY-MM-DD`.

## 4. Modelos de datos (TypeScript)

```ts
// Santo tal como llega del CMS (solo lectura; nunca persistido en Postgres)
export interface Santo {
  slug: string; // ^[a-z0-9]+(-[a-z0-9]+)*$
  nombre: string;
  alternateName?: string;
  biografiaHtml: string; // rich text del CMS, SIEMPRE sanitizado antes de render
  patronazgos: string[];
  iconografia: {
    descripcion: string;
    imagenes: ImagenSanto[];
    atributos: string[]; // canon: llaves, rueda, lirio, palma, libro...
  };
  taxonomia: {
    categoria: CategoriaSanto; // martires | papas | doctores | fundadores | ...
    siglo: string; // "I".."XXI"
    pais: string; // ISO alpha-2
  };
  canonizacion: string; // fecha/contexto de canonización (CMS)
  sameAs?: string[]; // URLs externas para JSON-LD
}

export interface ImagenSanto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// Ficha ya resuelta (Santo + fiesta por Motor) usada por el render
export interface FichaSanto extends Santo {
  fiesta: {
    fecha: string; // YYYY-MM-DD resuelta por el Motor para hoy
    nombreFiesta: string;
    trasladada: boolean;
    notaLiturgica?: string;
    disponible: boolean; // false si el Motor degradó
  };
  esDelDia: boolean;
  esFavorito: boolean | null; // null = anónimo
}

export interface Favorito {
  id: string;
  userId: string;
  contentRef: string; // slug del santo en el CMS
  createdAt: string;
}

export interface Reporte {
  id: string;
  contentRef: string;
  tipo: "biografia" | "patronazgo" | "fiesta" | "imagen" | "otro";
  comentario: string; // 1..1000
  sessionHash: string; // HMAC salteado; sin IP ni PII
  createdAt: string;
}

// Eventos RUM (allowlist; sin PII)
export type EventoSanto =
  | {
      name: "santo.viewed";
      slug: string;
      origen: "ficha" | "busqueda" | "listado" | "santo_del_dia";
    }
  | { name: "santo.searched"; q: string; resultados: number; exito: boolean };
```

## 5. UI/UX

- **Home:** buscador protagonista, portlet de santo del día, accesos por categoría (grid de taxonomías).
- **Listado:** grid de cards (imagen webp, nombre, categoría, fiesta si hoy); filtros de taxonomía en chips; paginación con `@repo/ui`.
- **Ficha:** hero con imagen y nombre; biografía sanitizada; sección de patronazgos; iconografía con atributos; fiesta con nota litúrgica; acciones (favorito, reportar error).
- **Buscador:** debounce 300ms, mínimo 2 caracteres, dropdown accesible (combobox/listbox, flechas y Enter), cancelación de requests obsoletos, snippet resaltado.
- **Skeletons:** en ficha, listado y santo del día durante carga (patrón `@repo/ui`).
- **Estados:** loading/empty/error/success/degraded según [03-FRD](03-FRD.md) §5; banner compartido de degradación cuando se sirve cache.
- **Tema:** claro/oscuro vía `data-theme` del ecosistema; tokens desde `packages/tailwind-config/shared-styles.css`; sin estilos ad hoc fuera de los compartidos.
- **Accesibilidad (WCAG 2.2 AA):** contraste AA, foco visible, skip-link, alt descriptivos en imágenes, aria-live en resultados de búsqueda, navegación completa por teclado, targets táctiles >= 24px.
- **View transitions:** ClientRouter del ecosistema entre listado y ficha (navegación fluida, respetando SSR).

## 6. Performance

- SSR + cache por slug (stale-while-revalidate); santo del día pre-calculado por fecha.
- Imágenes webp responsive con `srcset` (320/640/960/1280), `sizes` por layout, lazy fuera de viewport, width/height explícitos.
- Islas React mínimas (solo buscador, favorito y reporte se hidratan); resto HTML estático.
- Fuentes y CSS compartidos del ecosistema; sin CSS crítico duplicado.

## 7. Seguridad (resumen; detalle en [10-OWASP](10-OWASP.md))

- API keys del CMS/Motor y credenciales Supabase solo en SSR (`import.meta.env`, nunca en cliente).
- Sanitización del `biografiaHtml` del CMS (allowlist) antes de render.
- RLS en `santopedia.*`; service role nunca expuesto.
- Rate limiting en `/api/reportes` por `session_hash`; validación server-side de slugs (anti path traversal).

## 8. Observabilidad

- RUM: `santo.viewed`, `santo.searched` (consentimiento previo).
- Logs SSR estructurados con request-id, duración de llamadas al CMS/Motor y flags de degradación.
- Alertas por SLO ([11-SLA y SLO](11-SLA%20y%20SLO.md)).
