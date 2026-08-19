---
tags:
  - proyecto/fosforo
  - administracion
  - owasp
  - seguridad
  - aplicacion
type: app-owasp
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[08-Decisiones de Arquitectura|Decisiones de Arquitectura Administracion]]"
---

# OWASP - 0107_administracion

## 1. Ficha

- ID base: `SEC-0107-ADMINISTRACION-*`
- Plataforma: WEB
- Owner seguridad: Ivan Ezequiel Iencinella
- Fecha: 2026-05-27

## 2. Baseline aplicable

- Web: OWASP Top 10 2021 + ASVS Nivel 2 (aplicaciones que manejan datos sensibles del ecosistema).
- Datos: clasificacion de datos de iglesias y horarios como "publicos", datos de usuarios del panel como "internos".

## 3. Checklist de controles

| ID                          | Control                                                   | Estado       | Evidencia                                                                |
| --------------------------- | --------------------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| SEC-0107-ADMINISTRACION-001 | Autenticacion y sesion seguras mediante Supabase Auth     | Implementado | Cookie httpOnly `admin_session` + verificacion en cada request           |
| SEC-0107-ADMINISTRACION-002 | Autorizacion por rol/recurso (admin, editor, viewer)      | Implementado | Funciones `requirePageAuth()` y `requireApiAuth()` en cada ruta/endpoint |
| SEC-0107-ADMINISTRACION-003 | Validacion y sanitizacion de entradas en formularios CRUD | Implementado | Zod schemas en servidor (`validators.ts`)                                |
| SEC-0107-ADMINISTRACION-004 | Proteccion de datos sensibles (coordenadas, contactos)    | Implementado | HTTPS en produccion (Vercel), sin exposicion innecesaria                 |
| SEC-0107-ADMINISTRACION-005 | Logging y auditoria de seguridad (admin_audit_log)        | Implementado | Funcion `createAuditLog()` en cada operacion de escritura                |
| SEC-0107-ADMINISTRACION-006 | Proteccion contra CSRF en operaciones de escritura        | Pendiente    | SameSite cookies configuradas, pendiente validacion adicional            |
| SEC-0107-ADMINISTRACION-007 | Rate limiting en endpoints de autenticacion y creacion    | Pendiente    | Pendiente de implementar en Vercel o middleware                          |
| SEC-0107-ADMINISTRACION-008 | Headers de seguridad (CSP, X-Frame-Options, HSTS)         | Pendiente    | Configuracion en Vercel, pendiente validacion                            |

## 4. Riesgo aceptado

- Excepcion: No se implementa MFA obligatorio en MVP inicial.
- Justificacion: El panel es interno para operadores del ecosistema; el acceso se controla por roles y la base de usuarios es reducida. Se evaluara MFA en fase 2.
- Aprobado por: Ivan Ezequiel Iencinella
- Fecha: 2026-05-27

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad                   | Requisito relacionado       |
| --------------------------- | --------------------------- |
| SEC-0107-ADMINISTRACION-001 | NFR-0107-ADMINISTRACION-003 |
| SEC-0107-ADMINISTRACION-002 | NFR-0107-ADMINISTRACION-003 |
| SEC-0107-ADMINISTRACION-003 | NFR-0107-ADMINISTRACION-003 |
| SEC-0107-ADMINISTRACION-005 | FR-0107-ADMINISTRACION-005  |
