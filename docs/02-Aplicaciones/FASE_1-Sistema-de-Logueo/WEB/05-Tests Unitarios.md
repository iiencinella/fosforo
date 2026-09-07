---
tags:
  - proyecto/fosforo
  - tests
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-tests
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Logueo]]"
---

# Tests Unitarios - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `TC-AUTH-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Estrategia

- **Framework:** Vitest + React Testing Library para componentes; Vitest para lógica de `@repo/auth` y utilidades.
- **Alcance unitario:** Lógica de autenticación (`@repo/auth`), validación de roles, gestión de consentimientos, serialización de perfiles, endpoints de API (`/api/auth/*`), y reglas RLS de PostgreSQL.
- **Exclusiones justificadas:** Supabase Auth como servicio externo se mockea en tests unitarios; se cubre con tests de integración en entorno de staging. La app Log (RUM) se prueba en su propio conjunto de tests.
- **Cobertura de RLS:** Tests automatizados que verifican que cada política RLS bloquea/permite correctamente por rol y por usuario.

## 3. Matriz de pruebas

| ID          | Requisito trazado | Tipo        | Descripción                                                            | Estado    |
| ----------- | ----------------- | ----------- | ---------------------------------------------------------------------- | --------- |
| TC-AUTH-001 | FR-AUTH-001       | Unitario    | Login con email/password válido emite JWT y crea sesión.               | Pendiente |
| TC-AUTH-002 | FR-AUTH-001       | Unitario    | Login con email/password inválido retorna 401.                         | Pendiente |
| TC-AUTH-003 | FR-AUTH-001       | Unitario    | Login con magic link envía email y completa al hacer clic.             | Pendiente |
| TC-AUTH-004 | FR-AUTH-001       | Unitario    | Rate limit en login bloquea tras 5 intentos por minuto por IP.         | Pendiente |
| TC-AUTH-005 | FR-AUTH-002       | Unitario    | Rol `admin` puede gestionar roles de otros usuarios.                   | Pendiente |
| TC-AUTH-006 | FR-AUTH-002       | Unitario    | Rol `usuario` no puede gestionar roles de otros usuarios (403).        | Pendiente |
| TC-AUTH-007 | FR-AUTH-002       | Integración | RLS bloquea escritura en `roles` para usuarios no admin.               | Pendiente |
| TC-AUTH-008 | FR-AUTH-003       | Unitario    | `GET /api/auth/me` retorna perfil, rol y preferencias del usuario.     | Pendiente |
| TC-AUTH-009 | FR-AUTH-003       | Unitario    | `PUT /api/auth/me` actualiza nombre, avatar y preferencias.            | Pendiente |
| TC-AUTH-010 | FR-AUTH-003       | Integración | RLS bloquea lectura de perfiles ajenos para usuarios no admin.         | Pendiente |
| TC-AUTH-011 | FR-AUTH-004       | Unitario    | `GET /api/auth/consents` lista consentimientos del usuario.            | Pendiente |
| TC-AUTH-012 | FR-AUTH-004       | Unitario    | `PUT /api/auth/consents` actualiza opt-in/opt-out por categoría.       | Pendiente |
| TC-AUTH-013 | FR-AUTH-004       | Integración | RLS bloquea gestión de consentimientos ajenos.                         | Pendiente |
| TC-AUTH-014 | FR-AUTH-005       | Integración | Login genera registro inmutable en `auth_audit_log`.                   | Pendiente |
| TC-AUTH-015 | FR-AUTH-005       | Integración | Logout genera registro inmutable en `auth_audit_log`.                  | Pendiente |
| TC-AUTH-016 | FR-AUTH-005       | Integración | `auth_audit_log` no permite UPDATE ni DELETE (solo INSERT).            | Pendiente |
| TC-AUTH-017 | FR-AUTH-006       | Unitario    | `GET /api/auth/sessions` lista sesiones activas del usuario.           | Pendiente |
| TC-AUTH-018 | FR-AUTH-006       | Unitario    | `DELETE /api/auth/sessions/{id}` revoca sesión propia.                 | Pendiente |
| TC-AUTH-019 | FR-AUTH-006       | Unitario    | `DELETE /api/auth/sessions/{id}` revoca sesión ajena si es admin.      | Pendiente |
| TC-AUTH-020 | FR-AUTH-006       | Unitario    | Revocación de sesión ajena sin rol admin retorna 403.                  | Pendiente |
| TC-AUTH-021 | FR-AUTH-007       | Unitario    | `GET /api/auth/me` retorna 401 si no hay sesión válida.                | Pendiente |
| TC-AUTH-022 | FR-AUTH-008       | Integración | Evento de login se envía a app Log (RUM).                              | Pendiente |
| TC-AUTH-023 | FR-AUTH-008       | Integración | Evento de logout se envía a app Log (RUM).                             | Pendiente |
| TC-AUTH-024 | NFR-AUTH-001      | Integración | p95 de login < 500ms en condiciones normales.                          | Pendiente |
| TC-AUTH-025 | NFR-AUTH-002      | Unitario    | JWT expira en 15 minutos; refresh token funciona correctamente.        | Pendiente |
| TC-AUTH-026 | NFR-AUTH-003      | Integración | RLS en `profiles` permite solo lectura del propio perfil.              | Pendiente |
| TC-AUTH-027 | NFR-AUTH-003      | Integración | RLS en `roles` permite escritura solo a admin.                         | Pendiente |
| TC-AUTH-028 | NFR-AUTH-003      | Integración | RLS en `consents` permite gestión solo de los propios consentimientos. | Pendiente |
| TC-AUTH-029 | NFR-AUTH-004      | Integración | Sesión válida cross-app: JWT emitido por una app es válido en otra.    | Pendiente |

## 4. Cobertura objetivo

- **Cobertura global:** >= 85%
- **Módulos críticos (auth, RLS, roles, sesiones):** >= 95%

## 5. Criterios de aprobación

- [ ] Tests unitarios críticos (TC-AUTH-001 a TC-AUTH-020) en verde.
- [ ] Tests de integración de RLS (TC-AUTH-007, TC-AUTH-010, TC-AUTH-013, TC-AUTH-016, TC-AUTH-026 a TC-AUTH-029) en verde.
- [ ] Cobertura global >= 85% alcanzada.
- [ ] Cobertura de módulos críticos >= 95% alcanzada.
- [ ] Trazabilidad FR → TC actualizada en la matriz.
- [ ] p95 de login verificado en entorno de staging (< 500ms).
