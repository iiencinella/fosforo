---
tags:
  - proyecto/fosforo
  - arquitectura
  - decisiones
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

# Decisiones de Arquitectura - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto

- Plataforma objetivo: WEB (con futura extensión mobile via `@repo/mobile-auth-client`).
- Alcance de esta decision: Arquitectura de identidad y acceso del ecosistema Fósforo, incluyendo autenticación, sesiones, roles, perfiles, consentimientos y auditoría.
- Stack base: Astro 6 SSR + React 19 + Tailwind CSS v4 + Supabase Auth + PostgreSQL con RLS.

## Funcionalidades generales obligatorias

- SSO con Supabase Auth para todas las apps del ecosistema.
- JWT con refresh token para sesiones cross-app.
- RLS (Row Level Security) en todas las tablas de dominio para autorización server-side.
- Paquete `@repo/auth` como wrapper compartido para apps web.
- Paquete `@repo/mobile-auth-client` para apps mobile.
- Auditoría inmutable de accesos (`auth_audit_log` solo INSERT).
- Consentimientos opt-in/opt-out por categoría.

## Decisiones clave

| ID           | Decision                                                                | Motivo                                                                                                                       | Impacto                                                                                         |
| ------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| ADR-AUTH-001 | Usar Supabase Auth nativo para autenticación (no construir auth propio) | Supabase ya es el stack del ecosistema; reduce superficie de ataque, costo y tiempo de desarrollo.                           | Todas las apps consumen Supabase Auth via `@repo/auth`; dependencia de Supabase como proveedor. |
| ADR-AUTH-002 | JWT con refresh token para sesiones cross-app                           | Permite sesiones válidas en todas las apps sin re-autenticación; expiración corta del JWT (15 min) y refresh token (7 días). | `@repo/auth` gestiona refresh automático; apps consumidoras no manejan tokens directamente.     |
| ADR-AUTH-003 | RLS (Row Level Security) para autorización en PostgreSQL                | Autorización verificada server-side en la base de datos; el cliente nunca tiene autorización implícita por UI.               | Políticas RLS en `profiles`, `roles`, `consents`, `auth_audit_log`; tests de RLS en CI.         |
| ADR-AUTH-004 | `@repo/auth` como paquete compartido para apps web                      | Abstrae Supabase Auth y unifica la lógica de sesión, roles y perfiles para todas las apps web.                               | Un único punto de mantenimiento; cambio de proveedor futuro sin tocar apps consumidoras.        |
| ADR-AUTH-005 | `@repo/mobile-auth-client` para apps mobile                             | Necesidades de auth mobile distintas (secure storage, deep links); paquete separado del web.                                 | Duplicación parcial de lógica, pero aisla las particularidades de mobile.                       |
| ADR-AUTH-006 | `auth_audit_log` como tabla solo INSERT (inmutable)                     | Garantiza trazabilidad de accesos; cumplimiento de auditoría de seguridad.                                                   | No se pueden corregir registros erróneos; trade-off aceptable para integridad de auditoría.     |

## Alternativas consideradas

- **Alternativa A — Better Auth:** Framework de autenticación TypeScript con soporte para múltiples proveedores. Descartado por la adopción de Supabase en el ecosistema Fósforo; añadiría complejidad innecesaria y duplicación de gestión de sesiones.
- **Alternativa B — Auth propio (construir desde cero):** Control total pero alto riesgo de seguridad, costo de mantenimiento y tiempo de desarrollo. Descartado por riesgo y costo; Supabase Auth cubre todos los requisitos del MVP.
- **Alternativa C — Auth0 / Clerk (SaaS externo):** Servicios robustos pero introducen una dependencia externa adicional fuera del stack del ecosistema. Descartado por integración nativa de Supabase y costo adicional.

## Riesgos y mitigaciónes

- **Riesgo 1 — Dependencia de Supabase Auth como proveedor unico:** `@repo/auth` abstrae la implementación; si se necesita cambiar de proveedor, solo se modifica el paquete, no las apps consumidoras. Mitigación: interfaz bien definida en `@repo/auth`.
- **Riesgo 2 — RLS mal configurada expone datos de otros usuarios:** Tests automatizados de RLS por tabla y por rol en CI; revisión de políticas en cada migración de base de datos. Mitigación: gate de CI que ejecuta tests de RLS.
- **Riesgo 3 — Sesiones hijacked por token comprometido:** Cookies httpOnly + Secure + SameSite; refresh token con expiración corta; revocación server-side. Mitigación: revisión periódica de configuración de cookies y tokens.
- **Riesgo 4 — Adopción incompleta por apps consumidoras:** Documentación de integración `@repo/auth` + gate en CI que valida que las apps autenticadas usen el paquete. Mitigación: linter y CI checks.
