---
tags:
  - proyecto/fosforo
  - prd
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-prd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Logueo]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `PRD-AUTH-*`
- Plataforma: WEB (con futura extensión mobile)
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Problema y oportunidad

- **Problema:** Cada app del ecosistema Fósforo necesita autenticación. Sin un sistema de SSO centralizado, cada una duplica la lógica de auth, gestión de roles, manejo de sesiones y auditoría. Esto genera inconsistencias de seguridad, fragmentación de identidad y costo de mantenimiento creciente por app.
- **Oportunidad:** Un sistema de identidad compartido unifica sesiones, roles, consentimientos y auditoría en un único punto de control. Las apps consumidoras solo integran `@repo/auth` y delegan toda la responsabilidad de identidad al Sistema de Logueo, reduciendo superficie de ataque y acelerando el desarrollo de nuevas apps.

## 3. Objetivo de negocio

Construir el Sistema de Logueo como la capacidad de identidad y acceso del ecosistema Fósforo, permitiendo que toda app autenticada use un SSO unificado basado en Supabase Auth, con roles centralizados, perfiles de usuario compartidos, consentimientos de privacidad gestionados y auditoría de accesos integrada con la app Log. El sistema debe lograr p95 de autenticación < 500ms y 100% de apps autenticadas usando el SSO compartido.

## 4. Segmentos y JTBD

- **Segmento principal — Usuarios finales:** necesitan iniciar sesión una sola vez y acceder a todas las apps del ecosistema sin re-autenticación. Gestiona su perfil, preferencias y consentimientos.
- **Segmento secundario — Administradores y editores:** necesitan gestionar roles de usuarios, revisar auditoría de accesos y administrar consentimientos a nivel de plataforma.
- **Segmento terciario — Apps consumidoras (sistema):** integran `@repo/auth` para obtener el estado de sesión, el rol del usuario y validar permisos en el servidor via RLS.

- **JTBD principal:** "Como usuario, quiero iniciar sesión una vez y acceder a todas las apps del ecosistema sin tener que autenticarme de nuevo, para que mi experiencia sea fluida y segura."

## 5. Alcance MVP

| ID           | Requisito de producto                                                       | Prioridad | Justificación                                                                      |
| ------------ | --------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------- |
| PRD-AUTH-001 | SSO con Supabase Auth (email/password + magic link)                         | Must      | Base de identidad del ecosistema; sin SSO no hay unificación de sesiones.          |
| PRD-AUTH-002 | Roles base (admin, editor, revisor, dev, ops, usuario) con permisos por app | Must      | Control de acceso granular; cada app necesita saber qué puede hacer cada rol.      |
| PRD-AUTH-003 | Perfil de usuario (nombre, email, avatar, preferencias)                     | Must      | Identidad consistente en todas las apps; preferencias compartidas entre servicios. |
| PRD-AUTH-004 | Consentimientos (opt-in/opt-out por categoría)                              | Must      | Cumplimiento de privacidad; obligatorio para marketing y trazabilidad.             |
| PRD-AUTH-005 | Auditoría de accesos (login, logout, operaciones sensibles)                 | Must      | Trazabilidad de seguridad; integración con app Log para RUM.                       |
| PRD-AUTH-006 | Integración RUM (pageviews y eventos de auth enviados a app Log)            | Should    | Observabilidad de autenticación; detección de anomalías de acceso.                 |

## 6. No alcance MVP

- Federación con proveedores externos (Google, Apple, GitHub) — post-MVP.
- MFA / 2FA — post-MVP.
- IAM empresarial (SCIM, LDAP, Active Directory) — post-MVP.
- Passwordless con OTP por SMS — post-MVP.
- Gestión delegada de organizaciones — post-MVP.

## 7. KPI y criterios de exito

- **KPI principal:** p95 de autenticación < 500ms.
- **KPI secundario 1:** 100% de apps autenticadas usando SSO del Sistema de Logueo.
- **KPI secundario 2:** Sesiones cross-app válidas en web y mobile sin re-autenticación.
- **KPI secundario 3:** Tasa de login exitoso > 99%.

## 8. Riesgos de negocio

| Riesgo                                             | Impacto | Mitigación                                                                         | Owner                    |
| -------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- | ------------------------ |
| Dependencia de Supabase Auth como proveedor unico  | Alto    | `@repo/auth` abstrae Supabase; permite intercambio futuro.                         | Iván Ezequiel Iencinella |
| RLS mal configurada expone datos de otros usuarios | Alto    | Tests de RLS automatizados por tabla y por rol en CI.                              | Iván Ezequiel Iencinella |
| Adopción incompleta por apps consumidoras          | Medio   | Documentación de integración `@repo/auth` + gate en CI que valida uso del paquete. | Iván Ezequiel Iencinella |
| Sesiones hijacked por token comprometido           | Medio   | Refresh token con expiración corta + revocación de sesión server-side.             | Iván Ezequiel Iencinella |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
- SRS de referencia transversal: `docs/01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso.md`
