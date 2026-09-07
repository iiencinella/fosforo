---
tags:
  - proyecto/fosforo
  - erm
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-erm
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Logueo]]"
---

# ERM - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `ERM-AUTH-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Registro de riesgos y errores

| ID           | Riesgo/Error                                          | Tipo   | Severidad | Mitigación                                                                                         | Owner                    |
| ------------ | ----------------------------------------------------- | ------ | --------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| ERM-AUTH-001 | Credencial comprometida (fuga de password)            | Riesgo | P1        | Rate limiting en login, notificación de acceso sospechoso, revocación inmediata de sesiones.       | Iván Ezequiel Iencinella |
| ERM-AUTH-002 | Sesión hijacked (robo de JWT)                         | Riesgo | P2        | Cookies httpOnly + Secure + SameSite; refresh token con expiración corta; revocación server-side.  | Iván Ezequiel Iencinella |
| ERM-AUTH-003 | RLS mal configurada (exposición de datos ajenos)      | Riesgo | P1        | Tests automatizados de RLS por tabla y por rol en CI; revisión de políticas en cada migración.     | Iván Ezequiel Iencinella |
| ERM-AUTH-004 | Refresh token expirado (sesión interrumpida)          | Error  | P3        | Manejo graceful: redirect a login con mensaje "sesión expirada"; no pérdida de datos del usuario.  | Iván Ezequiel Iencinella |
| ERM-AUTH-005 | Federación externa no soportada en MVP                | Riesgo | P3        | Riesgo aceptado: documentado como fuera de alcance del MVP; planificado post-MVP.                  | Iván Ezequiel Iencinella |
| ERM-AUTH-006 | Indisponibilidad de Supabase Auth                     | Riesgo | P1        | Dependencia crítica; SLA de Supabase 99.95%; monitoreo de salud; plan de rollback a modo degraded. | Iván Ezequiel Iencinella |
| ERM-AUTH-007 | Escalación de privilegios (usuario obtiene rol admin) | Riesgo | P1        | RLS bloquea escritura en `roles` para no admin; verificación server-side en cada operación.        | Iván Ezequiel Iencinella |
| ERM-AUTH-008 | Auditoría manipulada (modificación de logs)           | Riesgo | P2        | `auth_audit_log` es solo INSERT; ninguna política RLS permite UPDATE o DELETE.                     | Iván Ezequiel Iencinella |

## 3. Runbooks

- P1 (ERM-AUTH-001, ERM-AUTH-003, ERM-AUTH-006, ERM-AUTH-007): `docs/02-Aplicaciones/FASE_1-Sistema-de-Logueo/WEB/runbooks/P1.md` (a crear)
- P2 (ERM-AUTH-002, ERM-AUTH-008): `docs/02-Aplicaciones/FASE_1-Sistema-de-Logueo/WEB/runbooks/P2.md` (a crear)
- P3 (ERM-AUTH-004, ERM-AUTH-005): `docs/02-Aplicaciones/FASE_1-Sistema-de-Logueo/WEB/runbooks/P3.md` (a crear)

## 4. Continuidad operativa

- **RTO objetivo:** 2h (auth es infraestructura crítica; sin autenticación, ninguna app del ecosistema funciona).
- **RPO objetivo:** 0 (el estado de autenticación y sesiones es gestionado por Supabase Auth; las tablas de dominio (`profiles`, `roles`, `consents`, `auth_audit_log`) se respaldan con los backups automáticos de Supabase PostgreSQL).
- **Estrategia de rollback:** En caso de falla de Supabase Auth, activar modo degraded: las apps consumidoras muestran un mensaje de "mantenimiento de autenticación" y bloquean acceso; al restablecerse Supabase Auth, las sesiones se reanudan sin pérdida de datos.
- **Dependencia crítica:** Supabase Auth (SLA 99.95%); monitoreo de salud del servicio via dashboard y alertas.
