---
tags:
  - proyecto/fosforo
  - usuarios
  - tests
  - aplicación
type: app-tests
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
---

# Tests Unitarios - 0104_usuarios

## 1. Ficha

- ID base: `TC-0104-USUARIOS-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-05-25

## 2. Estrategia

- Framework: Vitest
- Alcance unitario: servicios de autenticación (UserService), validación de formularios, lógica de roles y permisos, reglas de negocio de asignación de roles, auditoría de eventos.
- Exclusiones justificadas: integración real con Supabase Auth (se mockea el cliente), pruebas end-to-end de flujo completo (post-MVP), pruebas de UI de componentes (alcance de integración).

## 3. Matriz de pruebas

| ID                   | Requisito trazado    | Tipo                 | Estado  |
| -------------------- | -------------------- | -------------------- | ------- |
| TC-0104-USUARIOS-001 | FR-0104-USUARIOS-001 | Unitario             | Parcial |
| TC-0104-USUARIOS-002 | FR-0104-USUARIOS-002 | Unitario             | Parcial |
| TC-0104-USUARIOS-003 | FR-0104-USUARIOS-003 | Unitario/E2E         | Parcial |
| TC-0104-USUARIOS-004 | FR-0104-USUARIOS-004 | Unitario/E2E         | Parcial |
| TC-0104-USUARIOS-005 | FR-0104-USUARIOS-005 | Unitario/E2E         | Parcial |
| TC-0104-USUARIOS-006 | FR-0104-USUARIOS-006 | Unitario/E2E         | Parcial |
| TC-0104-USUARIOS-007 | FR-0104-USUARIOS-007 | Unitario             | Parcial |
| TC-0104-USUARIOS-008 | FR-0104-USUARIOS-008 | Unitario/Integración | Parcial |
| TC-0104-USUARIOS-009 | FR-0104-USUARIOS-009 | Unitario/Integración | Parcial |
| TC-0104-USUARIOS-010 | FR-0104-USUARIOS-010 | Unitario/Integración | Parcial |
| TC-0104-USUARIOS-011 | FR-0104-USUARIOS-011 | Unitario/E2E         | Parcial |

### Detalle de casos de prueba

| ID                   | Escenario                                          | Entrada esperada                                                    | Resultado esperado                                                                                |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| TC-0104-USUARIOS-001 | Registrar usuario con email y contraseña válidos.  | `{ email: "test@ejemplo.com", password: "12345678", name: "Test" }` | Cuenta creada en Supabase Auth mock, perfil insertado en profiles mock, retorna JWT simulado.     |
| TC-0104-USUARIOS-002 | Registrar usuario con email duplicado.             | `{ email: "existente@ejemplo.com", ... }`                           | Error `USERS_DUPLICATE_EMAIL`, cuenta no creada.                                                  |
| TC-0104-USUARIOS-003 | Iniciar sesión con credenciales correctas.         | `{ email: "test@ejemplo.com", password: "12345678" }`               | JWT generado con claims de user_id, role y email.                                                 |
| TC-0104-USUARIOS-004 | Iniciar sesión con contraseña incorrecta.          | `{ email: "test@ejemplo.com", password: "wrong" }`                  | Error `USERS_INVALID_CREDENTIALS`.                                                                |
| TC-0104-USUARIOS-005 | Cerrar sesión y usar token invalidado.             | Token post-logout en endpoint protegido.                            | Error de autenticación, acceso denegado.                                                          |
| TC-0104-USUARIOS-006 | Recuperar contraseña para email registrado.        | `{ email: "test@ejemplo.com" }`                                     | Email de recuperación enviado (mock).                                                             |
| TC-0104-USUARIOS-007 | Recuperar contraseña para email no registrado.     | `{ email: "no-existe@ejemplo.com" }`                                | Error `USERS_EMAIL_NOT_FOUND`.                                                                    |
| TC-0104-USUARIOS-008 | SSO: validar JWT entre apps.                       | JWT emitido para App A, usado en App B.                             | App B valida JWT y concede acceso si hay permiso.                                                 |
| TC-0104-USUARIOS-009 | SSO: JWT expirado entre apps.                      | JWT vencido.                                                        | Error `USERS_SESSION_EXPIRED`, redirige a login.                                                  |
| TC-0104-USUARIOS-010 | Asignar rol válido a usuario existente.            | admin asigna rol "coordinador" a user_456.                          | user_roles actualizado, audit_log insertado.                                                      |
| TC-0104-USUARIOS-011 | Asignar rol sin permisos de admin.                 | usuario con rol "usuario" intenta asignar rol.                      | Error `USERS_ROLE_ASSIGNMENT_DENIED`.                                                             |
| TC-0104-USUARIOS-012 | Verificar permiso de acceso a app.                 | Usuario con rol "usuario" solicita acceso a app restringida.        | Permiso denegado, evento registrado en audit_log.                                                 |
| TC-0104-USUARIOS-013 | Auditoría: cambio de rol registra datos correctos. | admin cambia rol de user_456 de "usuario" a "coordinador".          | audit_log contiene admin_id, user_id, rol_anterior="usuario", rol_nuevo="coordinador", timestamp. |
| TC-0104-USUARIOS-014 | Editar perfil con datos válidos.                   | `{ name: "Nuevo Nombre" }`                                          | profiles actualizado, retorna perfil modificado.                                                  |

## 4. Cobertura objetivo

- Cobertura global: >= 70%
- Modulos criticos: >= 85% (autenticación, roles, permisos, auditoría)

## 5. Criterios de aprobación

- [ ] Tests unitarios criticos en verde (TC-001 al TC-011).
- [ ] Cobertura minima alcanzada.
- [ ] Trazabilidad FR -> TC actualizada.

## 6. Comandos adicionales

```bash
pnpm --filter=usuario test:unit
USUARIO_RUN_INTEGRATION=true pnpm --filter=usuario test:integration
USUARIO_E2E_BASE_URL=http://localhost:4321 pnpm --filter=usuario test:e2e
```
