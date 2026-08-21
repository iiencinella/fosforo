---
tags:
  - proyecto/fosforo
  - owasp
  - seguridad
  - aplicacion/log
type: app-owasp
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-08-21
related:
  - "[[00-README|README Log]]"
  - "[[08-Decisiones de Arquitectura|ADR Log]]"
---

# OWASP - 0105_log

## 1. Ficha

- ID base: `SEC-0105-LOG-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. Baseline aplicable

- Web: OWASP Top 10 (2021) + ASVS Level 2

## 3. Checklist de controles

| ID               | Control                               | Estado    | Evidencia                                                                                     |
| ---------------- | ------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| SEC-0105-LOG-001 | Autenticacion y sesion seguras        | Hecho     | Supabase Auth con JWT; sesion via cookies httpOnly en SSR                                     |
| SEC-0105-LOG-002 | Autorizacion por rol/recurso          | Hecho     | RLS en tabla log_entries; middleware de Astro verifica rol en app_metadata                    |
| SEC-0105-LOG-003 | Validacion y sanitizacion de entradas | Hecho     | Zod schema en API de ingesta y consulta; sanitizacion de texto libre para busqueda            |
| SEC-0105-LOG-004 | Proteccion de datos sensibles         | Hecho     | Metadata de logs no debe contener PII (documentado); transporte HTTPS obligatorio             |
| SEC-0105-LOG-005 | Logging y auditoria de seguridad      | Hecho     | Tabla log_entries audita eventos del sistema; API key usage tracking en last_used_at          |
| SEC-0105-LOG-006 | Rate limiting                         | Hecho     | Limite de 100 requests/min por API key en ingesta; rate limiting Vercel para frontend         |
| SEC-0105-LOG-007 | Seguridad en API keys                 | Hecho     | Almacen con hash SHA-256; desactivacion inmediata via DB; rotacion documentada                |
| SEC-0105-LOG-008 | Proteccion contra CSRF                | Hecho     | Mismo-origin policy; API endpoints de escritura requieren API key (no cookies de sesion)      |
| SEC-0105-LOG-009 | Secure headers                        | Hecho     | Content-Security-Policy, X-Content-Type-Options, Strict-Transport-Security via Astro o Vercel |
| SEC-0105-LOG-010 | Gestion de dependencias               | Hecho*    | Workflow security-audit.yml con pnpm audit --prod --audit-level high (no bloqueante hasta remediar 55 vulns preexistentes) |

Notas de evidencia (2026-08-21):

- SEC-001/002: sesion via cookies httpOnly + middleware SSR; RLS por `app_metadata.role` en migracion core.
- SEC-003: Zod en ingesta y consulta (`logIngestPayloadSchema`, `apiKeySchema`).
- SEC-005: `last_used_at` actualizado al validar API key.
- SEC-006: ventana fija 1 min por key via RPC atomica `check_api_key_rate_limit` (migracion `202608210001`).
- SEC-007: claves generadas por `db/scripts/generate-log-api-keys.js`; solo hashes en DB.
- SEC-008: escritura de ingesta requiere API key, no cookies; logout revoca token server-side.
- SEC-009: CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options y HSTS (prod) en middleware.
- SEC-010: (* ) no bloqueante mientras se remedia el inventario preexistente; volver bloqueante al llegar a cero high/critical.

## 4. Riesgo aceptado

- **Excepcion:** Los logs pueden contener informacion de debug que exponga detalles de implementacion (nombres de tablas, rutas internas) visibles para usuarios dev/ops autenticados.
- **Justificacion:** Los unicos consumidores de esta app son desarrolladores y operaciones del equipo. El acceso esta restringido por autenticacion y RLS. No hay exposcion publica.
- **Aprobado por:** Iván Ezequiel Iencinella
- **Fecha:** 2026-05-26

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad        | Requisito relacionado                              |
| ---------------- | -------------------------------------------------- |
| SEC-0105-LOG-001 | NFR-0105-LOG-004                                   |
| SEC-0105-LOG-002 | NFR-0105-LOG-004, FR-0105-LOG-012, FR-0105-LOG-013 |
| SEC-0105-LOG-003 | NFR-0105-LOG-005, FR-0105-LOG-002                  |
| SEC-0105-LOG-004 | NFR-0105-LOG-004                                   |
| SEC-0105-LOG-005 | NFR-0105-LOG-004                                   |
| SEC-0105-LOG-006 | NFR-0105-LOG-006                                   |
| SEC-0105-LOG-007 | NFR-0105-LOG-005                                   |
