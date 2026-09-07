---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-arquitectura
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[08-Decisiones de Arquitectura|Decisiones de Arquitectura]]"
  - "[[10-OWASP|OWASP]]"
---

# Especificación Técnica - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Stack

| Capa      | Tecnología                                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Render    | Astro 6 modo SSR (adapter del ecosistema, Vercel)                                                                                              |
| Islas     | React 19 (check de misión, ring de racha, formularios)                                                                                         |
| Estilos   | Tailwind v4 + tokens de `@repo/tailwind-config` (`shared-styles.css`)                                                                          |
| UI        | `@repo/ui` (`@repo/ui/styles.css`, `@repo/ui/foundation.css`, exports de dominio): cards, headers, shells, filtros, estados vacíos, paginación |
| Backend   | Supabase: Postgres (esquema `vida_misionero`, RLS), Auth (via Sistema de Logueo), Edge Functions (cron de reset)                               |
| Contenido | CMS (Sistema de Contenidos): content types `ruta` y `mision`                                                                                   |
| Observab. | Log (RUM + logs estructurados)                                                                                                                 |

Reglas de estilo (AGENTS.md): reutilizar `@repo/ui` antes de crear primitives; CSS de app solo para reglas estrictamente de dominio.

## 2. Estructura de módulos (`src/apps/vida-misionero/`)

```text
src/apps/vida-misionero/
├── pages/
│   ├── rutas.astro                 # GET  /rutas          (listado + estado)
│   ├── ruta/[slug].astro           # GET  /ruta/:slug     (ficha con pasos y misiones)
│   ├── hoy.astro                   # GET  /hoy            (misiones del día local)
│   ├── progreso.astro              # GET  /progreso       (puntos, nivel, racha, insignias, preferencias)
│   ├── api/
│   │   ├── misiones/completar.ts   # POST  /api/misiones/completar
│   │   ├── preferencias.ts         # GET/PUT /api/preferencias
│   │   └── reportes.ts             # POST  /api/reportes
├── lib/
│   ├── session.ts                  # verificación de sesión (Sistema de Logueo) + guard SSR/API
│   ├── cms.ts                      # cliente CMS con cache de revalidación; validación de content_ref
│   ├── progress.ts                 # puntos, niveles (reglas versionadas), transacción de completado
│   ├── streak.ts                   # cálculo de racha por tz_offset (deriva de mission_completions)
│   ├── badges.ts                   # hitos e inserción idempotente de insignias
│   ├── rum.ts                      # wrapper de eventos hacia Log (best-effort)
│   └── validation.ts               # esquemas de payload (mission_ref, preferencias, reportes)
├── components/
│   ├── RouteCard.tsx               # card de ruta con estado y barra de avance
│   ├── RouteHeader.astro           # header de ficha (dominio: pasos, duración)
│   ├── StepList.tsx                # lista de pasos con misiones y estados
│   ├── MissionItem.tsx             # misión con check accesible (island)
│   ├── TodayList.tsx               # misiones del día (diarias + semanales)
│   ├── StreakRing.tsx              # ring de racha (SVG accesible)
│   ├── ProgressSummary.tsx         # puntos, nivel y progreso por ruta
│   ├── BadgeGrid.tsx               # insignias otorgadas y bloqueadas con criterio
│   ├── ReminderForm.tsx            # preferencias de recordatorio + consentimiento
│   └── ReportDialog.tsx            # reporte de problema de contenido
└── __tests__/                      # fixtures y suites Vitest (05-Tests Unitarios)
```

## 3. Endpoints

| Método  | Path                      | Auth | Entrada / Salida                                                                               | Errores            |
| ------- | ------------------------- | ---- | ---------------------------------------------------------------------------------------------- | ------------------ |
| GET     | `/rutas`                  | Sí   | - -> lista de rutas + estado por ruta                                                          | 302 (sin sesión)   |
| GET     | `/ruta/[slug]`            | Sí   | slug -> ficha de ruta + pasos + misiones + estados                                             | 302, 404           |
| GET     | `/hoy`                    | Sí   | - -> misiones diarias/semanales vigentes (día local)                                           | 302                |
| GET     | `/progreso`               | Sí   | - -> puntos, nivel, racha actual/mejor, progreso por ruta, insignias, preferencias             | 302                |
| POST    | `/api/misiones/completar` | Sí   | `{ mission_ref }` -> `{ already_completed, puntos, nivel, racha, badges_nuevos[] }`            | 401, 404, 422, 429 |
| GET/PUT | `/api/preferencias`       | Sí   | `{ recordatorio_activo, recordatorio_canal, recordatorio_hora, tz_offset, consentimiento_at }` | 401, 400           |
| POST    | `/api/reportes`           | Sí   | `{ content_ref, motivo, descripcion }` -> `{ id, acuse }`                                      | 401, 400, 429      |

Contratos:

- `POST /api/misiones/completar` es la ÚNICA mutación de progreso (ADR-MISION-002). Respuesta idempotente: reintentos -> `already_completed: true` con los mismos valores derivados y cero efectos.
- `tz_offset` en `preferencias` se toma de la sesión/cliente al guardar y se actualiza en cada login/sesión; los históricos de completados no se reescriben.
- Todos los endpoints validan payload con esquemas estrictos (campos extra rechazados) y responden errores JSON con códigos de 03-FRD (MISION-001..006).

## 4. Modelos (TypeScript)

```ts
type Progress = {
  userId: string; // UUID (auth)
  rutaId: string; // content_ref 'ruta' del CMS
  pasosCompletados: number; // >= 0
  puntos: number; // >= 0
  nivel: number; // >= 1 (umbrales versionados en server)
  updatedAt: string; // ISO 8601
};

type Completion = {
  id: string; // UUID
  userId: string;
  missionRef: string; // content_ref 'mision' del CMS
  fecha: string; // 'YYYY-MM-DD' LOCAL del usuario
  tzOffset: number; // minutos (inmutable por completado)
  createdAt: string;
};

type Badge = {
  id: string;
  userId: string;
  badgeRef:
    "racha-5" | "racha-30" | "racha-90" | "primera-ruta" | `ruta-${string}`;
  otorgadaAt: string;
};

type Preferences = {
  userId: string;
  recordatorioActivo: boolean; // default false
  recordatorioCanal: "in_app" | "email"; // default 'in_app'
  recordatorioHora: string; // 'HH:mm' (default '21:00')
  tzOffset: number;
  consentimientoAt: string | null; // null = sin consentimiento
  updatedAt: string;
};
```

## 5. Lógica de dominio clave

- `lib/progress.ts`: `completarMision(userId, missionRef, now, tzOffset)` -> transacción: insert completion (conflicto unique -> no-op), update `progress` (+puntos según periodicidad del CMS, recálculo de nivel), llamada a `lib/badges.ts`. Puntos: diaria 10, semanal 30 (config versionada).
- `lib/streak.ts`: `racha(userId, tzOffset, hoyLocal)` -> lee completados recientes, agrupa por `fecha` local, camina hacia atrás; devuelve `{ actual, mejor }`. Puro e inyectable con clock (testeable, TC-MISION-012/013).
- `lib/badges.ts`: `evaluarHitos(userId, ctx)` -> hitos de racha (5/30/90), `primera-ruta`, `ruta-<slug>`; `INSERT ... ON CONFLICT DO NOTHING`; devuelve solo las nuevas.
- `lib/cms.ts`: `getRutas()`, `getRuta(slug)`, `getMision(missionRef)`, `misionesVigentes(fechaLocal)`; cache de revalidación + validación de vigencia (diaria/semanal) por fecha local.
- `lib/rum.ts`: `track(evento, props)` -> a Log, best-effort, sin PII; `mision.completed` se emite solo cuando el insert fue nuevo.

## 6. Reset diario (cron/edge)

- Edge Function programada diaria (`reset-diario`): resuelve misiones vigentes desde el CMS, materializa la disponibilidad del día (deriva de `mission_completions`), encola recordatorios opt-in agrupados por `tz_offset`, alerta a editores si no hay misiones y suprime recordatorios vacíos. Idempotente por fecha de ejecución (04-Flujos, secuencia reset).

## 7. UI/UX

- **Cards de progreso:** card de ruta (estado + barra de avance) usando cards de `@repo/ui`; estados vacíos y skeletons del paquete compartido mientras carga SSR/islas.
- **Ring de racha (StreakRing):** SVG circular con número de días; `role="img"` con `aria-label` descriptivo ("Racha de 12 días"); versión compacta en `/hoy`.
- **Lista de misiones del día (TodayList + MissionItem):** cada misión es un ítem con título, duración estimada, y check accesible (botón real con `aria-pressed`/estado, no div clicable); al completar: check animado + feedback de puntos; estado `already_completed` renderiza check fijo sin animación.
- **Accesibilidad (WCAG 2.2 AA):** navegación por teclado completa, foco visible (tokens del design system), contraste >= 4.5:1, `aria-live="polite"` para confirmaciones de progreso (puntos/racha), labels en formularios de preferencias y reporte, móvil-first con hamburguesa del shell del ecosistema.
- **Tema:** claro/oscuro vía `data-theme` del ecosistema; View Transitions (ClientRouter) para navegación rutas -> ficha -> hoy sin parpadeos; skeleton loading en islas con datos asíncronos.
- **Feedback de errores UX:** 401 -> redirect a login con retorno; 429 -> botón deshabilitado con cuenta regresiva; 404/422 -> mensajes en línea con CTA de vuelta a `/hoy`.

## 8. Performance y observabilidad

- SSR con cache de revalidación para contenido CMS (LCP p75 < 2.5s); islas React solo donde hay interacción (check, ring, formularios).
- RUM hacia Log con eventos de 02-SRS; logs estructurados server-side sin secretos ni PII.
- Métricas de negocio (retención, misiones/semana, embudo) consultan DB + RUM según ADR-MISION-008.

## 9. Configuración y secretos

- Variables de entorno runtime (no commitear): URL y service key de Supabase (server-only), endpoint del CMS, endpoint de Log, endpoint del Sistema de Notificaciones.
- API keys SIEMPRE en SSR/Edge Functions (SEC-MISION-006); el bundle cliente solo recibe URL pública y anon key si el patrón del ecosistema lo permite; `service_role` exclusivo de server routes/Edge Functions.
