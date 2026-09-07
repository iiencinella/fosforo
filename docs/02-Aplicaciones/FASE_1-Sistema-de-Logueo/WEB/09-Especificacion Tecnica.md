---
tags:
  - proyecto/fosforo
  - arquitectura
  - especificacion-tecnica
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Logueo]]"
---

# Especificación Tecnica - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Herramientas y tecnologias

- Plataforma: WEB (con futura extensión mobile via `@repo/mobile-auth-client`)
- Framework principal: Astro 6 (SSR) + React 19 (islands interactivos)
- Lenguaje principal: TypeScript 5
- Estilos: Tailwind CSS v4 + `@repo/ui` (componentes compartidos del ecosistema)
- Backend: Supabase Auth (autenticación) + PostgreSQL (datos de dominio con RLS)
- Testing: Vitest + React Testing Library
- Build: Turborepo (monorepo)

## Arquitectura tecnica

- **Patrón de arquitectura:** Astro 6 SSR para páginas y endpoints de API; React 19 islands para componentes interactivos (formularios de login, gestión de perfil, consentimientos, gestión de sesiones). Toda la lógica de autenticación se delega a Supabase Auth via `@repo/auth`.
- **Modulos principales:**
  - `src/apps/logueo/src/pages/api/auth/` — Endpoints de API de autenticación.
  - `src/apps/logueo/src/pages/auth/` — Páginas de autenticación (login, registro, reset password, perfil, consentimientos, sesiones).
  - `src/apps/logueo/src/components/` — Componentes UI de autenticación (LoginForm, RegisterForm, ProfileEditor, ConsentManager, SessionManager).
  - `src/apps/logueo/src/lib/roles.ts` — Utilidades de roles y permisos (mapeo de roles a capacidades por app).
- **Dependencias compartidas:**
  - `@repo/auth` — Wrapper de Supabase Auth para apps web del ecosistema (login, logout, sesión, refresh, perfil, roles).
  - `@repo/mobile-auth-client` — Cliente de autenticación para apps mobile.
  - `@repo/ui` — Componentes UI compartidos (Button, Input, Card, etc.).
  - `@repo/tailwind-config` — Tokens y estilos compartidos del ecosistema.

## Modelos de datos

- **Profile:** `user_id`, `display_name`, `avatar_url`, `preferences` (jsonb), `created_at`, `updated_at`. Tabla `profiles`, 1:1 con `auth.users`.
- **Role:** `user_id`, `role` (enum: admin, editor, revisor, dev, ops, usuario), `app` (text), `created_at`, `updated_at`. Tabla `roles`, N:1 con `profiles`.
- **Consent:** `user_id`, `category` (enum: marketing, analytics, third_party), `opted_in` (boolean), `updated_at`. Tabla `consents`, N:1 con `profiles`.
- **AuditLogEntry:** `id`, `user_id`, `action` (enum: login, logout, session_revoked, role_changed, sensitive_access), `ip` (inet), `user_agent`, `created_at`. Tabla `auth_audit_log`, solo INSERT.
- **Session:** Gestionado nativamente por Supabase Auth; no se replica en tablas de dominio.

## Endpoints (si aplica)

| Metodo | Ruta                      | Proposito                                                       |
| ------ | ------------------------- | --------------------------------------------------------------- |
| POST   | `/api/auth/login`         | Autenticar usuario con email/password o magic link.             |
| POST   | `/api/auth/logout`        | Cerrar sesión y revocar JWT.                                    |
| POST   | `/api/auth/register`      | Registrar nuevo usuario (crea perfil, rol y consentimientos).   |
| GET    | `/api/auth/me`            | Obtener perfil, rol y estado de sesión del usuario autenticado. |
| PUT    | `/api/auth/me`            | Actualizar perfil (nombre, avatar, preferencias).               |
| GET    | `/api/auth/consents`      | Listar consentimientos del usuario.                             |
| PUT    | `/api/auth/consents`      | Actualizar consentimientos (opt-in/opt-out por categoría).      |
| GET    | `/api/auth/sessions`      | Listar sesiones activas del usuario.                            |
| DELETE | `/api/auth/sessions/{id}` | Revocar sesión por ID (propia o ajena si es admin).             |

## Consideraciónes UI/UX

- **Navegación principal:** Páginas de auth (`/auth/login`, `/auth/register`, `/auth/reset`, `/auth/profile`, `/auth/consents`, `/auth/sessions`) accesibles desde cualquier app via redirect. Navegación con Astro View Transitions (ClientRouter) para transiciones fluidas.
- **Estados de interfaz:**
  - `loading`: Skeletons de `@repo/ui` durante verificación de sesión, carga de perfil o envío de formularios.
  - `empty`: Mensaje "No hay sesiones activas" en gestión de sesiones.
  - `error`: Mensajes de error con opción de reintento (credenciales inválidas, rate limit, error de red).
  - `expired`: Redirect a login con mensaje "Tu sesión ha expirado, por favor inicia sesión de nuevo."
  - `authenticated`: Interfaz completa con perfil, roles (si admin), consentimientos y sesiones.
- **Accesibilidad base:** Todos los formularios siguen WCAG 2.2 (labels, focus visible, navegación por teclado, ARIA en mensajes de error). Uso de `@repo/ui` para componentes accesibles. Hamburger nav en mobile según ecosistema UI/UX.
- **Responsive:** Mobile-first con Tailwind CSS v4; layouts adaptativos con breakpoints del ecosistema. Formularios de login y registro optimizados para touch.
- **Tema:** Soporte de tema claro/oscuro via `data-theme` del ecosistema Fósforo; uso de tokens de `@repo/ui`.
