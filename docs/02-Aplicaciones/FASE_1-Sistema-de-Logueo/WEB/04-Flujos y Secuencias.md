---
tags:
  - proyecto/fosforo
  - arquitectura
  - flujos
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

# Flujos y Secuencias - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Objetivo

Describir como interactua el usuario y el sistema con las funcionalidades principales del Sistema de Logueo, detallando los flujos de autenticación, gestión de roles, sesiones y auditoría.

## Flujo principal

1. Usuario accede a cualquier app del ecosistema Fósforo.
2. La app verifica si hay sesión válida via `@repo/auth` (JWT en cookies/httpOnly).
3. Si no hay sesión, redirect a la página de login del Sistema de Logueo.
4. Usuario ingresa credenciales (email/password) o solicita magic link.
5. Supabase Auth valida las credenciales y emite un JWT + refresh token.
6. El JWT se almacena en cookies httpOnly y es válido para todas las apps del ecosistema.
7. El perfil del usuario (`profiles`) y el rol (`roles`) se cargan via `GET /api/auth/me`.
8. El evento de login se registra en `auth_audit_log` y se envía a la app Log (RUM).
9. Usuario accede a la app con su rol y permisos aplicados via RLS.

## Flujos secundarios

- **Flujo A — Gestión de roles (admin):** Admin lista usuarios → asigna/cambia rol → RLS actualizado en `roles` → el usuario afectado accede o es bloqueado según su nuevo rol en la próxima request.
- **Flujo B — Revocación de sesión:** Usuario lista sesiones activas (`GET /api/auth/sessions`) → revoca una sesión (`DELETE /api/auth/sessions/{id}`) → sesión invalidada en Supabase Auth → JWT revocado → redirect a login si era la sesión actual.
- **Flujo C — Gestión de consentimientos:** Usuario accede a preferencias → lista consentimientos (`GET /api/auth/consents`) → cambia opt-in/opt-out por categoría (`PUT /api/auth/consents`) → `consents` actualizado con timestamp.
- **Flujo D — Auditoría de accesos (admin):** Admin accede al panel de auditoría → consulta `auth_audit_log` filtrando por usuario, acción o fecha → obtiene registro inmutable de accesos.

## Secuencias clave

### Secuencia 1 - Login con magic link

1. Usuario: Ingresa su email en el formulario de login y selecciona "Enviar magic link".
2. Sistema: Valida el formato del email y envía la solicitud a Supabase Auth (`signInWithOtp`).
3. Supabase Auth: Genera un token de un solo uso y envía un email con el enlace mágico.
4. Sistema: Muestra mensaje "Revisa tu email para completar el login."
5. Usuario: Hace clic en el enlace del email.
6. Supabase Auth: Verifica el token, emite JWT + refresh token y redirige al usuario a la app.
7. Sistema: Almacena el JWT en cookies httpOnly, carga perfil y rol via `GET /api/auth/me`.
8. Sistema: Registra evento de login en `auth_audit_log` y envía evento a app Log (RUM).
9. Sistema: Redirige al usuario a la app solicitada con sesión activa.

### Secuencia 2 - Refresh token

1. App consumidora: Detecta que el JWT está próximo a expirar (menos de 1 minuto de validez).
2. App consumidora: Llama a `@repo/auth` para refrescar la sesión usando el refresh token.
3. Supabase Auth: Verifica el refresh token, emite un nuevo JWT + refresh token.
4. Sistema: Actualiza las cookies httpOnly con los nuevos tokens.
5. App consumidora: Continúa la operación con el nuevo JWT sin interrumpir al usuario.
6. Sistema: Si el refresh token ha expirado, se redirige al usuario al login (estado `expired`).

### Secuencia 3 - Revocar sesión

1. Usuario: Accede a la página de gestión de sesiones y lista sus sesiones activas (`GET /api/auth/sessions`).
2. Sistema: Consulta las sesiones activas en Supabase Auth para el usuario autenticado.
3. Sistema: Devuelve la lista de sesiones con dispositivo, IP aproximada y última actividad.
4. Usuario: Selecciona una sesión y solicita revocarla (`DELETE /api/auth/sessions/{id}`).
5. Sistema: Verifica que la sesión pertenece al usuario (o que es admin) y la revoca en Supabase Auth.
6. Sistema: Registra el evento de revocación en `auth_audit_log`.
7. Sistema: Si era la sesión actual, redirige al login; si no, devuelve 200 OK.

### Secuencia 4 - Registro de nuevo usuario

1. Usuario: Accede a la página de registro e ingresa email + password.
2. Sistema: Valida el formato del email y que la password cumpla los requisitos (>= 8 caracteres).
3. Supabase Auth: Crea la cuenta con `signUp`; envía email de confirmación.
4. Sistema: Crea un registro inicial en `profiles` con `display_name` derivado del email y preferencias por defecto.
5. Sistema: Crea un registro en `roles` con rol `usuario` por defecto.
6. Sistema: Crea registros de consentimientos en `consents` con `opted_in: false` para marketing y analítica.
7. Usuario: Confirma su email haciendo clic en el enlace de confirmación.
8. Supabase Auth: Confirma la cuenta; el usuario puede ahora iniciar sesión.
9. Sistema: Registra el evento de registro en `auth_audit_log` y envía evento a app Log (RUM).
