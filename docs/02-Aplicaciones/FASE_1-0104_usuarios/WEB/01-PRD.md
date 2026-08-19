---
tags:
  - proyecto/fosforo
  - usuarios
  - prd
  - aplicación
type: app-prd
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso|SRS Identidad y Acceso]]"
---

# PRD - 0104_usuarios

## 1. Ficha

- ID base: `PRD-0104-USUARIOS-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-05-25
- Estado: draft

## 2. Problema y oportunidad

- Problema: el ecosistema Fósforo necesita una gestión centralizada de usuarios que evite la creación de cuentas duplicadas entre aplicaciones, garantice roles y permisos consistentes, y proporcione una experiencia de autenticación uniforme en todo el ecosistema.
- Oportunidad: un sistema de usuarios unificado puede simplificar el onboarding, habilitar el acceso cross-app con una sola identidad, y establecer una base sólida de seguridad y auditoría desde la Fase 1.

## 3. Objetivo de negocio

Construir el sistema de gestión de identidad, autenticación y autorización del ecosistema Fósforo, permitiendo que cualquier usuario acceda a todas las aplicaciones autorizadas con una sola cuenta, que los administradores gestionen roles y permisos de forma centralizada, y que todas las operaciones sensibles queden registradas para auditoría.

## 4. Segmentos y JTBD

- Segmento principal: usuarios finales del ecosistema que necesitan registrarse, iniciar sesión y acceder a aplicaciones autorizadas.
- Segmento secundario: administradores y operadores que gestionan usuarios, asignan roles y supervisan la seguridad del acceso.
- JTBD principal: "Cuando llego a Fósforo, quiero crear mi cuenta rápidamente y acceder a las aplicaciones del ecosistema sin tener que registrarme de nuevo en cada una".

## 5. Alcance MVP

| ID                    | Requisito de producto                                                   | Prioridad | Justificación                                               |
| --------------------- | ----------------------------------------------------------------------- | --------- | ----------------------------------------------------------- |
| PRD-0104-USUARIOS-001 | Registro de usuario con email y contraseña.                             | Must      | Sin registro no hay identidad en el ecosistema.             |
| PRD-0104-USUARIOS-002 | Inicio y cierre de sesión con sesión persistente JWT.                   | Must      | Flujo básico de autenticación requerido por todas las apps. |
| PRD-0104-USUARIOS-003 | Recuperación de contraseña mediante email.                              | Must      | Gestión de acceso ante pérdida de credenciales.             |
| PRD-0104-USUARIOS-004 | Perfil de usuario con datos personales básicos (nombre, email, avatar). | Must      | Identidad mínima del usuario dentro del ecosistema.         |
| PRD-0104-USUARIOS-005 | SSO entre aplicaciones del ecosistema (sesión compartida).              | Must      | El usuario no debe volver a autenticarse al cambiar de app. |
| PRD-0104-USUARIOS-006 | Roles base: admin, sacerdote, coordinador, usuario.                     | Must      | Diferenciación de capacidades entre tipos de usuarios.      |
| PRD-0104-USUARIOS-007 | Asignación de roles a usuarios desde administración.                    | Must      | Gestión operativa de permisos.                              |
| PRD-0104-USUARIOS-008 | Permisos básicos por aplicación del ecosistema.                         | Must      | Control granular de acceso a cada app.                      |
| PRD-0104-USUARIOS-009 | Auditoría de eventos críticos de autenticación y roles.                 | Should    | Trazabilidad de seguridad necesaria desde fases tempranas.  |

## 6. No alcance MVP

- Inicio de sesión con OAuth (Google, Apple, etc.) — post-MVP.
- Integración LDAP o Active Directory — post-MVP.
- Autenticación biométrica o 2FA — post-MVP.
- Perfil espiritual avanzado (patrono, parroquia, dones, carisma) — post-MVP.
- Autogestión de roles por parte del usuario — post-MVP.
- Dashboard analítico de usuarios con métricas de actividad — post-MVP.

## 7. KPI y criterios de exito

- KPI principal: tasa de éxito de registro e inicio de sesión (creaciones exitosas / intentos totales).
- KPI secundario 1: tiempo medio de resolución de incidentes de autenticación (login fallidos, resets de contraseña).
- KPI secundario 2: cobertura de asignación de roles sobre usuarios activos (usuarios con rol asignado / usuarios activos totales).

## 8. Riesgos de negocio

| Riesgo                                                              | Impacto | Mitigación                                                                                      | Owner    |
| ------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------- | -------- |
| Duplicación de identidades entre apps si no se centraliza a tiempo. | Alto    | Implementar cuenta única desde MVP y forzar su uso en todas las apps.                           | Producto |
| Fuga de datos sensibles por manejo incorrecto de credenciales.      | Alto    | Usar Supabase Auth como proveedor, no almacenar contraseñas en tablas propias.                  | Técnico  |
| Roles mal asignados que exponen funcionalidades restringidas.       | Alto    | Validar permisos en backend (RLS + API layer), no solo en frontend.                             | Técnico  |
| Baja adopción por fricción en registro o login.                     | Medio   | Formularios simples, validación en tiempo real, recuperación de contraseña fluida.              | Producto |
| Dependencia externa de Supabase Auth para flujos críticos.          | Medio   | Tener monitoreo de disponibilidad de Supabase y plan de contingencia ante caídas del proveedor. | Técnico  |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
- Flujos derivados: [04-Flujos y Secuencias.md](04-Flujos%20y%20Secuencias.md)
