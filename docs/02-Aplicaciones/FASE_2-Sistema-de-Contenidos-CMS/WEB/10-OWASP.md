---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - owasp
  - seguridad
type: app-owasp
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
---

# OWASP - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SEC-CMS-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Baseline aplicable

- Web: OWASP Top 10 + ASVS.
- Supabase: RLS en todas las tablas; Auth con sesiones seguras.

## 3. Checklist de controles

| ID          | Control                                                        | Estado    | Evidencia                                    |
| ----------- | -------------------------------------------------------------- | --------- | -------------------------------------------- |
| SEC-CMS-001 | Autenticación y sesion seguras (Supabase Auth)                 | Pendiente | Integración con Sistema de Logueo            |
| SEC-CMS-002 | Autorización por rol (editor, revisor, admin) con RLS          | Pendiente | Políticas RLS en migración                   |
| SEC-CMS-003 | Validación y sanitización de entradas (Zod en API + cliente)   | Pendiente | Esquemas Zod por content type                |
| SEC-CMS-004 | Proteccion de datos sensibles (RLS en todas las tablas)        | Pendiente | Migración de Supabase                        |
| SEC-CMS-005 | Logging y auditoria de seguridad (content_audit_log + app Log) | Pendiente | Integración con `@repo/api-utils/log-client` |
| SEC-CMS-006 | API key de lectura con rate limiting y rotación                | Pendiente | Middleware de API                            |
| SEC-CMS-007 | Prevención de XSS en render Markdown (sanitización)            | Pendiente | `sanitize-html` o equivalente                |
| SEC-CMS-008 | Prevención de CSRF en panel editorial                          | Pendiente | Tokens CSRF en Astro endpoints               |
| SEC-CMS-009 | Upload de medios con validación de tipo y tamaño               | Pendiente | Middleware de upload                         |
| SEC-CMS-010 | Headers de seguridad (CSP, HSTS, X-Frame-Options)              | Pendiente | Middleware Astro                             |

## 4. Riesgo aceptado

- Excepcion: API key de lectura compartida por app (no por usuario).
- Justificación: Las apps consumen contenido en runtime sin sesión de usuario; el contenido publicado es público.
- Aprobado por: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad   | Requisito relaciónado   |
| ----------- | ----------------------- |
| SEC-CMS-001 | NFR-CMS-004, IR-CMS-001 |
| SEC-CMS-002 | FR-CMS-005, NFR-CMS-004 |
| SEC-CMS-003 | FR-CMS-001, FR-CMS-002  |
| SEC-CMS-005 | IR-CMS-005              |
| SEC-CMS-006 | FR-CMS-006              |
| SEC-CMS-007 | ADR-CMS-005             |
| SEC-CMS-009 | FR-CMS-008, NFR-CMS-006 |
