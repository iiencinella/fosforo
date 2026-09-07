---
tags:
  - proyecto/fosforo
  - owasp
  - seguridad
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-owasp
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Logueo]]"
---

# OWASP - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SEC-AUTH-*`
- Plataforma: WEB (con futura extensión mobile)
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Baseline aplicable

- Web: OWASP Top 10 (2021) + ASVS.
- Mobile: OWASP MASVS/MSTG (para la futura extensión mobile con `@repo/mobile-auth-client`).
- Desktop: ASVS + hardening del framework (si aplica en el futuro).

## 3. Checklist de controles

| ID           | Control                                                                               | Estado    | Evidencia                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| SEC-AUTH-001 | Autenticación con Supabase Auth (no auth propio) — A02:2021 Cryptographic Failures    | Pendiente | `@repo/auth` delega a Supabase Auth; ver [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) ADR-AUTH-001 |
| SEC-AUTH-002 | Sesiones seguras con expiración — A07:2021 Identification and Authentication Failures | Pendiente | JWT con expiración 15 min + refresh token 7 días; cookies httpOnly + Secure + SameSite                                      |
| SEC-AUTH-003 | RLS en todas las tablas de dominio — A01:2021 Broken Access Control                   | Pendiente | RLS en `profiles`, `roles`, `consents`, `auth_audit_log`; tests automatizados en CI                                         |
| SEC-AUTH-004 | Rate limiting en login — A07:2021 Identification and Authentication Failures          | Pendiente | Máximo 5 intentos por minuto por IP; implementado en endpoint `/api/auth/login`                                             |
| SEC-AUTH-005 | Auditoría inmutable de accesos — A09:2021 Security Logging and Monitoring Failures    | Pendiente | `auth_audit_log` solo INSERT; ninguna política RLS permite UPDATE o DELETE                                                  |
| SEC-AUTH-006 | Validación y sanitización de entradas — A03:2021 Injection                            | Pendiente | Validación server-side en todos los endpoints; parámetros tipados en TypeScript; SQL via Supabase SDK (no SQL raw)          |
| SEC-AUTH-007 | Headers de seguridad — A05:2021 Security Misconfiguration                             | Pendiente | CSP, HSTS, X-Frame-Options, X-Content-Type-Options en Astro SSR; configuración de headers en middleware                     |
| SEC-AUTH-008 | Protección de datos sensibles — A02:2021 Cryptographic Failures                       | Pendiente | Tokens en cookies httpOnly; nunca en localStorage; transporte HTTPS obligatorio; passwords hasheadas por Supabase Auth      |
| SEC-AUTH-009 | Prevención de escalación de privilegios — A01:2021 Broken Access Control              | Pendiente | RLS bloquea escritura en `roles` para no admin; verificación server-side en cada operación                                  |
| SEC-AUTH-010 | MFA / 2FA — A07:2021 Identification and Authentication Failures                       | Pendiente | Post-MVP; no incluido en alcance del MVP; planificado para iteración post-MVP                                               |

## 4. Riesgo aceptado

- **Excepción:** Federación con proveedores externos (Google, Apple, GitHub) no se incluye en el MVP.
- **Justificación:** El MVP se enfoca en SSO interno con Supabase Auth (email/password + magic link). La federación externa añade complejidad de configuración, gestión de mapeo de identidades y superficie de ataque adicional. Se planifica post-MVP con evaluación de seguridad específica.
- **Aprobado por:** Iván Ezequiel Iencinella
- **Fecha:** 2026-09-05

- **Excepción:** MFA / 2FA no se incluye en el MVP.
- **Justificación:** El MVP prioriza SSO, roles, perfiles, consentimientos y auditoría. MFA requiere UX adicional (app authenticator, SMS, email OTP) y gestión de dispositivos. Se planifica post-MVP como mejora incremental de seguridad.
- **Aprobado por:** Iván Ezequiel Iencinella
- **Fecha:** 2026-09-05

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad    | Requisito relaciónado                 |
| ------------ | ------------------------------------- |
| SEC-AUTH-001 | FR-AUTH-001, NFR-AUTH-002             |
| SEC-AUTH-002 | NFR-AUTH-002, FR-AUTH-006             |
| SEC-AUTH-003 | NFR-AUTH-003                          |
| SEC-AUTH-004 | FR-AUTH-001                           |
| SEC-AUTH-005 | FR-AUTH-005                           |
| SEC-AUTH-006 | FR-AUTH-001, FR-AUTH-003, FR-AUTH-004 |
| SEC-AUTH-007 | NFR-AUTH-002                          |
| SEC-AUTH-008 | NFR-AUTH-002, NFR-AUTH-003            |
| SEC-AUTH-009 | FR-AUTH-002, NFR-AUTH-003             |
| SEC-AUTH-010 | NFR-AUTH-002 (post-MVP)               |
