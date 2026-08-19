---
tags:
  - proyecto/fosforo
  - usuarios
  - frd
  - aplicación
type: app-frd
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - 0104_usuarios

## 1. Ficha

- ID base: `RB-0104-USUARIOS-*`, `UC-0104-USUARIOS-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-05-25

## 2. Casos de uso

| ID                   | Caso de uso                                | Flujo principal                                                                                                                                                                   | Excepciones                                                                                           |
| -------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| UC-0104-USUARIOS-001 | Registrarse en el ecosistema.              | El visitante completa el formulario de registro con email y contraseña, el sistema valida los datos, crea la cuenta y redirige al dashboard o app de destino con sesión iniciada. | Email ya registrado, contraseña inválida, error de Supabase Auth, error de persistencia en profiles.  |
| UC-0104-USUARIOS-002 | Iniciar sesión.                            | El usuario ingresa email y contraseña, el sistema valida contra Supabase Auth, emite JWT con claims de usuario y rol, y redirige a la app solicitada.                             | Credenciales incorrectas, cuenta bloqueada, error de conexión con Supabase.                           |
| UC-0104-USUARIOS-003 | Recuperar contraseña.                      | El usuario solicita recuperación ingresando su email, el sistema envía un enlace temporal, el usuario establece nueva contraseña y confirma.                                      | Email no registrado, enlace expirado, error de envío de email.                                        |
| UC-0104-USUARIOS-004 | Gestionar perfil personal.                 | El usuario autenticado accede a su perfil, visualiza sus datos, edita nombre o avatar y guarda los cambios.                                                                       | Error de validación de campos, error de persistencia, avatar con formato no soportado.                |
| UC-0104-USUARIOS-005 | Asignar rol a usuario.                     | El administrador busca un usuario, selecciona un rol de la lista y confirma la asignación. El sistema actualiza user_roles y registra el cambio en audit_log.                     | Usuario no encontrado, el administrador no tiene permiso para asignar ese rol, error de persistencia. |
| UC-0104-USUARIOS-006 | Acceder a una aplicación del ecosistema.   | El usuario autenticado navega a otra app, el sistema valida el JWT existente, verifica permisos y concede acceso o muestra error de autorización.                                 | JWT expirado, JWT inválido, usuario sin permiso para la app destino.                                  |
| UC-0104-USUARIOS-007 | Listar y gestionar usuarios (panel admin). | El administrador accede al panel, visualiza listado de usuarios con filtros, selecciona uno para ver detalle, edita datos o cambia rol.                                           | Listado vacío, error de paginación, usuario sin permisos de administración.                           |

## 3. Reglas de negocio

| ID                   | Regla                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| RB-0104-USUARIOS-001 | Un email solo puede estar asociado a una única cuenta en el ecosistema.                                                        |
| RB-0104-USUARIOS-002 | Todo usuario registrado debe tener exactamente un rol asignado (por defecto "usuario" al registrarse).                         |
| RB-0104-USUARIOS-003 | Solo los usuarios con rol "admin" pueden asignar o modificar roles de otros usuarios.                                          |
| RB-0104-USUARIOS-004 | Un usuario no puede autoconcederse un rol de mayor jerarquía.                                                                  |
| RB-0104-USUARIOS-005 | Los permisos de acceso a cada aplicación se evalúan contra el rol del usuario en el momento de la solicitud.                   |
| RB-0104-USUARIOS-006 | Todo cambio de rol debe quedar registrado en audit_log con usuario que lo ejecuta, usuario afectado, rol anterior y rol nuevo. |
| RB-0104-USUARIOS-007 | Las sesiones JWT tienen una duración máxima configurable (default 24 horas) y deben renovarse mediante refresh token.          |

## 4. Validaciónes y errores esperados

| Contexto                   | Validación                                                                                | Error                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Registro de usuario        | Email con formato válido, contraseña con mínimo 8 caracteres, email no duplicado.         | `USERS_DUPLICATE_EMAIL` - Ya existe una cuenta con ese email. / `USERS_INVALID_PASSWORD` - La contraseña debe tener al menos 8 caracteres. |
| Inicio de sesión           | Email registrado, contraseña correcta, cuenta no bloqueada.                               | `USERS_INVALID_CREDENTIALS` - Email o contraseña incorrectos. / `USERS_ACCOUNT_DISABLED` - La cuenta se encuentra deshabilitada.           |
| Recuperación de contraseña | Email válido y registrado.                                                                | `USERS_EMAIL_NOT_FOUND` - No encontramos una cuenta asociada a ese email.                                                                  |
| Edición de perfil          | Nombre no vacío, email con formato válido, avatar en formato permitido.                   | `USERS_INVALID_PROFILE_DATA` - Revisá los campos obligatorios e intentá nuevamente.                                                        |
| Asignación de roles        | Usuario destino existe, el admin tiene permiso para asignar roles, el rol destino existe. | `USERS_ROLE_ASSIGNMENT_DENIED` - No tenés permisos para asignar ese rol. / `USERS_USER_NOT_FOUND` - El usuario seleccionado no existe.     |
| Acceso a aplicación        | JWT válido, usuario tiene permiso para la app solicitada.                                 | `USERS_UNAUTHORIZED_APP` - No tenés acceso a esta aplicación. / `USERS_SESSION_EXPIRED` - Tu sesión expiró, iniciá sesión nuevamente.      |

## 5. Estados funcionales

- Estado `loading`: skeleton para formularios de login/registro, perfil y listados de administración mientras se procesa la solicitud.
- Estado `empty`: mensaje claro cuando no hay usuarios registrados (panel admin), o cuando el listado de aplicaciones asignadas está vacío.
- Estado `error`: mensaje de fallo con opción de reintentar o canal alternativo cuando la autenticación o persistencia no responde.
- Estado `success`: confirmación breve con identificación contextual del tipo de operación realizada (registro exitoso, perfil actualizado, rol asignado).

## 6. Trazabilidad FRD -> SRS

| FRD                                                                                     | SRS                                                              |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| UC-0104-USUARIOS-001 / RB-0104-USUARIOS-001, RB-0104-USUARIOS-002                       | FR-0104-USUARIOS-001                                             |
| UC-0104-USUARIOS-002 / RB-0104-USUARIOS-007                                             | FR-0104-USUARIOS-002, FR-0104-USUARIOS-003                       |
| UC-0104-USUARIOS-003                                                                    | FR-0104-USUARIOS-004                                             |
| UC-0104-USUARIOS-004                                                                    | FR-0104-USUARIOS-006                                             |
| UC-0104-USUARIOS-005 / RB-0104-USUARIOS-003, RB-0104-USUARIOS-004, RB-0104-USUARIOS-006 | FR-0104-USUARIOS-007, FR-0104-USUARIOS-008, FR-0104-USUARIOS-010 |
| UC-0104-USUARIOS-006 / RB-0104-USUARIOS-005, RB-0104-USUARIOS-007                       | FR-0104-USUARIOS-005, FR-0104-USUARIOS-009, FR-0104-USUARIOS-011 |
| UC-0104-USUARIOS-007 / RB-0104-USUARIOS-003                                             | FR-0104-USUARIOS-007, FR-0104-USUARIOS-008                       |
