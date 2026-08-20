---
tags:
  - proyecto/fosforo
  - usuarios
  - owasp
  - seguridad
  - aplicación
type: app-owasp
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
---

# OWASP - 0104_usuarios

## 1. Ficha

- ID base: `SEC-0104-USUARIOS-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-05-25

## 2. Baseline aplicable

- Web: OWASP Top 10 + ASVS nivel 1 (aplicación crítica por manejo de credenciales y datos personales).
- Mobile: OWASP MASVS/MSTG (para endpoints consumidos por `@repo/mobile-auth-client`).
- Desktop: ASVS + hardening del framework.

## 3. Checklist de controles

| ID                    | Control                                                                                                                            | Estado       | Evidencia                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| SEC-0104-USUARIOS-001 | Autenticación y sesión seguras: JWT firmado, httpOnly cookies, expiración configurable, refresh tokens.                            | Implementado | `src/packages/auth/src/cookies.ts`, endpoints de auth.                    |
| SEC-0104-USUARIOS-002 | Autorización por rol/recurso: validación de permisos en backend (UserService + RLS), no solo en frontend.                          | Implementado | `requireAdminSession`, `requireAppPermission`, migración RBAC.            |
| SEC-0104-USUARIOS-003 | Validación y sanitización de entradas: Zod en endpoints, validación server-side en todos los formularios.                          | Implementado | Schemas de auth/admin/profile y tests unitarios.                          |
| SEC-0104-USUARIOS-004 | Protección de datos sensibles: no almacenar contraseñas en tablas propias (delegado a Supabase Auth), cifrado en tránsito (HTTPS). | Pendiente    | Cumplimiento por diseño (ADR-0104-USUARIOS-001).                          |
| SEC-0104-USUARIOS-005 | Logging y auditoría de seguridad: registro de login, logout, cambios de rol, accesos denegados en audit_log (append-only).         | Parcial      | Auditoría de registro y roles; faltan eventos completos de login/logout.  |
| SEC-0104-USUARIOS-006 | Rate limiting y anti-abuso: protección contra fuerza bruta en login y registro, límite por IP.                                     | Pendiente    | Requiere implementar rate limiting distribuido en auth.                   |
| SEC-0104-USUARIOS-007 | Manejo de sesiones entre apps (SSO): validación de JWT en cada app, verificación de firma y expiración.                            | Parcial      | JWT y cookies implementados; falta validar staging multi-subdominio.      |
| SEC-0104-USUARIOS-008 | Seguridad en recuperación de contraseña: enlace de un solo uso con expiración (15 min), enviado solo al email registrado.          | Parcial      | Flujo Supabase implementado; expiración/plantillas se configuran en Auth. |
| SEC-0104-USUARIOS-009 | RLS en tablas de usuarios: políticas de acceso row-level para profiles, roles, permissions y audit_log.                            | Implementado | Migración base y `20260820002000_harden_users_rbac.sql`.                  |

## 4. Riesgo aceptado

- Excepcion: El sistema delega el hashing de contraseñas y la confirmación de email a Supabase Auth, lo que implica confiar en la implementación de seguridad de un tercero.
- Justificación: Supabase Auth es un servicio maduro que sigue prácticas de seguridad estándar de la industria. Implementar hashing y gestión de credenciales propio introduciría mayor riesgo que beneficio en MVP.
- Aprobado por: Iván Ezequiel Iencinella
- Fecha: 2026-05-25

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad             | Requisito relaciónado                                            |
| --------------------- | ---------------------------------------------------------------- |
| SEC-0104-USUARIOS-001 | NFR-0104-USUARIOS-003                                            |
| SEC-0104-USUARIOS-002 | FR-0104-USUARIOS-007, FR-0104-USUARIOS-009, FR-0104-USUARIOS-011 |
| SEC-0104-USUARIOS-003 | NFR-0104-USUARIOS-003                                            |
| SEC-0104-USUARIOS-005 | FR-0104-USUARIOS-010                                             |
| SEC-0104-USUARIOS-007 | FR-0104-USUARIOS-005                                             |
| SEC-0104-USUARIOS-009 | FR-0104-USUARIOS-007, FR-0104-USUARIOS-009                       |
