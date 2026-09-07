---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - arquitectura
  - especificacion-tecnica
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
---

# Especificación Tecnica - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro 6 (SSR con adapter Vercel)
- Lenguaje principal: TypeScript (strict mode)
- UI interactiva: React 19 (islands)
- CSS: Tailwind CSS v4 vía @tailwindcss/vite
- UI compartida: `@repo/ui`, `@repo/tailwind-config`
- Validación: Zod
- Backend/DB: Supabase (solo esquema `misal` para favoritos/preferencias/reportes)
- Auth: Supabase Auth vía Sistema de Logueo
- RUM: `@repo/analytics` (SDK compartido)
- Logs: `@repo/api-utils/log-client`
- Testing: Vitest + React Testing Library
- Build/Deploy: Turborepo + Vercel

## Arquitectura tecnica

- Patrón: Astro SSR con cache por día (edge), islands de React para interactividad, View Transitions (ClientRouter).
- Modulos principales:
  - `src/apps/misal/src/pages/index.astro` — Página del día (hoy).
  - `src/apps/misal/src/pages/dia/[fecha].astro` — Página por fecha.
  - `src/apps/misal/src/pages/ordinario.astro` — Ordinario de la Misa.
  - `src/apps/misal/src/pages/favoritos.astro` — Favoritos (auth).
  - `src/apps/misal/src/components/` — LecturaCard, ColorLiturgicoBadge, NavFecha, ModoLectura, ConsentBanner.
  - `src/apps/misal/src/lib/motor.ts` — Cliente del Motor Litúrgico con cache.
  - `src/apps/misal/src/lib/cms.ts` — Cliente del CMS con cache.
  - `src/apps/misal/src/lib/degradacion.ts` — Fallback con cache + banner.
- Dependencias compartidas: `@repo/ui`, `@repo/tailwind-config`, `@repo/analytics`, `@repo/api-utils`.

## Modelos de datos

- `LecturaDia` (vista combinada): `{ fecha, celebracion, color, tipo, ciclo, lecturas: [{tipo: 'primera'|'salmo'|'segunda'|'evangelio', referencia, texto}], oracion_inicial, oracion_final }`.
- `Favorito`: `{ id, user_id, content_ref, fecha, created_at }`.
- `Preferencias`: `{ user_id, modo_lectura, tema, font_size, recordatorio_activo, recordatorio_canal }`.
- `Reporte`: `{ id, content_ref, fecha, tipo, comentario, session_hash, created_at }`.

## Endpoints

| Metodo | Ruta                  | Proposito                              |
| ------ | --------------------- | -------------------------------------- |
| GET    | `/`                   | Página del día (hoy)                   |
| GET    | `/dia/{fecha}`        | Página por fecha                       |
| GET    | `/ordinario`          | Ordinario de la Misa                   |
| GET    | `/favoritos`          | Favoritos del usuario (auth)           |
| POST   | `/api/favoritos`      | Guardar favorito (auth)                |
| DELETE | `/api/favoritos/{id}` | Quitar favorito (auth)                 |
| POST   | `/api/reportes`       | Reportar problema de contenido         |
| PUT    | `/api/preferencias`   | Actualizar preferencias (auth)         |
| POST   | `/api/recordatorio`   | Activar/desactivar recordatorio (auth) |

## Consideraciónes UI/UX

- Cabecera del día: celebración, fecha, ciclo, badge de color litúrgico.
- Lecturas en cards con tipografía serif; estructura semántica (article, h2 por lectura).
- Modo lectura: overlay con tipografía optimizada, tamaño de fuente ajustable, tema oscuro.
- Navegación: botones Ayer/Hoy/Mañana + date picker; hamburguesa en mobile (estándar).
- Estados: skeleton (loading), "Contenido en preparación" (empty), banner degradado, error con reintento.
- Consentimiento RUM: banner en primera visita; DNT respetado.
- Accesibilidad: contraste AA, foco visible, navegación por teclado, landmarks.
