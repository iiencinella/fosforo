---
tags:
  - proyecto/fosforo
  - portal
  - runbook
  - operaciones
type: app-runbook
area: aplicaciones
status: vigente
created: 2026-08-25
updated: 2026-08-25
related:
  - "[[00-README|0101 Portal]]"
---

# Runbook Operativo - 0101 Portal

## Ficha

- Deployment: Vercel, proyecto `fosforo-portal` (`https://fosforo-portal.vercel.app`).
- Datos: Supabase PostgreSQL — `portal_contact_requests`, `portal_feedback_items`, `portal_submission_audit`.
- Email: Resend (`RESEND_API_KEY`, `FEEDBACK_EMAIL_TO`). Sin configuración, el envío persiste en DB pero no notifica por email (warn en log).

## Verificación diaria (o post-alerta)

1. Health: `GET /api/health` → esperado `200 {"status":"ok"}`.
   - `503 degraded` con `supabase: unavailable`: faltan variables de entorno o Supabase inalcanzable. Estado actual conocido hasta configurar `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` en Vercel.
2. Formulario contacto: POST a `/api/contact` con JSON válido → `200 {"success":true}` y fila nueva en `portal_contact_requests`.
3. Formulario feedback: POST a `/api/feedback` → `200 {"success":true}` y fila en `portal_feedback_items`.

## Protección anti-abuso

- Rate limit por IP: 5 requests/minuto sobre `/api/contact` y `/api/feedback` (ventana fija en memoria).
- **Limitación conocida:** el contador vive en cada instancia serverless; un atacante distribuido puede multiplicar la cuota. El limitador distribuido (Upstash/Vercel KV) queda como pendiente del MVP.

## Problemas conocidos

- Health 500 histórico resuelto: ahora cualquier falta de configuración degrada a 503 (ver `src/pages/api/health.ts`).
- Emails desde dominio `onboarding@resend.dev`: migrar a dominio propio cuando Resend esté verificado para fosforo.

## Escalado

1. Envíos sin persistencia → revisar logs `[portal-contact] persistence failed`; validar service role key y RLS de las tablas portal_*.
2. Spam sostenido → activar limitador distribuido o desafío (Turnstile) antes de escalar.
3. Sin resolución en 30 min → abrir issue con logs del panel Log (app `portal`).
