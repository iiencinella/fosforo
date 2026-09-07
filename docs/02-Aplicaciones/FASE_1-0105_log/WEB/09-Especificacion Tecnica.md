---
tags:
  - proyecto/fosforo
  - especificacion-tecnica
  - aplicacion/log
  - rum
  - analiticas
type: app-especificacion-tecnica
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
  - "[[08-Decisiones de Arquitectura|ADR Log]]"
---

# Especificacion Tecnica - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

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
  - `src/components/` — Componentes React (LogTable, LogFilters, DashboardMetrics, LogChart, ProductDashboard, FunnelChart, RetentionChart, WebVitalsChart, etc.)
  - `src/layouts/` — Layouts de Astro
  - `src/lib/` — Utilidades: validacion Zod, helpers DB, formateo
  - `src/types/` — Tipos TypeScript compartidos
  - `src/styles/` — Estilos especificos de la app
- **Dependencias compartidas:**
  - `@repo/ui` — Foundation CSS, componentes Astro comunes
  - `@repo/tailwind-config` — Tokens de color, tema claro/oscuro
  - `@repo/api-utils/log-client` — Cliente de ingesta de logs (usado por apps emisoras)
  - `@repo/analytics` — SDK de RUM (usado por apps anfitrionas; a crear)

## Rutas de la aplicacion

### Logs operativos (MVP vigente)

| Ruta                     | Tipo              | Descripcion                                 | Protegida        |
| ------------------------ | ----------------- | ------------------------------------------- | ---------------- |
| `/login`                 | Pagina SSR        | Login via Supabase Auth                     | No               |
| `/` o `/logs`            | Pagina SSR        | Listado de logs con filtros                 | Si (dev/ops)     |
| `/logs/[id]`             | Pagina SSR        | Detalle de log individual                   | Si (dev/ops)     |
| `/dashboard`             | Pagina SSR        | Dashboard operativo de metricas y alertas   | Si (dev/ops)     |
| `/api/logs`              | API endpoint POST | Ingesta de logs                             | Si (API key)     |
| `/api/logs`              | API endpoint GET  | Listado de logs con filtros                 | Si (JWT dev/ops) |
| `/api/logs/[id]`         | API endpoint GET  | Detalle de log                              | Si (JWT dev/ops) |
| `/api/dashboard/metrics` | API endpoint GET  | Metricas agregadas para dashboard operativo | Si (JWT ops)     |

### RUM y analíticas (extensión)

| Ruta                                | Tipo              | Descripcion                                                                     | Protegida                     |
| ----------------------------------- | ----------------- | ------------------------------------------------------------------------------- | ----------------------------- |
| `/dashboard-producto`               | Pagina SSR        | Dashboard de producto: embudos, retención, top páginas, Web Vitals              | Si (dev/ops/product)          |
| `/api/rum`                          | API endpoint POST | Ingesta de eventos RUM (pageview, custom event, frontend error)                 | Si (origen app + DNT/consent) |
| `/api/rum/vitals`                   | API endpoint POST | Ingesta de Web Vitals (LCP, INP, CLS)                                           | Si (origen app + DNT/consent) |
| `/api/dashboard/producto`           | API endpoint GET  | Métricas agregadas para dashboard de producto (top páginas, embudos, retención) | Si (JWT dev/ops/product)      |
| `/api/dashboard/producto/funnel`    | API endpoint GET  | Embudos predefinidos o custom                                                   | Si (JWT dev/ops/product)      |
| `/api/dashboard/producto/retention` | API endpoint GET  | Retención por cohorte                                                           | Si (JWT dev/ops/product)      |
| `/admin/rum-sampling`               | Pagina SSR        | Configuración de sampling por app                                               | Si (dev/ops)                  |

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

### RumEvent (TypeScript)

```typescript
type RumEventName =
  "pageview" | "frontend.error" | `${string}.${string}.${string}`; // ej: "misal.lectio.started"

interface RumEvent {
  id: string;
  app: string;
  event_name: RumEventName;
  page_url?: string;
  page_path?: string;
  session_id_anon: string;
  metadata?: Record<string, unknown>;
  user_agent_hash?: string;
  app_version?: string;
  environment?: string;
  timestamp: string;
  has_consent: boolean;
}
```

### RumVital (TypeScript)

```typescript
type VitalMetricName = "LCP" | "INP" | "CLS";
type VitalRating = "good" | "needs-improvement" | "poor";

interface RumVital {
  id: string;
  app: string;
  page_url?: string;
  page_path?: string;
  metric_name: VitalMetricName;
  metric_value: number;
  rating: VitalRating;
  session_id_anon: string;
  app_version?: string;
  timestamp: string;
}
```

### SDK `@repo/analytics` (API pública)

```typescript
interface SamplingConfig {
  pageview?: number; // 0-1, default 1.0
  custom?: number; // 0-1, default 0.1
  error?: number; // 0-1, default 1.0
}

interface AnalyticsConfig {
  appName: string;
  apiUrl: string; // URL del backend RUM (ej: https://log.fosforo.app)
  samplingConfig?: SamplingConfig;
  debug?: boolean;
}

interface AnalyticsSDK {
  init(config: AnalyticsConfig): void;
  track(eventName: RumEventName, metadata?: Record<string, unknown>): void;
  captureVitals(): void; // Activa captura automática de Web Vitals
  respectDNT(): boolean; // Verifica navigator.doNotTrack
  hasConsent(): boolean;
  setConsent(granted: boolean): void;
}
```

### LogIngestPayload (entrada API logs)

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

### RumEventPayload (entrada API RUM)

```typescript
interface RumEventPayload {
  app: string;
  event_name: RumEventName;
  page_url?: string;
  page_path?: string;
  session_id_anon: string;
  metadata?: Record<string, unknown>;
  app_version?: string;
  environment?: string;
  timestamp: string;
  has_consent: boolean;
}
```

### RumVitalPayload (entrada API RUM vitals)

```typescript
interface RumVitalPayload {
  app: string;
  page_url?: string;
  page_path?: string;
  metric_name: VitalMetricName;
  metric_value: number;
  rating: VitalRating;
  session_id_anon: string;
  app_version?: string;
  timestamp: string;
}
```

## Consideraciones UI/UX

- Navegación principal: Sidebar con secciones Logs, Dashboard (operativo), Dashboard de Producto, Sampling Config (admin).
- Tema claro/oscuro segun ecosistema.
- Estados de interfaz: loading (skeleton), empty (mensaje + CTA), error (mensaje + retry), success.
- Accesibilidad base: navegación por teclado, ARIA labels, contraste AA, focus visible.
- Reutiliza `@repo/ui` para shells, cards, headers, filtros, paginación y estados vacíos.
- Dashboard de producto: cards con embudos predefinidos, gráficos de retención por cohorte, top páginas, distribución de Web Vitals por rating.
- Separación visual clara entre dashboard operativo (logs, errores, alertas) y dashboard de producto (embudos, retención, Web Vitals).
