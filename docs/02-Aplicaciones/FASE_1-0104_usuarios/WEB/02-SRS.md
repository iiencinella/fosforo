---
tags:
  - proyecto/fosforo
  - usuarios
  - srs
  - aplicación
type: app-srs
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso|SRS Identidad y Acceso]]"
---

# SRS - 0104_usuarios

## 1. Ficha

- ID base: `FR-0104-USUARIOS-*`, `NFR-0104-USUARIOS-*`, `IR-0104-USUARIOS-*`, `CA-0104-USUARIOS-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-05-25
- Estado: draft

## 2. Proposito y alcance tecnico

Definir los requisitos verificables del sistema de gestión de usuarios del ecosistema Fósforo. El alcance técnico del MVP incluye registro y autenticación con Supabase Auth, manejo de sesiones JWT compartidas entre aplicaciones, perfil de usuario, roles base (admin, sacerdote, coordinador, usuario), asignación de roles y permisos por aplicación, panel de administración básico y auditoría de eventos críticos.

## 3. Actores

- Visitante: usuario no autenticado que navega y desea registrarse o iniciar sesión.
- Usuario autenticado: usuario con sesión activa que accede a aplicaciones autorizadas y gestiona su perfil.
- Administrador: usuario con rol admin que gestiona usuarios, asigna roles y supervisa permisos.
- Sistema de plataforma: servicios internos que consumen UserService para validar sesiones, roles y permisos.

## 4. Requisitos funcionales

| ID                   | Requisito                                                                                                 | Criterio verificable                                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| FR-0104-USUARIOS-001 | El sistema debe permitir el registro de un nuevo usuario con email y contraseña.                          | Un visitante completa el formulario de registro, el sistema crea la cuenta en Supabase Auth y la tabla profiles, y retorna sesión activa. |
| FR-0104-USUARIOS-002 | El sistema debe permitir el inicio de sesión con email y contraseña, emitiendo un JWT.                    | Un usuario registrado ingresa sus credenciales y recibe un token JWT válido con los claims de usuario y rol.                              |
| FR-0104-USUARIOS-003 | El sistema debe permitir el cierre de sesión invalidando la sesión actual.                                | El usuario cierra sesión y el token JWT deja de ser aceptado por los endpoints protegidos.                                                |
| FR-0104-USUARIOS-004 | El sistema debe permitir la recuperación de contraseña mediante enlace enviado por email.                 | Un usuario solicita recuperación, recibe un email con enlace temporal y puede establecer una nueva contraseña.                            |
| FR-0104-USUARIOS-005 | El sistema debe mantener una sesión compartida entre aplicaciones del ecosistema (SSO).                   | Un usuario autenticado en una app accede a otra app del ecosistema sin volver a iniciar sesión, usando el mismo JWT.                      |
| FR-0104-USUARIOS-006 | El sistema debe exponer un perfil de usuario con datos personales básicos.                                | El usuario autenticado puede consultar y editar su nombre, email y avatar desde la sección de perfil.                                     |
| FR-0104-USUARIOS-007 | El sistema debe gestionar roles base: admin, sacerdote, coordinador, usuario.                             | Existe una tabla roles con los 4 roles predefinidos, y cada usuario tiene un rol asignado.                                                |
| FR-0104-USUARIOS-008 | El sistema debe permitir a un administrador asignar y modificar roles de usuarios.                        | El panel de administración permite buscar usuarios, ver su rol actual y cambiarlo.                                                        |
| FR-0104-USUARIOS-009 | El sistema debe gestionar permisos por aplicación del ecosistema.                                         | Cada rol tiene un conjunto de permisos definidos por aplicación (acceso concedido o denegado).                                            |
| FR-0104-USUARIOS-010 | El sistema debe auditar eventos críticos: inicio de sesión, cambio de rol, creación de usuario.           | Los eventos se persisten en la tabla audit_log con timestamp, usuario, acción y metadata.                                                 |
| FR-0104-USUARIOS-011 | El sistema debe exponer servicios internos (UserService) para que otras apps validen sesiones y permisos. | Otras apps pueden consultar `UserService.validateSession(token)` y `UserService.hasPermission(userId, appSlug)` vía API.                  |

## 5. Requisitos no funcionales

| ID                    | Requisito                  | Objetivo                                                                                                                                           |
| --------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-0104-USUARIOS-001 | Disponibilidad/Estabilidad | 99.5% mensual para endpoints de autenticación durante MVP.                                                                                         |
| NFR-0104-USUARIOS-002 | Rendimiento                | Autenticación p95 menor a 500 ms y consulta de perfil/roles p95 menor a 300 ms en condiciones normales.                                            |
| NFR-0104-USUARIOS-003 | Seguridad                  | Toda credencial y token debe transmitirse y almacenarse según buenas prácticas (JWT firmado, HTTPS, hash de contraseñas delegado a Supabase Auth). |
| NFR-0104-USUARIOS-004 | Accesibilidad              | WCAG 2.1 AA en formularios de registro, login, perfil y panel de administración.                                                                   |
| NFR-0104-USUARIOS-005 | Observabilidad             | Logs estructurados de eventos de autenticación, errores y cambios de rol integrados con el sistema de auditoría del ecosistema.                    |

## 6. Integraciónes

| ID                   | Integración                              | Contrato                                                                                              | Version |
| -------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------- |
| IR-0104-USUARIOS-001 | Supabase Auth                            | APIs de autenticación de Supabase (signUp, signInWithPassword, resetPassword, signOut)                | v1      |
| IR-0104-USUARIOS-002 | Supabase PostgreSQL                      | Tablas public.profiles, public.roles, public.permissions, public.user_roles, public.audit_log con RLS | v1      |
| IR-0104-USUARIOS-003 | UserService (API interna)                | Endpoints Astro API para registro, login, perfil, roles, permisos y auditoría                         | v1      |
| IR-0104-USUARIOS-004 | Cliente móvil (@repo/mobile-auth-client) | Endpoint `/api/auth/mobile-login` para autenticación desde apps React Native                          | v1      |
| IR-0104-USUARIOS-005 | Vercel                                   | Despliegue web y ejecución de endpoints Astro                                                         | v1      |

## 7. Criterios de aceptación

| ID                   | Criterio                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CA-0104-USUARIOS-001 | Un visitante puede registrarse, iniciar sesión y acceder a una aplicación del ecosistema sin errores.                    |
| CA-0104-USUARIOS-002 | Un usuario autenticado en una app puede navegar a otra app del ecosistema sin volver a autenticarse.                     |
| CA-0104-USUARIOS-003 | Un administrador puede asignar el rol "coordinador" a un usuario y ese cambio se refleja inmediatamente en los permisos. |
| CA-0104-USUARIOS-004 | Un usuario sin permisos para una app recibe un error de autorización al intentar acceder.                                |
| CA-0104-USUARIOS-005 | Todos los inicios de sesión fallidos y cambios de rol quedan registrados en audit_log con timestamp y metadata.          |

## 8. Trazabilidad PRD -> SRS

| PRD                   | SRS                                        |
| --------------------- | ------------------------------------------ |
| PRD-0104-USUARIOS-001 | FR-0104-USUARIOS-001                       |
| PRD-0104-USUARIOS-002 | FR-0104-USUARIOS-002, FR-0104-USUARIOS-003 |
| PRD-0104-USUARIOS-003 | FR-0104-USUARIOS-004                       |
| PRD-0104-USUARIOS-004 | FR-0104-USUARIOS-006                       |
| PRD-0104-USUARIOS-005 | FR-0104-USUARIOS-005                       |
| PRD-0104-USUARIOS-006 | FR-0104-USUARIOS-007                       |
| PRD-0104-USUARIOS-007 | FR-0104-USUARIOS-008                       |
| PRD-0104-USUARIOS-008 | FR-0104-USUARIOS-009                       |
| PRD-0104-USUARIOS-009 | FR-0104-USUARIOS-010, FR-0104-USUARIOS-011 |
