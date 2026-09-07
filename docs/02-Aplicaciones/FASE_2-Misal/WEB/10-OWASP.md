---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - owasp
  - seguridad
type: app-owasp
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
---

# OWASP - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SEC-MISAL-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Baseline aplicable

- Web: OWASP Top 10 (2021) + ASVS.
- Supabase: RLS en tablas del esquema `misal`; Auth con sesiones seguras.
- RUM: anonimización, consentimiento y DNT (ver app Log).

## 3. Checklist de controles

| ID            | Control                                                      | Estado    | Evidencia                                                                |
| ------------- | ------------------------------------------------------------ | --------- | ------------------------------------------------------------------------ |
| SEC-MISAL-001 | Sesión segura via Supabase Auth (Sistema de Logueo)          | Pendiente | Rutas protegidas con middleware de sesión                                |
| SEC-MISAL-002 | RLS en `misal.favorites` y `misal.preferences` (solo dueño)  | Pendiente | Políticas RLS por user_id                                                |
| SEC-MISAL-003 | RLS en `misal.reports` (insert anónimo, lectura dev/ops)     | Pendiente | Insert-only                                                              |
| SEC-MISAL-004 | Render seguro de contenido CMS (sanitización HTML)           | Pendiente | El CMS entrega Markdown/HTML sanitizado; la app no interpreta HTML crudo |
| SEC-MISAL-005 | Rate limiting en reportes (anti-abuso)                       | Pendiente | Límite por session_hash                                                  |
| SEC-MISAL-006 | Anonimización del reporte (session_hash, sin PII)            | Pendiente | No se guarda IP ni user agent crudo                                      |
| SEC-MISAL-007 | Headers de seguridad (CSP, HSTS, X-Frame-Options)            | Pendiente | Middleware Astro estándar del ecosistema                                 |
| SEC-MISAL-008 | RUM anónimo con consentimiento y DNT                         | Pendiente | SDK `@repo/analytics` con has_consent                                    |
| SEC-MISAL-009 | API keys de CMS/Motor solo en servidor (SSR)                 | Pendiente | Nunca expuestas al cliente                                               |
| SEC-MISAL-010 | Validación de fechas (anti path traversal en `/dia/{fecha}`) | Pendiente | Zod: formato ISO y rango 2000-2100                                       |

## 4. Riesgo aceptado

- Excepcion: Consulta anónima de lecturas (sin sesión).
- Justificación: El contenido litúrgico es público; la sesión solo se requiere para personalización.
- Aprobado por: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad     | Requisito relacionado       |
| ------------- | --------------------------- |
| SEC-MISAL-001 | FR-MISAL-008, IR-MISAL-003  |
| SEC-MISAL-002 | FR-MISAL-008, NFR-MISAL-005 |
| SEC-MISAL-003 | FR-MISAL-010                |
| SEC-MISAL-004 | FR-MISAL-004, RB-MISAL-002  |
| SEC-MISAL-008 | FR-MISAL-009                |
| SEC-MISAL-009 | IR-MISAL-001, IR-MISAL-002  |
| SEC-MISAL-010 | FR-MISAL-002                |
