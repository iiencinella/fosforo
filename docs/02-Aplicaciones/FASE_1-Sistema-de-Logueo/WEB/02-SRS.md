---
tags:
  - proyecto/fosforo
  - srs
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-srs
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Logueo]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso|SRS Identidad y Acceso]]"
---

# SRS - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `FR-AUTH-*`, `NFR-AUTH-*`, `IR-AUTH-*`, `CA-AUTH-*`
- Plataforma: WEB (con futura extensión mobile)
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Proposito y alcance tecnico

El Sistema de Logueo provee la capacidad de identidad y acceso del ecosistema Fósforo. Implementa SSO basado en Supabase Auth, gestión de roles y permisos con RLS, perfiles de usuario compartidos, consentimientos de privacidad, auditoría de accesos y gestión de sesiones. Es la capa base que consumen todas las apps autenticadas via el paquete `@repo/auth`.

El alcance técnico del MVP incluye: autenticación con email/password y magic link, roles base con permisos por app, perfiles de usuario con preferencias, consentimientos opt-in/opt-out, auditoría inmutable de accesos, gestión de sesiones con revocación, y una API REST para que las apps consumidoras obtengan información de sesión y usuario.

## 3. Actores

- **Usuario final:** Persona que inicia sesión, gestiona su perfil y consentimientos, y accede a las apps del ecosistema.
- **Administrador:** Usuario con rol `admin` que gestiona roles de otros usuarios, revisa auditoría de accesos y administra consentimientos a nivel de plataforma.
- **App consumidora (sistema):** Cualquier app del ecosistema que integra `@repo/auth` para validar sesión, obtener el rol del usuario y verificar permisos via RLS.
- **Supabase Auth:** Servicio externo que gestiona la autenticación (emisión de JWT, refresh tokens, verificación de credenciales).

## 4. Requisitos funcionales

| ID          | Requisito                                                                  | Criterio verificable                                                                                                                                                         |
| ----------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-AUTH-001 | SSO con Supabase Auth: autenticación con email/password y magic link       | Un usuario puede iniciar sesión con email/password o magic link; al autenticarse recibe un JWT válido para todas las apps del ecosistema sin re-autenticación.               |
| FR-AUTH-002 | Roles base con permisos por app: admin, editor, revisor, dev, ops, usuario | Cada usuario tiene asignado un rol; las apps consumidoras pueden consultar el rol via `GET /api/auth/me` y RLS bloquea operaciones no autorizadas según el rol.              |
| FR-AUTH-003 | Perfil de usuario: datos básicos (nombre, email, avatar) + preferencias    | Un usuario autenticado puede ver y editar su perfil via `GET /api/auth/me` y `PUT /api/auth/me`; las preferencias están disponibles para servicios consumidores.             |
| FR-AUTH-004 | Consentimientos: opt-in/opt-out por categoría (marketing, analítica, etc.) | Un usuario puede aceptar o rechazar consentimientos por categoría via `GET /api/auth/consents` y `PUT /api/auth/consents`; los consentimientos se persisten con timestamp.   |
| FR-AUTH-005 | Auditoría de accesos: registro de login, logout y operaciones sensibles    | Cada login, logout y acceso a operación sensible genera un registro inmutable en `auth_audit_log` con user_id, action, IP, user_agent y timestamp.                           |
| FR-AUTH-006 | Gestión de sesiones: revocación y expiración                               | Un usuario puede ver sus sesiones activas via `GET /api/auth/sessions` y revocarlas via `DELETE /api/auth/sessions/{id}`; el admin puede revocar sesiones de otros usuarios. |
| FR-AUTH-007 | API de información de usuario: `GET /api/auth/me`                          | Las apps consumidoras pueden obtener el perfil, rol y estado de sesión del usuario autenticado via `GET /api/auth/me` sin acceso directo a la base de datos.                 |
| FR-AUTH-008 | Integración RUM: pageviews y eventos de auth enviados a app Log            | Los eventos de autenticación (login, logout, sesión expirada) se envían a la app Log para observabilidad y detección de anomalías.                                           |

## 5. Requisitos no funcionales

| ID           | Requisito                          | Objetivo                                                                                                                                                           |
| ------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFR-AUTH-001 | Rendimiento de autenticación       | p95 de login < 500ms (desde envío de credenciales hasta recepción de JWT válido).                                                                                  |
| NFR-AUTH-002 | Seguridad de tokens                | JWT con expiración corta (15 min) + refresh token con expiración configurable; tokens firmados por Supabase Auth; transporte siempre over HTTPS.                   |
| NFR-AUTH-003 | RLS en todas las tablas de dominio | Todas las tablas (`profiles`, `roles`, `consents`, `auth_audit_log`) tienen RLS habilitado; un usuario solo puede leer/escribir sus propios datos (excepto admin). |
| NFR-AUTH-004 | Sesiones cross-app                 | Una vez autenticado, el usuario accede a todas las apps del ecosistema sin re-autenticación; el JWT es válido en todas las apps que consumen `@repo/auth`.         |
| NFR-AUTH-005 | Disponibilidad                     | 99.95% de disponibilidad del servicio de autenticación (dependencia de Supabase Auth SLA).                                                                         |

## 6. Integraciónes

| ID          | Integración                         | Contrato                         | Version |
| ----------- | ----------------------------------- | -------------------------------- | ------- |
| IR-AUTH-001 | Supabase Auth                       | SDK de Supabase Auth + JWT       | v2      |
| IR-AUTH-002 | App Log (RUM/auditoría)             | Eventos de auth enviados via API | v1      |
| IR-AUTH-003 | Apps consumidoras via API           | REST API (`/api/auth/*`)         | v1      |
| IR-AUTH-004 | `@repo/auth` (paquete compartido)   | API TypeScript exportada         | v1      |
| IR-AUTH-005 | `@repo/mobile-auth-client` (mobile) | API TypeScript exportada         | v1      |

## 7. Criterios de aceptación

| ID          | Criterio                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-AUTH-001 | Un usuario inicia sesión una vez y accede a todas las apps del ecosistema sin re-autenticación.                                             |
| CA-AUTH-002 | Un usuario con rol insuficiente es bloqueado al intentar una operación restringida; el bloqueo se verifica server-side via RLS.             |
| CA-AUTH-003 | Al cerrar sesión, la sesión se revoca en todas las apps del ecosistema.                                                                     |
| CA-AUTH-004 | Las preferencias del perfil de usuario están disponibles para los servicios consumidores del ecosistema.                                    |
| CA-AUTH-005 | Cada login, logout y operación sensible genera un registro inmutable en `auth_audit_log`.                                                   |
| CA-AUTH-006 | Un usuario puede gestionar sus consentimientos (opt-in/opt-out) por categoría y estos se persisten con timestamp.                           |
| CA-AUTH-007 | El p95 de autenticación es menor a 500ms en condiciones normales.                                                                           |
| CA-AUTH-008 | Todas las tablas de dominio (`profiles`, `roles`, `consents`, `auth_audit_log`) tienen RLS habilitado y verificado con tests automatizados. |

## 8. Trazabilidad PRD -> SRS

| PRD          | SRS          |
| ------------ | ------------ |
| PRD-AUTH-001 | FR-AUTH-001  |
| PRD-AUTH-002 | FR-AUTH-002  |
| PRD-AUTH-003 | FR-AUTH-003  |
| PRD-AUTH-004 | FR-AUTH-004  |
| PRD-AUTH-005 | FR-AUTH-005  |
| PRD-AUTH-006 | FR-AUTH-008  |
| PRD-AUTH-001 | NFR-AUTH-001 |
| PRD-AUTH-001 | NFR-AUTH-004 |
