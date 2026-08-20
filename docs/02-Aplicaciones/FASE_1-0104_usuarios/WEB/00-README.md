---
tags:
  - proyecto/fosforo
  - usuarios
  - aplicación
type: app-readme
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-06-07
related:
  - "[[../00-README|Indice de aplicaciónes]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso|SRS Identidad y Acceso]]"
---

# 0104_usuarios

## Metadatos

- Plataforma: WEB
- Estado: draft
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-05-25

## Descripcion

0104 Usuarios es el sistema de gestión de identidad, autenticación, autorización y perfiles del ecosistema Fósforo. Centraliza el registro, inicio de sesión, administración de roles y permisos, y la gestión del ciclo de vida de los usuarios en todas las aplicaciones de la plataforma.

Como core system del ecosistema, esta app garantiza que cada usuario tenga una identidad única y reutilizable entre aplicaciones, que los roles y permisos se apliquen de forma consistente, y que las operaciones sensibles queden registradas para auditoría. Se integra con Supabase Auth como proveedor de autenticación base y expone servicios de usuario para el resto del ecosistema a través de `UserService`.

## Validación de la idea

- La Fase 1 del ecosistema necesita identidad unificada para evitar cuentas duplicadas entre aplicaciones como Portal, Biblia y Calendario.
- Roles y permisos son un requisito transversal: aplicaciones como el Panel de Administración y el Sistema de Notificaciones necesitan saber quién puede hacer qué.
- La auditoría de acceso es necesaria para seguridad, cumplimiento y trazabilidad de operaciones sensibles en el ecosistema.

## Arquitectura

- **Frontend:** Astro + React + Tailwind CSS (componentes de login, registro, perfil, administración)
- **Backend:** UserService como capa de aplicación + Astro API Endpoints
- **Datos:** Supabase Auth (auth.users) + PostgreSQL (profiles, roles, permissions, user_roles, audit_log)
- **Integración:** Supabase Auth (JWT, RLS), móvil mediante `@repo/mobile-auth-client`, Vercel
- **Consumidores:** las apps del ecosistema (ej. 0401 Cancionero) consumen identidad via `@repo/auth` en lugar de reimplementar cookies/sesión

## Estado de implementación

- **Completado:** workspace Astro, Supabase Auth y RLS, cookies de sesión, administración base, recuperación de contraseña con actualización, clientes Supabase ligados al JWT y helpers RBAC en `@repo/auth`.
- **En curso:** integración E2E con un usuario de pruebas, configuración de URLs de recovery en Supabase y despliegue Linux/Vercel.
- **Pendiente:** integración completa con `mobile-auth-client`, auditoría/alertas operativas y cierre de pruebas con tokens de staging.

## Ubicación del codigo

- App: `src/apps/usuarios/` (no implementada aún)
- Componentes: `src/apps/usuarios/src/components/`
- Estilos: `src/packages/ui/`, `src/packages/tailwind-config/shared-styles.css`
- Contenido: `src/apps/usuarios/src/content/`
- API: `src/apps/usuarios/src/pages/api/`

## Alcance MVP

- Registro de usuario con email y contraseña.
- Inicio y cierre de sesión con manejo de sesiones JWT.
- Recuperación de contraseña.
- Perfil de usuario con datos personales básicos.
- Roles base: admin, sacerdote, coordinador, usuario.
- Asignación y gestión de roles desde panel de administración.
- Permisos básicos por aplicación del ecosistema.

## No alcance MVP

- Inicio de sesión mediante OAuth (Google, Apple, etc.) — post-MVP.
- Integración con LDAP o federación de identidad empresarial — post-MVP.
- Perfil espiritual avanzado (patrono, parroquia, dones) — post-MVP.
- Autenticación biométrica o 2FA — post-MVP.
- Autogestión de roles por parte del usuario — post-MVP.

## KPI principal

- KPI principal: tasa de éxito de registro e inicio de sesión (creación de cuenta completada / intentos de registro).
- KPI secundario 1: tiempo medio de resolución de issues de autenticación (login fallidos, recuperación de contraseña).
- KPI secundario 2: cobertura de asignación de roles sobre usuarios activos (usuarios con rol asignado / usuarios activos totales).

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

| Documento                                                        | Descripcion                                                                    | Estado |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------ |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)                    | Matriz de pruebas unitarias para auth, roles, permisos y servicios de usuario. | draft  |
| [09-Especificación Tecnica](09-Especificaci%C3%B3n%20Tecnica.md) | Stack, módulos, endpoints, esquemas y contratos del workspace de usuarios.     | draft  |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- La app de usuarios depende funcionalmente de Supabase Auth y expone sus capacidades al ecosistema mediante `UserService` y Astro API Endpoints.
