---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-owasp
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# OWASP — Revisión de Seguridad — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Superficie de riesgo

El activo más sensible es **el diario personal** (contenido espiritual íntimo). Secundarios: sesiones autenticadas, integraciones Motor/CMS/Notificaciones con tokens SSR, y telemetría.

## 2. Controles (SEC-LECTIO-001..010)

### SEC-LECTIO-001 — Autenticación obligatoria para el diario

- Toda ruta que lee/escribe `lectio.entries`, `lectio.sessions` o `lectio.preferences` exige sesión válida (Sistema de Logueo, JWT/cookie firmada, expiración de sesiones del ecosistema).
- Sin auth: 401 en API; redirección con `returnTo` en UI. Sin tokens en URLs; cookies `HttpOnly; Secure; SameSite=Lax`.

### SEC-LECTIO-002 — RLS estricta del diario (solo el dueño)

- Políticas `for all using/with check (auth.uid() = user_id)` en las tres tablas (ADR-LECTIO-002); denegar todo lo demás.
- **Ninguna** excepción de roles, sin vistas de backoffice, sin service-role en rutas de aplicación.
- Defense in depth: filtro `user_id` también en queries del servidor (`lib/diario.ts`).
- **Tests de RLS bloqueantes en CI** (TC-LECTIO-008/009) y alerta de usos anómalos (ERM-LECTIO-001).

### SEC-LECTIO-003 — Sanitización de contenido (XSS en entradas)

- El `texto` del diario y los apuntes se renderiza como **texto plano** (sin HTML permitido): escape en render; React lo protege por defecto; prohibido `dangerouslySetInnerHTML` sobre contenido del usuario (lint lo bloquea).
- Exportación: Markdown generado con escapado de atajos peligrosos (sin ejecución de HTML injertado, links solo http/https).

### SEC-LECTIO-004 — Rate limiting

- Limitar por IP + usuario: autoguardado ≤ 30 req/min por paso, export ≤ 5/hora, intentos de sesión ≤ 10/min. 429 con Retry-After. Protege el diario de scraping masivo y abuso de API.

### SEC-LECTIO-005 — Headers de seguridad (por plataforma Astro SSR del ecosistema)

- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, HSTS, `Permissions-Policy` mínima, cookies firmadas `HttpOnly; Secure; SameSite=Lax`.

### SEC-LECTIO-006 — API keys solo SSR

- Claves del Motor, CMS, Notificaciones, Supabase (service-role solo para migraciones) viven en **variables de entorno del servidor**; nunca en bundle cliente. Consultas al cliente usan anon key + sesión de usuario con RLS.

### SEC-LECTIO-007 — RUM anónimo sin contenido del diario

- Whitelist de eventos (`lectio.sesion.iniciada|paso.completado|sesion.completada`) con `(user_id_hash, fecha, paso, fuente_lecturas)`; **nunca** texto del diario ni derivados (ADR-LECTIO-007, TC-LECTIO-015).
- Consentimiento de telemetría respetado (UC-LECTIO-007); `user_id` nunca en claro (hash).

### SEC-LECTIO-008 — Validación de fechas

- `[fecha]` validada estrictamente con regex `^\d{4}-\d{2}-\d{2}$` + calendarización real (no 2026-02-30); fuera de rango → 404. Evita path traversal/suplantación y consultas a fechas nonsense.

### SEC-LECTIO-009 — Exportación segura (solo dueño)

- `/api/diario/export`: JWT requerido; consulta filtra `user_id = auth.uid()` a nivel SQL (RLS); **sin** parámetro de usuario ajeno; archivo en memoria; log del evento sin contenido; limitada por SEC-LECTIO-004.

### SEC-LECTIO-010 — Content Security Policy (CSP)

- `default-src 'self'`; `script-src 'self'` (más hashes para islands inline si fuera necesario); `connect-src` limitado a dominios Supabase/Motor/CMS/RUM; `frame-ancestors 'none'`; `object-src 'none'`; report-uri al Log.

## 3. Matriz rápida de amenazas

| Amenaza                               | Control                                         | Severidad residual |
| ------------------------------------- | ----------------------------------------------- | ------------------ |
| Lectura del diario por intruso/rol    | SEC-LECTIO-001/002 + tests RLS                  | Muy baja           |
| XSS vía contenido del diario/lecturas | SEC-LECTIO-003 + CSP (010)                      | Baja               |
| Scraping/abuso de API                 | SEC-LECTIO-004 + rate limiting plataforma       | Baja               |
| Fuga por telemetría/logs              | SEC-LECTIO-007 + TC-LECTIO-015                  | Muy baja           |
| Exposición de claves                  | SEC-LECTIO-006 (SSR-only)                       | Baja               |
| Manipulación de fechas                | SEC-LECTIO-008                                  | Baja               |
| Clickjacking/CSRF                     | Cookies SameSite + SI010 + frame-ancestors none | Baja               |

## 4. Procesos

- Revisión de seguridad en PR para cambios en `lib/diario.ts`, políticas RLS o eventos RUM (requiere sign-off de security sobre SEC-LECTIO-002/007).
- Pentest de RLS integrado en CI con fixtures de dos usuarios; runbook de incidente en `07-ERM.md` (RUN-LEX, RTO 2 h).
- Rotación trimestral de claves SSR; revisión de dependencias con `pnpm audit` en CI.
