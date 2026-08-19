---
tags:
  - proyecto/fosforo
  - especificacion-tecnica
  - aplicacion/log
type: app-especificacion-tecnica
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|README Log]]"
  - "[[08-Decisiones de Arquitectura|ADR Log]]"
---

# Especificacion Tecnica - 0105_log

## Herramientas y tecnologias

- **Plataforma:** WEB
- **Framework principal:** Astro 6 (SSR con adapter Vercel)
- **Lenguaje principal:** TypeScript (strict mode)
- **Libreria UI interactiva:** React 19 (islands)
- **Framework CSS:** Tailwind CSS v4 via @tailwindcss/vite
- **UI compartida:** @repo/ui, @repo/tailwind-config
- **Validacion:** Zod
- **Graficos:** Chart.js (via react-chartjs-2)
- **Backend/DB:** Supabase (PostgreSQL + Auth + RLS)
- **Testing:** Vitest
- **Build/Deploy:** Turborepo + Vercel
- **Path alias:** `@/` mapeado a `./src`

## Arquitectura tecnica

- **Patron de arquitectura:** Astro SSR con islands de React. Las paginas se renderizan en servidor (SSR) para proteger rutas por autenticacion. Los componentes interactivos (tabla, filtros, dashboard, graficos) son islands de React que se hidratan en cliente.
- **Modulos principales:**
  - `src/pages/` — Rutas de Astro (paginas + API endpoints)
  - `src/components/` — Componentes React (LogTable, LogFilters, DashboardMetrics, LogChart, etc.)
  - `src/layouts/` — Layouts de Astro
  - `src/lib/` — Utilidades: validacion Zod, helpers DB, formateo
  - `src/types/` — Tipos TypeScript compartidos
  - `src/styles/` — Estilos especificos de la app
- **Dependencias compartidas:**
  - `@repo/ui` — Foundation CSS, componentes Astro comunes
  - `@repo/tailwind-config` — Tokens de color, tema claro/oscuro

## Rutas de la aplicacion

| Ruta                     | Tipo              | Descripcion                       | Protegida        |
| ------------------------ | ----------------- | --------------------------------- | ---------------- |
| `/login`                 | Pagina SSR        | Login via Supabase Auth           | No               |
| `/` o `/logs`            | Pagina SSR        | Listado de logs con filtros       | Si (dev/ops)     |
| `/logs/[id]`             | Pagina SSR        | Detalle de log individual         | Si (dev/ops)     |
| `/dashboard`             | Pagina SSR        | Dashboard de metricas y alertas   | Si (ops)         |
| `/api/logs`              | API endpoint POST | Ingesta de logs                   | Si (API key)     |
| `/api/logs`              | API endpoint GET  | Listado de logs con filtros       | Si (JWT dev/ops) |
| `/api/logs/[id]`         | API endpoint GET  | Detalle de log                    | Si (JWT dev/ops) |
| `/api/dashboard/metrics` | API endpoint GET  | Metricas agregadas para dashboard | Si (JWT ops)     |

## Modelos de datos

### LogEntry (TypeScript)

```typescript
interface LogEntry {
  id: string;
  app: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  stack_trace?: string;
  app_version?: string;
  environment?: string;
  created_at: string;
}
```

### LogIngestPayload (entrada API)

```typescript
interface LogIngestPayload {
  app: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  message: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
  stack_trace?: string;
  app_version?: string;
  environment?: string;
}
```

## Endpoints

### POST /api/logs

Request:

```
POST /api/logs
X-API-Key: <api_key>
Content-Type: application/json

{
  "app": "portal",
  "level": "error",
  "message": "Connection timeout fetching readings",
  "metadata": { "userId": "abc123", "durationMs": 5000 },
  "stack_trace": "Error: Connection timeout\n    at fetchReadings ..."
}
```

Response 201:

```json
{ "id": "uuid-del-log" }
```

### GET /api/logs

Query params: `page`, `limit` (max 50), `level`, `app`, `since`, `until`, `search`

Response 200:

```json
{
  "data": [
    /* LogEntry[] */
  ],
  "total": 1234,
  "page": 1,
  "limit": 50
}
```

## Consideraciones UI/UX

- **Navegacion principal:** Sidebar compacta con enlaces a Logs, Dashboard (solo ops). Header con toggle de tema y usuario.
- **Estados de interfaz:**
  - _Loading:_ Skeleton de tabla (5 filas) y skeleton de cards en dashboard.
  - _Empty:_ Ilustracion simple + "No hay logs registrados. Consulta la guia de integracion para empezar."
  - _Error:_ Banner de error con descripcion y boton "Reintentar".
  - _Success:_ Datos visibles normalmente.
- **Accesibilidad base:**
  - Foco visible en todos los elementos interactivos
  - Roles ARIA en tabla, filtros, dashboard
  - Etiquetas en todos los campos de formulario
  - Skip-to-content link
  - Navegacion por teclado en tabla (flechas arriba/abajo para seleccionar fila)
