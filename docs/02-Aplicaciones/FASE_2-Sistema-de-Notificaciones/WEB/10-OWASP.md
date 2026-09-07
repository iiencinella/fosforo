---
tags:
  - proyecto/fosforo
  - owasp
  - seguridad
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-owasp
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
---

# OWASP - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SEC-NOTIF-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Baseline aplicable

- Web: OWASP Top 10 (2021) + ASVS.
- Mobile: OWASP MASVS/MSTG (no aplica en MVP; push nativo mobile es post-MVP).
- Desktop: ASVS + hardening del framework (no aplica).

## 3. Checklist de controles

| ID            | Control                                                                                          | Estado    | Evidencia                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| SEC-NOTIF-001 | Autenticación para panel de plantillas y trazabilidad — A01:2021 Broken Access Control           | Pendiente | Solo roles `editor` y `admin` acceden a `POST /api/notifications/templates` y `GET /api/notifications/events`; ver ADR-NOTIF-004 |
| SEC-NOTIF-002 | RLS en `notification_preferences` y `notification_templates` — A01:2021 Broken Access Control    | Pendiente | RLS en `notification_preferences` (solo usuario edita las suyas) y `notification_templates` (solo editor/admin escriben)         |
| SEC-NOTIF-003 | Validación de payload en `POST /api/notifications` — A03:2021 Injection                          | Pendiente | Validación server-side de `event_id`, `template_id`, `channel`, `recipient`, `variables`; TypeScript types; SQL via Supabase SDK |
| SEC-NOTIF-004 | PII no en logs de canal — A02:2021 Cryptographic Failures                                        | Pendiente | `notification_events.payload` con RLS; logs de Edge Functions sin PII; solo destinatario en `notification_events`                |
| SEC-NOTIF-005 | Rate limiting en `POST /api/notifications` — A07:2021 Identification and Authentication Failures | Pendiente | Rate limiting por app consumidora (API key o JWT); máximo de eventos por minuto configurable                                     |
| SEC-NOTIF-006 | Headers de seguridad — A05:2021 Security Misconfiguration                                        | Pendiente | CSP, HSTS, X-Frame-Options, X-Content-Type-Options en Astro SSR; configuración de headers en middleware                          |
| SEC-NOTIF-007 | Idempotencia por `event_id` — A08:2021 Software and Data Integrity Failures                      | Pendiente | Restricción UNIQUE en `notification_events.event_id`; un `event_id` duplicado retorna resultado previo sin nuevo envío           |
| SEC-NOTIF-008 | Saneamiento de plantillas (Mustache/Handlebars) — A03:2021 Injection                             | Pendiente | Mustache/Handlebars escapan HTML por defecto; las plantillas se renderizan server-side sin evaluación de código arbitrario       |
| SEC-NOTIF-009 | Protección de datos sensibles en `notification_events` — A02:2021 Cryptographic Failures         | Pendiente | `payload` y `recipient` con acceso restringido por RLS; solo el usuario o editor/admin pueden ver sus eventos                    |
| SEC-NOTIF-010 | Auditoría de cambios de plantillas — A09:2021 Security Logging and Monitoring Failures           | Pendiente | Toda creación, versionado y publicación de plantilla se registra con `created_by` y timestamp; inmutable tras publicación        |

## 4. Riesgo aceptado

- **Excepción:** Push nativo mobile (FCM/APNs) no se incluye en el MVP; el MVP cubre push web.
- **Justificación:** El MVP prioriza email, push web e in-app. Push nativo mobile requiere configuración adicional (certificados, provisioning, gestion de tokens por dispositivo) que se planifica post-MVP.
- **Aprobado por:** Iván Ezequiel Iencinella
- **Fecha:** 2026-09-05

- **Excepción:** SMS como canal de envío no se incluye en el MVP.
- **Justificación:** SMS requiere un proveedor adicional (costo por mensaje, regulación por país, opt-in explícito). Se planifica post-MVP con evaluación de proveedor y compliance.
- **Aprobado por:** Iván Ezequiel Iencinella
- **Fecha:** 2026-09-05

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad     | Requisito relaciónado        |
| ------------- | ---------------------------- |
| SEC-NOTIF-001 | NFR-NOTIF-006                |
| SEC-NOTIF-002 | NFR-NOTIF-005                |
| SEC-NOTIF-003 | FR-NOTIF-006                 |
| SEC-NOTIF-004 | NFR-NOTIF-004                |
| SEC-NOTIF-005 | FR-NOTIF-006, NFR-NOTIF-001  |
| SEC-NOTIF-006 | NFR-NOTIF-001                |
| SEC-NOTIF-007 | FR-NOTIF-007                 |
| SEC-NOTIF-008 | FR-NOTIF-001, NFR-NOTIF-003  |
| SEC-NOTIF-009 | NFR-NOTIF-004, NFR-NOTIF-005 |
| SEC-NOTIF-010 | FR-NOTIF-001                 |
