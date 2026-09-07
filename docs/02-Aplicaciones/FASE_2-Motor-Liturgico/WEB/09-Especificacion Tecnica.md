---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - arquitectura
  - especificacion-tecnica
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
---

# Especificacion Tecnica - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro 6 (SSR + API routes)
- UI: React 19 + Tailwind CSS v4 + `@repo/ui` (panel admin)
- Lenguaje principal: TypeScript 5
- Base de datos: Supabase PostgreSQL (RLS activa)
- Autenticacion: Supabase Auth (panel admin)
- Testing: Vitest
- Build: Turborepo (monorepo Fosforo)

## Arquitectura tecnica

- Patron de arquitectura: Servicio backend (API REST) con precalculacion en PostgreSQL y cache LRU en memoria.
- Modulos principales:
  - `src/apps/motor-liturgico/src/pages/api/liturgia/` - Endpoints REST.
  - `src/apps/motor-liturgico/src/lib/compute.ts` - Logica de calculo liturgico (ciclo, color, tipo por fecha).
  - `src/apps/motor-liturgico/src/lib/pascua.ts` - Algoritmo de Gauss para Pascua y fiestas moviles.
  - `src/apps/motor-liturgico/src/lib/cache.ts` - Cache LRU con invalidacion por ano liturgico.
  - `src/apps/motor-liturgico/src/lib/supabase.ts` - Cliente Supabase para consultas y escrituras admin.
  - `src/apps/motor-liturgico/src/components/admin/` - Panel admin para gestion de celebraciones excepcionales.
- Dependencias compartidas: `@repo/ui` (componentes y estilos), `@repo/ui/styles.css`, `@repo/ui/foundation.css`.

## Modelos de datos

- Modelo `LiturgicalYear`: `{ id, year, cycle, start_date, end_date }` - Ano liturgico con ciclo A/B/C.
- Modelo `LiturgicalCelebration`: `{ id, date, name, type, color, priority, season_id, year_id, is_movable, readings }` - Celebracion por fecha.
- Modelo `LiturgicalReading`: `{ id, celebration_id, cms_entry_id, order }` - Referencia a lectura del CMS.
- Modelo `LiturgicalSeason`: `{ id, name, color, start_rule, end_rule }` - Tiempo liturgico (Adviento, Navidad, Cuaresma, Pascua, Tiempo Ordinario).

## Endpoints

| Metodo | Ruta                            | Proposito                                                                     |
| ------ | ------------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/api/liturgia/{fecha}`         | Resolver celebracion liturgica para una fecha (YYYY-MM-DD)                    |
| GET    | `/api/liturgia/rango`           | Listar celebraciones en un rango de fechas (`?desde=&hasta=`, maximo 31 dias) |
| GET    | `/api/liturgia/pascua/{año}`    | Calcular fecha de Pascua y fiestas moviles para un ano (2000-2100)            |
| POST   | `/api/admin/celebraciones`      | Crear celebracion excepcional (requiere auth + rol editor)                    |
| PUT    | `/api/admin/celebraciones/{id}` | Editar celebracion excepcional (requiere auth + rol editor)                   |
| DELETE | `/api/admin/celebraciones/{id}` | Eliminar celebracion excepcional (requiere auth + rol editor)                 |

### Ejemplo de respuesta `GET /api/liturgia/2026-12-25`

```json
{
  "fecha": "2026-12-25",
  "ciclo": "A",
  "celebracion": "Navidad - Natividad del Senor",
  "tipo": "solemnidad",
  "color": ["blanco"],
  "tiempo_liturgico": "Navidad",
  "lecturas": [
    { "cms_entry_id": "cms-abc-001", "orden": 1, "tipo": "primera_lectura" },
    { "cms_entry_id": "cms-abc-002", "orden": 2, "tipo": "salmo" },
    { "cms_entry_id": "cms-abc-003", "orden": 3, "tipo": "segunda_lectura" },
    { "cms_entry_id": "cms-abc-004", "orden": 4, "tipo": "evangelio" }
  ]
}
```

## Consideraciones UI/UX

- Navegacion principal: panel admin para gestion de celebraciones excepcionales (crear, editar, eliminar). Lista de celebraciones por ano con busqueda por fecha.
- Estados de interfaz (loading/empty/error/success): skeleton de `@repo/ui` durante carga; mensaje informativo cuando no hay celebracion excepcional; alerta de error con descripcion para fechas fuera de rango; tabla con resultados en success.
- Accesibilidad base: labels ARIA, navegacion por teclado, contraste WCAG 2.2 AA en el panel admin.
- El Motor es principalmente un servicio backend; la UI es solo para editores. Las apps consumidoras renderizan el contenido con sus propios componentes, reutilizando `@repo/ui`.
- Responsive: el panel admin funciona en desktop y tablet; no se optimiza para mobile (editores usan desktop).
