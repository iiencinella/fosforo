---
tags:
  - proyecto/fosforo
  - frd
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-frd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Logueo]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `RB-AUTH-*`, `UC-AUTH-*`
- Plataforma: WEB (con futura extensión mobile)
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Casos de uso

| ID          | Caso de uso               | Flujo principal                                                                                                         | Excepciones                                                                                  |
| ----------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| UC-AUTH-001 | Iniciar sesión            | Usuario ingresa email + password (o solicita magic link) → Supabase Auth valida → JWT emitido → sesión cross-app activa | Credenciales inválidas → error 401; cuenta no confirmada → error 403; rate limit → error 429 |
| UC-AUTH-002 | Cerrar sesión             | Usuario solicita logout → sesión revocada en Supabase Auth → JWT invalidado → redirect a login                          | Sesión ya expirada → redirect directo a login                                                |
| UC-AUTH-003 | Registrarse               | Usuario ingresa email + password → Supabase Auth crea cuenta → email de confirmación → perfil inicial creado            | Email ya registrado → error 409; email inválido → error 422                                  |
| UC-AUTH-004 | Recuperar contraseña      | Usuario ingresa email → Supabase Auth envía email de reset → usuario setea nueva contraseña → login exitoso             | Email no registrado → error 404; token de reset expirado → error 410                         |
| UC-AUTH-005 | Ver perfil                | Usuario autenticado → `GET /api/auth/me` → respuesta con perfil, rol y preferencias                                     | Sesión expirada → error 401; perfil no encontrado → error 404                                |
| UC-AUTH-006 | Editar perfil             | Usuario modifica nombre, avatar o preferencias → `PUT /api/auth/me` → perfil actualizado                                | Validación de campos → error 422; RLS bloquea edición de otro perfil → error 403             |
| UC-AUTH-007 | Gestionar consentimientos | Usuario lista consentimientos → `GET /api/auth/consents` → opt-in/opt-out por categoría → `PUT /api/auth/consents`      | Categoría inválida → error 422                                                               |
| UC-AUTH-008 | Gestionar roles (admin)   | Admin lista usuarios → asigna/cambia rol → RLS actualizado → usuario accede o es bloqueado según nuevo rol              | Usuario no admin → error 403; rol inválido → error 422                                       |
| UC-AUTH-009 | Revocar sesión            | Usuario lista sesiones activas → `GET /api/auth/sessions` → revoca via `DELETE /api/auth/sessions/{id}`                 | Sesión no pertenece al usuario (no admin) → error 403; sesión no encontrada → error 404      |
| UC-AUTH-010 | Auditar accesos (admin)   | Admin consulta `auth_audit_log` → filtra por usuario, acción o fecha → obtiene registro inmutable de accesos            | Usuario no admin → error 403                                                                 |

## 3. Reglas de negocio

| ID          | Regla                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RB-AUTH-001 | La sesión es válida cross-app mediante JWT; todas las apps que consumen `@repo/auth` reconocen el mismo token sin re-autenticación.                    |
| RB-AUTH-002 | El refresh token tiene expiración configurable (default: 7 días); al expirar, el usuario debe re-autenticarse.                                         |
| RB-AUTH-003 | Los roles se verifican server-side via RLS en PostgreSQL; el cliente nunca tiene autorización implícita por UI.                                        |
| RB-AUTH-004 | Los consentimientos son obligatorios para marketing y analítica; un usuario puede retirar su consentimiento en cualquier momento.                      |
| RB-AUTH-005 | La auditoría de accesos es inmutable: los registros en `auth_audit_log` solo se insertan, nunca se actualizan ni eliminan.                             |
| RB-AUTH-006 | El rol `admin` puede gestionar roles de otros usuarios y revocar sesiones ajenas; el resto de roles solo gestionan su propio perfil y consentimientos. |
| RB-AUTH-007 | Un usuario nuevo se registra con rol `usuario` por defecto; solo un admin puede escalar el rol.                                                        |

## 4. Validaciónes y errores esperados

| Contexto               | Validación                                     | Error                             |
| ---------------------- | ---------------------------------------------- | --------------------------------- |
| Login (email/password) | Email válido + password >= 8 caracteres        | 422 Unprocessable Entity          |
| Login (credenciales)   | Credenciales correctas en Supabase Auth        | 401 Unauthorized                  |
| Login (rate limit)     | Máximo 5 intentos por minuto por IP            | 429 Too Many Requests             |
| Registro               | Email no duplicado + formato válido            | 409 Conflict / 422 Unprocessable  |
| Perfil (edición)       | Nombre no vacío, avatar URL válida             | 422 Unprocessable Entity          |
| Consentimientos        | Categoría válida dentro de las soportadas      | 422 Unprocessable Entity          |
| Roles (asignación)     | Rol válido dentro del enum + permiso de admin  | 422 Unprocessable / 403 Forbidden |
| Sesiones (revocación)  | Sesión pertenece al usuario o usuario es admin | 403 Forbidden / 404 Not Found     |
| Token expirado         | JWT expirado en cualquier endpoint             | 401 Unauthorized                  |

## 5. Estados funcionales

- Estado `authenticated`: usuario con sesión válida; puede acceder a apps, editar perfil, gestionar consentimientos y sesiones.
- Estado `unauthenticated`: sin sesión o sesión expirada; redirect a login.
- Estado `loading`: autenticación en curso (verificando JWT, refrescando token); mostrar skeleton.
- Estado `error`: falla de autenticación (credenciales inválidas, rate limit, error de red); mostrar mensaje de error con opción de reintento.
- Estado `expired`: sesión expirada; redirect a login con mensaje "Tu sesión ha expirado, por favor inicia sesión de nuevo."

## 6. Trazabilidad FRD -> SRS

| FRD         | SRS          |
| ----------- | ------------ |
| RB-AUTH-001 | FR-AUTH-001  |
| RB-AUTH-002 | NFR-AUTH-002 |
| RB-AUTH-003 | NFR-AUTH-003 |
| RB-AUTH-004 | FR-AUTH-004  |
| RB-AUTH-005 | FR-AUTH-005  |
| RB-AUTH-006 | FR-AUTH-002  |
| RB-AUTH-007 | FR-AUTH-002  |
| UC-AUTH-001 | FR-AUTH-001  |
| UC-AUTH-002 | FR-AUTH-006  |
| UC-AUTH-003 | FR-AUTH-001  |
| UC-AUTH-004 | FR-AUTH-001  |
| UC-AUTH-005 | FR-AUTH-003  |
| UC-AUTH-006 | FR-AUTH-003  |
| UC-AUTH-007 | FR-AUTH-004  |
| UC-AUTH-008 | FR-AUTH-002  |
| UC-AUTH-009 | FR-AUTH-006  |
| UC-AUTH-010 | FR-AUTH-005  |
