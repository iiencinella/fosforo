---
tags:
  - proyecto/fosforo
  - arquitectura
  - especificacion-tecnica
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
---

# Especificación Tecnica - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro 6 (SSR) + React 19 (islands interactivos para panel de plantillas y preferencias)
- Lenguaje principal: TypeScript 5
- Estilos: Tailwind CSS v4 + `@repo/ui` (componentes compartidos del ecosistema)
- Backend: Supabase (PostgreSQL con RLS, Auth, Edge Functions para envíos async)
- Proveedor de email: SMTP/Resend (configurable via Edge Functions)
- Push: Web Push API (push web en MVP; FCM/APNs post-MVP)
- In-app: Notificaciones renderizadas en la UI del ecosistema via `@repo/ui`
- Testing: Vitest + React Testing Library
- Build: Turborepo (monorepo)

## Arquitectura tecnica

- **Patrón de arquitectura:** Astro 6 SSR para páginas y endpoints de API; React 19 islands para componentes interactivos (panel de plantillas, editor de preferencias, vista de trazabilidad). Los envíos se procesan de forma asíncrona en Supabase Edge Functions que consumen `notification_queue`.
- **Modulos principales:**
  - `src/apps/notificaciones/src/pages/api/` — Endpoints de API de notificaciones.
  - `src/apps/notificaciones/src/lib/templates.ts` — Lógica de plantillas (creación, versionado, renderizado con Mustache/Handlebars).
  - `src/apps/notificaciones/src/lib/queue.ts` — Lógica de cola (encolado, reintentos, backoff exponencial, estados).
  - `src/apps/notificaciones/src/lib/preferences.ts` — Lógica de preferencias (consulta, actualización, validación de opt-in/opt-out).
  - `src/apps/notificaciones/src/lib/idempotency.ts` — Lógica de idempotencia por `event_id`.
  - `src/apps/notificaciones/src/components/` — Componentes UI (TemplateEditor, PreferencesManager, TraceabilityViewer).
  - `src/packages/notification-core/` — SDK compartido para apps consumidoras (cliente HTTP para `POST /api/notifications`, tipos, helpers).
  - Supabase Edge Functions — Workers que procesan `notification_queue` y envían por canal (email, push, in-app).
- **Dependencias compartidas:**
  - `@repo/auth` — Validación de identidad y permisos (Sistema de Logueo).
  - `@repo/notification-core` — SDK compartido para apps consumidoras (client HTTP, tipos, helpers).
  - `@repo/ui` — Componentes UI compartidos (Button, Input, Card, Table, Skeleton, etc.).
  - `@repo/tailwind-config` — Tokens y estilos compartidos del ecosistema.

## Modelos de datos

- **NotificationTemplate:** `id`, `name`, `version`, `channel`, `subject`, `body`, `variables` (jsonb), `status` (draft/published/archived), `created_by`, `created_at`, `published_at`. Tabla `notification_templates`, versiones inmutables tras publicación.
- **NotificationEvent:** `id`, `event_id`, `template_id`, `channel`, `recipient`, `category`, `status` (pending/sent/delivered/failed/opened), `payload` (jsonb), `error_message`, `attempts`, `created_at`, `sent_at`, `delivered_at`, `opened_at`. Tabla `notification_events`, `event_id` UNIQUE para idempotencia.
- **NotificationPreference:** `user_id`, `channel`, `category`, `opted_in`, `updated_at`. Tabla `notification_preferences`, PK compuesta (`user_id`, `channel`, `category`), RLS por `user_id`.
- **NotificationQueueItem:** `id`, `event_id`, `status` (pending/processing/retrying/done), `attempts`, `next_retry_at`, `created_at`. Tabla `notification_queue`, procesada por Edge Functions.

## Endpoints (si aplica)

| Metodo | Ruta                                       | Proposito                                                                 |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------- |
| POST   | `/api/notifications`                       | Disparar una notificación (encola y procesa). Retorna 202 con `event_id`. |
| GET    | `/api/notifications/preferences/{user_id}` | Obtener preferencias del usuario por canal y categoría.                   |
| PUT    | `/api/notifications/preferences/{user_id}` | Actualizar preferencias (opt-in/opt-out por canal y categoría).           |
| GET    | `/api/notifications/templates`             | Listar plantillas publicadas (apps consumidoras) o todas (editor/admin).  |
| POST   | `/api/notifications/templates`             | Crear o versionar una plantilla (solo editor/admin).                      |
| GET    | `/api/notifications/events/{event_id}`     | Consultar trazabilidad de un evento por `event_id` (editor/admin).        |
| GET    | `/api/notifications/events`                | Listar eventos con filtros (estado, canal, destinatario) (editor/admin).  |

## Consideraciónes UI/UX

- **Navegación principal:** Panel de administración en `/admin/notificaciones` con tabs para Plantillas, Trazabilidad y Preferencias. Acceso restringido a roles `editor` y `admin`. Vista de preferencias de usuario en `/notificaciones/preferences` accesible para cualquier usuario autenticado.
- **Estados de interfaz:**
  - `loading`: Skeletons de `@repo/ui` durante carga de plantillas, preferencias o trazabilidad.
  - `empty`: Mensaje "No hay plantillas publicadas" / "No hay eventos de notificación" / "No hay preferencias configuradas".
  - `error`: Mensajes de error con opción de reintento (fallo de validación, error de red, proveedor de canal caído).
  - `success`: Confirmación de plantilla publicada, preferencias guardadas, mensaje encolado.
  - `pending`: Indicador de estado del mensaje en la vista de trazabilidad (pendiente, enviado, entregado, fallido, abierto).
- **Accesibilidad base:** Todos los formularios siguen WCAG 2.2 (labels, focus visible, navegación por teclado, ARIA en mensajes de error). Uso de `@repo/ui` para componentes accesibles. Hamburger nav en mobile según ecosistema UI/UX.
- **Responsive:** Mobile-first con Tailwind CSS v4; layouts adaptativos con breakpoints del ecosistema. Panel de administración optimizado para desktop; vista de preferencias optimizada para touch.
- **Tema:** Soporte de tema claro/oscuro via `data-theme` del ecosistema Fósforo; uso de tokens de `@repo/ui`.
- **Skeletons:** Carga de plantillas, preferencias y trazabilidad muestra skeletons de `@repo/ui` según el ecosistema UI/UX.
