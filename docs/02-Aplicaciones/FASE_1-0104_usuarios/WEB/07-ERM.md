---
tags:
  - proyecto/fosforo
  - usuarios
  - erm
  - aplicación
type: app-erm
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
---

# ERM - 0104_usuarios

## 1. Ficha

- ID base: `ERM-0104-USUARIOS-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-05-25

## 2. Registro de riesgos y errores

| ID                    | Riesgo/Error                                                                   | Tipo   | Severidad | Mitigación                                                                                                          | Owner   |
| --------------------- | ------------------------------------------------------------------------------ | ------ | --------- | ------------------------------------------------------------------------------------------------------------------- | ------- |
| ERM-0104-USUARIOS-001 | Caída de Supabase Auth que impide login/registro.                              | Riesgo | P1        | Monitoreo de disponibilidad, fallback a caché de sesiones activas, comunicación inmediata a usuarios.               | Técnico |
| ERM-0104-USUARIOS-002 | Fuga de tokens JWT por almacenamiento inseguro en cliente.                     | Riesgo | P1        | Almacenar JWT en httpOnly cookies para web, SecureStore para móvil, rotación de refresh tokens.                     | Técnico |
| ERM-0104-USUARIOS-003 | Asignación incorrecta de rol por error humano o bug.                           | Error  | P2        | Audit_log permite trazabilidad y rollback manual; validaciones en backend antes de persistir cambios.               | Técnico |
| ERM-0104-USUARIOS-004 | Ataque de fuerza bruta sobre endpoint de login.                                | Riesgo | P1        | Rate limiting por IP, bloqueo temporal tras N intentos fallidos, CAPTCHA opcional post-MVP.                         | Técnico |
| ERM-0104-USUARIOS-005 | Pérdida de datos de auditoría por saturación de audit_log.                     | Riesgo | P2        | Particionamiento por fecha, rotación y archivado de registros antiguos, límite de tamaño con alerta.                | Técnico |
| ERM-0104-USUARIOS-006 | Inconsistencia entre auth.users y public.profiles por fallo en trigger o sync. | Error  | P2        | Trigger de base de datos `ON INSERT auth.users` que cree profiles automáticamente; job de reconciliación periódico. | Técnico |
| ERM-0104-USUARIOS-007 | Enlace de recuperación de contraseña interceptado.                             | Riesgo | P1        | Enlace de un solo uso con expiración (15 min), enviado solo al email registrado, invalidación tras uso.             | Técnico |

## 3. Runbooks

- P1: `docs/02-Aplicaciones/FASE_1-0104_usuarios/WEB/runbooks/P1-auth-outage.md` — procedimiento ante caída de Supabase Auth o imposibilidad de login.
- P2: `docs/02-Aplicaciones/FASE_1-0104_usuarios/WEB/runbooks/P2-role-misassignment.md` — corrección de asignación incorrecta de roles.
- P3: `docs/02-Aplicaciones/FASE_1-0104_usuarios/WEB/runbooks/P3-audit-log-full.md` — gestión de saturación de audit_log.

## 4. Continuidad operativa

- RTO objetivo: menos de 4 horas para restauración de servicio de autenticación.
- RPO objetivo: menos de 1 hora para datos críticos (perfiles, roles, auditoría).
- Estrategia de rollback: mantener la versión anterior del deploy en Vercel con feature flags para deshabilitar cambios recientes; restauración de base de datos desde backup point-in-time de Supabase.
