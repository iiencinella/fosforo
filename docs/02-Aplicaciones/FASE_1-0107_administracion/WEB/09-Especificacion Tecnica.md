---
tags:
  - proyecto/fosforo
  - administracion
  - especificacion-tecnica
  - aplicacion
type: app-especificacion-tecnica
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[08-Decisiones de Arquitectura|Decisiones de Arquitectura Administracion]]"
---

# Especificacion Tecnica - 0107_administracion

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro 6.x SSR con islands React 19 (AdminNav, ThemeToggle)
- Lenguaje principal: TypeScript
- Herramientas de build: Turborepo + Vite (via Astro)
- Testing: Vitest (pendiente de implementacion)
- Base de datos: Supabase Postgres
- Autenticacion: Supabase Auth con cookie de sesion personalizada (`admin_session`, httpOnly)
- UI: CSS custom properties de `@repo/ui/foundation.css` + Tailwind CSS 4.x
- Despliegue: Vercel (adapter @astrojs/vercel, output server)

## Arquitectura tecnica

- Patron de arquitectura: server-rendered Astro SSR con frontmatter para consultas a Supabase; dos islands React (AdminNav, ThemeToggle) para interactividad del header; formularios y listados renderizados del lado servidor con post a API routes
- Modulos principales:
  - `src/apps/administracion/src/pages/admin/` - rutas protegidas del panel (dashboard, iglesias, horarios)
  - `src/apps/administracion/src/pages/api/` - API routes (auth, churches, schedules, dashboard)
  - `src/apps/administracion/src/components/` - AdminNav (React), ThemeToggle (React)
  - `src/apps/administracion/src/lib/` - auth.ts (sesion), admin-data.ts (metricas), validators.ts (Zod)
  - `src/apps/administracion/src/db/` - cliente Supabase + tipos TypeScript
- Dependencias compartidas: `@repo/ui` (foundation.css), `@repo/env` (variables de entorno), `@repo/api-utils` (jsonOk, jsonError, parseJsonBody)

## Modelos de datos

- `churches`: tabla maestra de iglesias con todos los datos de contacto y geolocalizacion
- `celebration_schedules`: horarios de celebraciones vinculados a iglesias (compartido con app Horarios)
- `admin_audit_log`: registro de auditoria de operaciones en el panel
- `admin_users`: usuarios habilitados con roles especificos del panel

## Endpoints (API)

| Metodo | Ruta                         | Proposito                              |
| ------ | ---------------------------- | -------------------------------------- |
| POST   | /api/auth/login              | Autenticar usuario y establecer sesion |
| POST   | /api/auth/logout             | Cerrar sesion y limpiar cookie         |
| GET    | /api/churches                | Listar iglesias (con busqueda por `q`) |
| POST   | /api/churches                | Crear nueva iglesia                    |
| GET    | /api/churches/[id]           | Obtener detalle de iglesia             |
| PUT    | /api/churches/[id]           | Actualizar iglesia                     |
| PATCH  | /api/churches/[id]           | Cambiar estado (activar/inactivar)     |
| GET    | /api/churches/[id]/schedules | Listar horarios de una iglesia         |
| POST   | /api/churches/[id]/schedules | Agregar horario a iglesia              |
| PUT    | /api/schedules/[id]          | Actualizar horario                     |
| DELETE | /api/schedules/[id]          | Eliminar horario                       |
| GET    | /api/dashboard/metrics       | Obtener metricas del dashboard         |

## Consideraciones UI/UX

- Navegacion principal: header superior con enlaces a modulos (Dashboard, Iglesias, Horarios). En mobile: menu hamburguesa desplegable con `aria-expanded`/`aria-controls` segun estandar del ecosistema.
- Estados de interfaz:
  - loading: skeleton loaders por modulo
  - empty: ilustracion + mensaje + CTA "Crear primera iglesia"
  - error: toast notification + opcion de reintentar
  - success: toast notification de confirmacion
- Accesibilidad base: formularios con labels asociados, navegacion por teclado, contraste suficiente, roles ARIA en componentes interactivos. Cumplimiento WCAG 2.1 nivel AA.
