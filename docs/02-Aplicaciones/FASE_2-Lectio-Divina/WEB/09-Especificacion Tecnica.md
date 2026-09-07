---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-arquitectura
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# Especificación Técnica — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Stack

| Capa           | Elección                                                                              | Notas                                              |
| -------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Base           | Astro 6 (SSR, adaptador Node por plataforma)                                          | Rutas SSR para fechas dinámicas y auth cookies     |
| UI interactiva | React 19 islands                                                                      | Pasos, textarea autoguardado, diario, preferencias |
| Estilos        | Tailwind v4 + `@repo/ui` + tokens de `src/packages/tailwind-config/shared-styles.css` | Tema `data-theme` del ecosistema                   |
| Datos          | Supabase (Postgres + RLS + auth JWT)                                                  | Esquema `lectio` (ver `06-Esquema de Datos.md`)    |
| Integraciones  | Motor Litúrgico, CMS, Sistema de Logueo, Notificaciones, Log (RUM)                    | Concretado en `lib/`                               |
| Tests          | Vitest (unit + RLS integration)                                                       | `05-Tests Unitarios.md`                            |

## 2. Estructura de módulos (`src/apps/lectio-divina/`)

```
src/apps/lectio-divina/
├── pages/
│   ├── hoy.astro              # Página "Hoy": fecha litúrgica + lecturas + CTA
│   ├── sesion/
│   │   └── [fecha].astro      # Sesión guiada (shell SSR + islands de pasos)
│   ├── diario.astro           # Diario personal + historial + streak
│   ├── preferencias.astro     # Recordatorio, tema, tamaño de letra
│   └── api/
│       ├── hoy.ts             # GET lecturas del día (SRF/BFF hacia Motor/CMS)
│       ├── sesion.ts          # GET/POST sesión (startOrResume, complete)
│       └── diario/
│           ├── [paso].ts      # PUT autoguardado por paso
│           ├── index.ts       # GET diario del usuario
│           └── export.ts      # GET exportación Markdown/JSON
├── lib/
│   ├── motor.ts               # Cliente Motor Litúrgico + CMS (cache TTL 15 min)
│   ├── sesion.ts              # startOrResume, complete, getStreak (server)
│   ├── diario.ts              # CRUD de entries (RLS, solo dueño) + export builders
│   ├── guia.ts                # Carga de textos de los 5 pasos (contenido propio)
│   └── rum.ts                 # Emisión whitelist de eventos lectio.*
├── guia/
│   ├── lectio.md, meditatio.md, oratio.md, contemplatio.md, actio.md
├── components/
│   ├── Progreso5Pasos.tsx     # Indicador 1..5
│   ├── PasoActual.tsx         # Shell del paso (guía + lectura + textarea)
│   ├── TextareaAutoguardado.tsx
│   ├── ListaDiario.tsx
│   ├── StreakCalendario.tsx
│   ├── PreferenciasForm.tsx
│   └── pasos/                 # Vista de cada paso
│       ├── LectioPaso.tsx
│       ├── MeditatioPaso.tsx
│       ├── OratioPaso.tsx
│       ├── ContemplatioPaso.tsx
│       └── ActioPaso.tsx
```

## 3. Endpoints

| Método     | Ruta                              | Descripción                                                             | Auth       |
| ---------- | --------------------------------- | ----------------------------------------------------------------------- | ---------- |
| GET        | `/hoy`                            | Página SSR: lecturas del día vía Motor/CMS (fallback manual)            | Pública    |
| GET        | `/api/hoy`                        | JSON de lecturas del día (usado por islands)                            | Pública    |
| GET        | `/sesion/[fecha]`                 | Sesión guiada; crea/retoma (idempotencia) si hay auth                   | Cookie JWT |
| GET / POST | `/api/sesion`                     | Obtener/crear-or-resumir sesión del día (`tz_offset`)                   | JWT        |
| POST       | `/api/sesion` (`action=complete`) | Marcar sesión completada                                                | JWT        |
| PUT        | `/api/diario/{paso}`              | **Autoguardado** de la entrada del paso (upsert)                        | JWT (RLS)  |
| GET        | `/api/diario`                     | Entradas del usuario (por fecha/rango)                                  | JWT (RLS)  |
| GET        | `/api/diario/export`              | Exportación Markdown/JSON del diario propio                             | JWT (RLS)  |
| GET / PUT  | `/api/preferencias`               | Leer/actualizar preferencias (recordatorio, tema, font_size, tz_offset) | JWT        |

Errores: 401 sin auth; 400 payload inválido; 404 fecha/entrada inválida; 429 rate limit; 503 dependencia caída (con fallback de UI).

## 4. Modelos de dominio

```ts
type Paso = "lectio" | "meditatio" | "oratio" | "contemplatio" | "actio";

interface Session {
  id: string;
  user_id: string;
  fecha: string; // YYYY-MM-DD (día local del usuario)
  status: "activa" | "completada";
  paso_actual: 1 | 2 | 3 | 4 | 5;
  pasos_completados: Paso[];
  fuente_lecturas: "motor" | "manual";
  tz_offset: number; // minutos
  created_at: string;
  updated_at: string;
}

interface Entry {
  id: string;
  session_id: string;
  user_id: string;
  paso: Paso;
  texto: string;
  updated_at: string;
}

interface Preferences {
  user_id: string;
  recordatorio_activo: boolean;
  recordatorio_hora?: string; // "07:00" local
  recordatorio_canal: "push" | "email" | "ninguno";
  tz_offset: number;
  tema: "claro" | "oscuro";
  font_size: number; // 100..160 (%)
  updated_at: string;
}
```

## 5. UI/UX

- **Progreso 5 pasos:** barra con nombre litúrgico de cada paso (lectio → … → actio), estado completado/en curso/pendiente; lenguaje sereno, nada de "gamificación" agresiva del rato (streak sí, honorable).
- **Textarea con autoguardado:** indicador sutil ("Guardado hace un momento" / spinner), aviso ante fallo con texto preservado; placeholder pastoral en cada paso.
- **Modo lectura:** tamaño tipográfico y tema claro/oscuro desde `preferences`; modo específico de tipografía (line-height aumentado, medida de texto ~65ch) para las lecturas y guías.
- **Privacidad visible:** junto al campo del diario y en `/diario`: **"Solo tú puedes leer esto"** (innegociable en el diseño).
- **Accesibilidad (WCAG 2.2 AA):** foco visible, orden por teclado en pasos, labels de cada textarea, `aria-live` para el estado de autoguardado, contraste AA en ambos temas, áreas de toque ≥ 44 px en controles táctiles.
