---
tags:
  - proyecto/fosforo
  - biblia
  - arquitectura
  - especificación-tecnica
  - aplicación
type: app-tech-spec
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-08-14
related:
  - "[[00-README|0102 Biblia]]"
---

# Especificación Tecnica - 0102_biblia

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro para routing, SSR/SSG híbrido y endpoints internos.
- Lenguaje principal: TypeScript.
- CSS/Tailwind: Tailwind CSS v4 con plugin `@tailwindcss/vite` en Vite. Build con `inlineStylesheets: "always"` para evitar CSS externo en SSR.
- Herramientas de build: Astro build, pnpm y Turborepo.
- Testing: Vitest para lógica de dominio, servicios y validadores; pruebas de integración a definir por fase.
- Generación de imagen OG: `sharp` como dependencia para renderizado de imagen OG (`og-biblia.png`) vía script `src/apps/biblia/scripts/generate-og-png.mjs`.
- Extracción de datos: scripts `fetch-ewtn-curl.ts` y `fetch-ewtn-rest.ts` en `src/apps/biblia/scripts/` para extraer lecturas litúrgicas desde EWTN.

## Arquitectura tecnica

- Patrón de arquitectura: app web por capas con páginas, componentes, servicios de aplicación y endpoints BFF.
- Modulos principales: `reader`, `search`, `liturgy`, `versions`, `api`, `ingestion`, `observability`, `shared-ui`, `bible-versions` (servicio server-side de catálogo), `share` (página de compartir con redes sociales), `widget` (widget embebible del evangelio), `scripts` (generación OG y extracción EWTN).
- Dependencias compartidas: `@repo/ui`, `@repo/tailwind-config`, utilidades TypeScript del monorepo.
- Scope de estilos: la app aplica la clase `biblia-theme` en el `<body>` del layout para aplicar overrides CSS sin forkar componentes compartidos.
- Servicio de versiónes: `src/lib/server/bible-versions.ts` centraliza la consulta del catálogo de versiones desde Supabase con fallback automático a datos locales (`getDefaultVersion`). Los endpoints y páginas consumen este servicio en lugar de consultar Supabase directamente.

## Modelos de datos

- Modelo 1: catálogo de versiones (`biblia_versions`) con flags `is_enabled` e `is_internal_only`.
- Modelo 2: jerarquía bíblica (`biblia_books`, `biblia_chapters`, `biblia_verses`) con índices para búsqueda textual.
- Modelo 3: lecturas litúrgicas (`liturgy_daily_readings`) por fecha/rito/tipo/región con referencia al texto bíblico (MVP: `rite=roman`, `region_code=AR`).
- Modelo 4: trazabilidad de ingestion (`biblia_ingestion_runs`) para auditoría operativa.

## Endpoints (si aplica)

| Metodo | Ruta                          | Proposito                                                                              | Validaciónes y códigos de error                                                                                                                                                                      |
| ------ | ----------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/bible/versions`         | Listar versiones disponibles para el entorno actual.                                   | `BIBLIA_VERSIONS_ERROR` (500) si Supabase no responde. Usa `getBibleVersionCatalog()`.                                                                                                               |
| GET    | `/api/bible/read`             | Resolver lectura por `version`, `book`, `chapter` y opcionalmente rango de versículos. | `BIBLIA_INVALID_REFERENCE` (400), `BIBLIA_VERSION_LOOKUP_ERROR` (500), `BIBLIA_VERSION_DISABLED` (403), `BIBLIA_NOT_FOUND` (404). Valida que la versión exista y esté habilitada antes de consultar. |
| GET    | `/api/bible/search`           | Ejecutar búsqueda textual simple por `query` sobre versión activa.                     | `BIBLIA_SEARCH_INVALID_QUERY` (400), `BIBLIA_VERSION_LOOKUP_ERROR` (500), `BIBLIA_VERSION_DISABLED` (403), `BIBLIA_SEARCH_ERROR` (500). Retorna `BIBLIA_SEARCH_EMPTY` en body si no hay resultados.  |
| GET    | `/api/liturgy/daily`          | Obtener lecturas del día por fecha y rito.                                             | `BIBLIA_LITURGY_UNSUPPORTED_SCOPE` (400), `BIBLIA_LITURGY_NOT_FOUND` (200 con vacío).                                                                                                                |
| GET    | `/api/health`                 | Health check con estado del catálogo de versiones.                                     | Retorna 200 con `status: "ok"` o 503 con `status: "degraded"` si Supabase no responde.                                                                                                               |
| POST   | `/api/internal/ingestion/run` | Disparar o registrar corrida de carga interna de contenido (solo entorno controlado).  | `BIBLIA_INGESTION_KEY_NOT_CONFIGURED` (503), `BIBLIA_INGESTION_UNAUTHORIZED` (401/403), `BIBLIA_INGESTION_MANUAL_ONLY` (501). Valida clave vía `x-biblia-ingestion-key` o `Authorization: Bearer`.   |

Notas de contrato:

- Los endpoints de lectura y búsqueda son de consumo interno para MVP; no se documentan como API pública externa.
- `POST /api/internal/ingestion/run` requiere autenticación vía `BIBLIA_INTERNAL_INGESTION_KEY` (header `x-biblia-ingestion-key` o `Authorization: Bearer`) y no debe exponerse al público.
- Para MVP, `/api/liturgy/daily` debe resolver únicamente calendario de Rito Romano (Argentina); la multi-región queda para integración futura con app de calendario.
- Todos los endpoints de lectura y búsqueda validan que la versión solicitada existe y está habilitada (`is_enabled = true`) antes de ejecutar la consulta a Supabase, retornando 403 en caso contrario.

## Consideraciónes UI/UX

- Vista única consolidada: `/` integra Lectura, Búsqueda y Liturgia en un viewport fijo de 100dvh sin scroll de página. Los modos se seleccionan con un carrusel de tarjetas; el contenido interactivo vive en paneles fijos y el contenido largo se muestra en modales (`<dialog>` nativo) con scroll interno.
- Modos de operación: **Lectura** (selects versión/libro/capítulo + prev/next → modal con versículos), **Búsqueda** (input + resultados paginados en modal con formato de versículos numerados, igual que lectura → click abre modo lectura con el pasaje), **Liturgia** (selector fecha + carrusel de lecturas del día → carga texto vía `/api/bible/search` y lo muestra en modal).
- Rutas legacy: `/lectura`, `/busqueda`, `/liturgia` redirigen a `/?modo=...` preservando query params. `/estado` se mantiene fuera de la vista única.
- Página de compartir (`/compartir`): симптомы social sharing con botones de Facebook, X/Twitter, LinkedIn y WhatsApp, copiar enlace, Web Share API nativa (`navigator.share`) y vista previa de OG card. Acepta query param `?date=YYYY-MM-DD` para seleccionar la fecha a compartir. La página resuelve la jornada server-side y genera dinámicamente las URLs de share con `encodeURIComponent`. Meta tags OG mejorados con `og:image:type`, `og:image:width`, `og:image:height` e `og:locale`.
- Widget embebible (`/widget/gospel`): iframe autónomo que muestra el evangelio del día con soporte para tema claro/oscuro, video de YouTube y episodio/canción de Spotify vía query params.
- States de interfaz: skeleton de carga en paneles y modales, error recuperable con reintento, estado vacío informativo.
- Accesibilidad: `aria-labelledby` en modales, `aria-pressed` en carruseles, foco visible, navegación por teclado, contraste mínimo AA.
- Consistencia visual: reutilizar `@repo/ui` y estilos compartidos del monorepo. Header y tema: mismo tratamiento visual de `portal` para CTA, switch de tema y halo del logo, overrides via clase `biblia-theme` en el `<body>` del layout.
- Primitives compartidas: `Modal` y `Carousel`/`CarouselCard` en `@repo/ui` (estilos en `overlays.css`), reutilizables por otras apps del ecosistema.
- Página de estado operativo (`/estado`): muestra métricas de cobertura local, fuentes de datos y enlaces a endpoints de observabilidad.
- ShareButton en modales: los botones de compartir en los modales de búsqueda y liturgia (`PortalBibleHub`) incluyen `?ref=` y `?date=` como query params en la URL de `/compartir` para preservar contexto.
