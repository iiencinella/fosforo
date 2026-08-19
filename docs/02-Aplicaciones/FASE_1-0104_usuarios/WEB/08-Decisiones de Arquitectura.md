---
tags:
  - proyecto/fosforo
  - usuarios
  - arquitectura
  - decisiones
  - aplicación
type: app-arquitectura
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso|SRS Identidad y Acceso]]"
---

# Decisiones de Arquitectura - 0104_usuarios

## Contexto

- Plataforma objetivo: WEB (con soporte Mobile vía API)
- Alcance de esta decision: definir la arquitectura del sistema de gestión de usuarios del ecosistema Fósforo para Fase 1, garantizando identidad unificada, roles consistentes y auditoría de acceso.

## Funcionalidades generales obligatorias

- Registro, inicio de sesión y recuperación de contraseña con email+password.
- Sesión compartida (SSO) entre aplicaciones del ecosistema mediante JWT.
- Perfil de usuario consultable y editable.
- Roles base (admin, sacerdote, coordinador, usuario) con permisos por aplicación.
- Panel de administración para gestión de usuarios y roles.
- Auditoría de eventos críticos de seguridad.

## Decisiones clave

| ID                    | Decision                                                                                                  | Motivo                                                                                                                                                                             | Impacto                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ADR-0104-USUARIOS-001 | Usar Supabase Auth como proveedor de autenticación en lugar de implementar auth propio.                   | Supabase Auth provee manejo de credenciales, hashing de contraseñas, email de recuperación y sesiones JWT out-of-the-box. Reduce riesgo de seguridad y esfuerzo de implementación. | Dependencia externa del servicio de Supabase; los flujos de auth no son completamente controlados por el equipo.    |
| ADR-0104-USUARIOS-002 | Enfoque híbrido: auth.users de Supabase + tablas propias (profiles, roles, permissions, audit_log).       | auth.users maneja autenticación; tablas propias manejan la lógica de negocio de roles, permisos y perfiles con total control del equipo.                                           | Requiere mantener sincronía entre auth.users y public.profiles mediante triggers de base de datos.                  |
| ADR-0104-USUARIOS-003 | UserService como capa de abstracción entre las apps y Supabase.                                           | Centraliza la lógica de validación de sesiones, consulta de roles y permisos. Permite cambiar el proveedor de auth en el futuro sin afectar a las apps consumidoras.               | Las apps no deben acceder directamente a Supabase Auth ni a las tablas de usuarios.                                 |
| ADR-0104-USUARIOS-004 | JWT como mecanismo de SSO entre aplicaciones, almacenado en httpOnly cookie (web) o SecureStore (mobile). | JWT permite compartir sesión entre apps del ecosistema sin necesidad de un servidor de sesiones centralizado. httpOnly cookie previene XSS.                                        | Los JWT deben tener expiración corta (24h) con refresh token; revocación inmediata requiere lógica adicional.       |
| ADR-0104-USUARIOS-005 | Sistema de roles con permisos por aplicación en lugar de permisos globales.                               | Cada app del ecosistema puede tener requisitos de acceso distintos; un rol puede tener acceso a ciertas apps y no a otras.                                                         | Mayor complejidad en la asignación de permisos; requiere precarga de configuración por app en la tabla permissions. |

## Alternativas consideradas

- Alternativa A (Auth totalmente custom): Implementar autenticación, hashing y sesiones desde cero. Descartado por alto riesgo de seguridad y tiempo de desarrollo.
- Alternativa B (Solo Supabase Auth sin tablas propias): Usar solo auth.users con metadata en raw_user_meta_data para roles y perfiles. Descartado por falta de control, tipos, auditoría y escalabilidad del modelo de datos.
- Alternativa C (Better Auth): Usar la librería Better Auth en lugar de Supabase Auth. Descartado por inconsistencia con el stack del ecosistema, que ya usa `@supabase/supabase-js` en otras apps.

## Riesgos y mitigaciónes

- Riesgo 1: Dependencia de Supabase Auth para flujo crítico de login. Mitigación: monitoreo de disponibilidad, fallback a caché de sesiones activas, evaluación de redundancia post-MVP.
- Riesgo 2: Inconsistencia entre auth.users y profiles. Mitigación: trigger `ON INSERT` en auth.users + job de reconciliación programado.
- Riesgo 3: JWT comprometido. Mitigación: expiración corta (24h), refresh tokens, httpOnly cookies, rotación forzada en cambios de rol.
