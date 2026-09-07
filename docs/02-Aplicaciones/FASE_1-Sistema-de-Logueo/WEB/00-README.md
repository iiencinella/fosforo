---
tags:
  - proyecto/fosforo
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-readme
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[../00-README|Indice de aplicaciones]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso|SRS Identidad y Acceso]]"
---

# Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Metadatos

- Plataforma: WEB (con futura extensión mobile)
- Estado: draft
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-09-05

## Descripcion

El Sistema de Logueo es la capacidad de identidad y acceso del ecosistema Fósforo. Gestiona autenticación mediante SSO (Single Sign-On) con Supabase Auth, sesiones cross-app, roles y permisos, perfiles de usuario, consentimientos de privacidad y auditoría de accesos. Es la capacidad base que consumen todas las apps autenticadas del ecosistema.

Se distingue de la app Log (observabilidad/RUM), que se encarga de telemetría de rendimiento y errores. El Sistema de Logueo se integra con la app Log para registrar eventos de autenticación y generar trazabilidad de accesos.

## Validación de la idea

- Toda app autenticada del ecosistema necesita un SSO consistente para evitar fragmentación de identidad.
- Sin un sistema centralizado, cada app gestionaría su propia lógica de auth, roles y sesiones, duplicando código y aumentando la superficie de ataque.
- Un sistema compartido unifica roles, sesiones, consentimientos y auditoría de accesos en un único punto de control.

## Arquitectura

- **Frontend:** Astro 6 SSR + React 19 + Tailwind CSS v4 + `@repo/ui` (componentes compartidos del ecosistema).
- **Backend:** Supabase Auth (autenticación), PostgreSQL (perfiles, roles, consentimientos, auditoría).
- **Datos:** Supabase PostgreSQL con RLS (Row Level Security) en todas las tablas de dominio.
- **Integración:** `@repo/auth` (wrapper de Supabase Auth para apps web), `@repo/mobile-auth-client` (auth mobile), app Log (RUM/auditoría de accesos), todas las apps consumidoras via API de sesión.

## Estado de implementación

- **Completado:** Paquetes `@repo/auth` y `@repo/mobile-auth-client` existen como implementaciones parciales.
- **En curso:** Documentación de la app dedicada (draft 2026-09-05).
- **Pendiente:** App dedicada en `src/apps/logueo/`, endpoints de API completos, gestión de roles UI, gestión de consentimientos UI, panel de auditoría, tests unitarios y de integración.

## Ubicación del codigo

- App: `src/apps/logueo/`
- Componentes: `src/apps/logueo/src/components/`
- Estilos: `src/packages/tailwind-config/shared-styles.css` + `@repo/ui`
- Contenido: `src/apps/logueo/src/pages/auth/`
- API: `src/apps/logueo/src/pages/api/auth/`
- Paquete auth compartido: `src/packages/auth/`
- Paquete auth mobile: `src/packages/mobile-auth-client/`

## Alcance MVP

- SSO con Supabase Auth (email/password + magic link).
- Roles base: `admin`, `editor`, `revisor`, `dev`, `ops`, `usuario`.
- Perfiles de usuario (nombre, email, avatar, preferencias).
- Consentimientos (opt-in/opt-out por categoría).
- Auditoría de accesos (login, logout, operaciones sensibles).
- Gestión de sesiones (revocación, expiración, refresh).
- Integración con app Log para RUM pageviews y eventos de auth.

## No alcance MVP

- Federación con proveedores externos (Google, Apple, GitHub) — post-MVP.
- IAM empresarial (SCIM, LDAP, Active Directory) — post-MVP.
- MFA / 2FA — post-MVP.
- Passwordless con OTP por SMS — post-MVP.
- Gestión delegada de organizaciones — post-MVP.

## KPI principal

- p95 de autenticación < 500ms.
- 100% de apps autenticadas usando SSO del Sistema de Logueo.
- Sesiones válidas y compartidas en web y mobile sin re-autenticación.
- Tasa de login exitoso > 99%.

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | draft  |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | draft  |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | draft  |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | draft  |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | draft  |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md)      | draft  |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | draft  |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | draft  |

## Documentos complementarios

| Documento                                                        | Descripcion                                                 | Estado |
| ---------------------------------------------------------------- | ----------------------------------------------------------- | ------ |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)                    | Matriz de pruebas unitarias y de integración por requisito. | draft  |
| [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md) | Stack, módulos, endpoints y consideraciones UI/UX.          | draft  |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- El SRS de referencia transversal está en `docs/01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso.md`.
