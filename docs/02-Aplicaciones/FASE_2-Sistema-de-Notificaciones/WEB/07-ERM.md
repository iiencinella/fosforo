---
tags:
  - proyecto/fosforo
  - erm
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-erm
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
---

# ERM - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `ERM-NOTIF-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Registro de riesgos y errores

| ID            | Riesgo/Error                                                   | Tipo   | Severidad | Mitigación                                                                                                                                                | Owner                    |
| ------------- | -------------------------------------------------------------- | ------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| ERM-NOTIF-001 | Fallo del proveedor de email (SMTP/Resend)                     | Riesgo | P2        | Cola con reintentos (máximo 3) y backoff exponencial; monitoreo de salud del proveedor; alerta si tasa de fallo > 5%.                                     | Iván Ezequiel Iencinella |
| ERM-NOTIF-002 | Cola de envíos saturada por pico de notificaciones             | Riesgo | P3        | Backoff exponencial; monitoreo de longitud de cola; escalado de workers de Edge Functions; alerta si cola > 1000 items.                                   | Iván Ezequiel Iencinella |
| ERM-NOTIF-003 | Plantilla con variable faltante genera contenido inválido      | Riesgo | P3        | Validación de variables al crear/publicar plantilla; fallback a valor por defecto; test de render antes de publicar.                                      | Iván Ezequiel Iencinella |
| ERM-NOTIF-004 | Preferencias de usuario no respetadas (spam)                   | Riesgo | P2        | Validación server-side antes de cada envío; tests automatizados que verifican preferencias; categoría `security` siempre opt-in.                          | Iván Ezequiel Iencinella |
| ERM-NOTIF-005 | PII expuesta en logs de canal                                  | Riesgo | P2        | PII no se loguea en logs de envío; `notification_events.payload` con acceso restringido por RLS; revisión de logs de Edge Functions.                      | Iván Ezequiel Iencinella |
| ERM-NOTIF-006 | Idempotencia fallida (envío duplicado)                         | Riesgo | P3        | Restricción UNIQUE en `notification_events.event_id`; tests de concurrencia para verificar idempotencia.                                                  | Iván Ezequiel Iencinella |
| ERM-NOTIF-007 | Indisponibilidad de Supabase (PostgreSQL o Edge Functions)     | Riesgo | P1        | Dependencia crítica; SLA de Supabase 99.95%; monitoreo de salud; plan de rollback a modo degraded (cola persistente en PostgreSQL sobrevive a reinicios). | Iván Ezequiel Iencinella |
| ERM-NOTIF-008 | Webhook de entrega no recibido (estado `sent` sin `delivered`) | Error  | P3        | Timeout de 24h para actualizar estado; si no llega webhook, el estado queda en `sent` (no `delivered`) y se reporta en observabilidad.                    | Iván Ezequiel Iencinella |

## 3. Runbooks

- P1 (ERM-NOTIF-007): `docs/02-Aplicaciones/FASE_2-Sistema-de-Notificaciones/WEB/runbooks/P1.md` (a crear)
- P2 (ERM-NOTIF-001, ERM-NOTIF-004, ERM-NOTIF-005): `docs/02-Aplicaciones/FASE_2-Sistema-de-Notificaciones/WEB/runbooks/P2.md` (a crear)
- P3 (ERM-NOTIF-002, ERM-NOTIF-003, ERM-NOTIF-006, ERM-NOTIF-008): `docs/02-Aplicaciones/FASE_2-Sistema-de-Notificaciones/WEB/runbooks/P3.md` (a crear)

## 4. Continuidad operativa

- **RTO objetivo:** 4h (las notificaciones son importantes pero no críticas para la operaciçon del ecosistema; la cola persistente en PostgreSQL sobrevive a reinicios).
- **RPO objetivo:** 1h (los eventos en `notification_events` y la cola en `notification_queue` se respaldan con los backups automáticos de Supabase PostgreSQL; máxima pérdida aceptable: 1h de eventos).
- **Estrategia de rollback:** En caso de falla de Supabase, la cola de envíos persiste en PostgreSQL; al restablecerse el servicio, los workers de Edge Functions reanudan el procesamiento desde `notification_queue`. Los `event_id` ya procesados no se reenvían (idempotencia). Si el proveedor de email (SMTP/Resend) cae, los mensajes permanecen en cola con backoff exponencial y se reintentan al restablecerse.
- **Dependencia crítica:** Supabase (PostgreSQL + Edge Functions) con SLA 99.95%; proveedor de email (SMTP/Resend) con SLA propio; monitoreo de salud de ambos via dashboard y alertas.
