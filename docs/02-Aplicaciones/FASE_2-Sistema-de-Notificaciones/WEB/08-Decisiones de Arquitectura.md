---
tags:
  - proyecto/fosforo
  - arquitectura
  - decisiones
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
---

# Decisiones de Arquitectura - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto

- Plataforma objetivo: WEB.
- Alcance de esta decision: Arquitectura del Sistema de Notificaciones del ecosistema Fósforo, incluyendo plantillas versionadas, cola de envíos, preferencias, trazabilidad, idempotencia y API para apps consumidoras.
- Stack base: Astro 6 SSR + React 19 + Tailwind CSS v4 + Supabase (PostgreSQL, Auth, RLS, Edge Functions) + `@repo/ui` + `@repo/notification-core`.

## Funcionalidades generales obligatorias

- Plantillas versionadas con variables Mustache/Handlebars por canal (email, push, in-app).
- Cola de envíos persistente en PostgreSQL con reintentos y backoff exponencial.
- Preferencias de usuario por canal y categoría con RLS.
- Trazabilidad por mensaje (pending, sent, delivered, failed, opened).
- Idempotencia por `event_id` para evitar envíos duplicados.
- API REST para apps consumidoras (`POST /api/notifications`, `GET/PUT /api/notifications/preferences/{user_id}`).
- Panel de administración de plantillas para editores/admin.
- Integración con app Log (RUM) para observabilidad de envíos.

## Decisiones clave

| ID            | Decision                                                                 | Motivo                                                                                                                                       | Impacto                                                                                         |
| ------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| ADR-NOTIF-001 | Usar Supabase Edge Functions para envíos async                           | Los envíos a proveedores externos (SMTP, push) son latentes; Edge Functions permite procesar la cola de forma asíncrona sin bloquear la API. | Los workers de cola corren en Edge Functions; dependencia de Supabase para procesamiento async. |
| ADR-NOTIF-002 | Cola de envíos en PostgreSQL (`notification_queue`)                      | PostgreSQL ya es el stack del ecosistema; usarlo como cola evita introducir Redis/RabbitMQ/SQS y simplifica el MVP.                          | La cola es transaccional con `notification_events`; no requiere infraestructura adicional.      |
| ADR-NOTIF-003 | Plantillas con variables Mustache/Handlebars                             | Mustache/Handlebars es simple, seguro (sin evaluación de código) y ampliamente adoptado para templates de email/push.                        | Las plantillas se renderizan server-side; las variables se validan antes del envío.             |
| ADR-NOTIF-004 | Preferencias en tabla PostgreSQL con RLS                                 | Las preferencias son datos del usuario; RLS garantiza que un usuario solo gestione las suyas. PostgreSQL ya está en el stack.                | `notification_preferences` con RLS por `user_id`; categoría `security` siempre opt-in.          |
| ADR-NOTIF-005 | Idempotencia por `event_id` con restricción UNIQUE                       | Las apps consumidoras pueden reintentar un envío sin riesgo de duplicación; `event_id` es UNIQUE en `notification_events`.                   | Un `event_id` duplicado retorna el resultado previo; no se encola un segundo envío.             |
| ADR-NOTIF-006 | `@repo/notification-core` como paquete compartido para apps consumidoras | Unifica la lógica de llamadas a la API de notificaciones; las apps consumidoras no implementan HTTP calls manualmente.                       | Un único punto de mantenimiento; cambio de contrato de API sin tocar apps consumidoras.         |
| ADR-NOTIF-007 | Backoff exponencial para reintentos (10s, 30s, 90s, máximo 3)            | Evita saturar al proveedor de canal tras fallos transitorios; 3 intentos cubren la mayoría de fallos recuperables.                           | Mensajes con 3 fallos se marcan `failed` y quedan visibles para soporte.                        |

## Alternativas consideradas

- **Alternativa A — Cola externa (RabbitMQ / AWS SQS):** Sistemas de cola dedicados con mayor madurez para retry y DLQ. Descartado para MVP por simplicidad: PostgreSQL ya está en el stack y la cola transaccional con `notification_queue` es suficiente para el volumen esperado. Se puede migrar a SQS/RabbitMQ en post-MVP si el volumen lo justifica.
- **Alternativa B — Servicio externo de notificaciones (SendGrid / OneSignal):** Servicios que manejan plantillas, preferencias y multicanal. Descartado para MVP por dependencia externa, costo y control limitado sobre preferencias y trazabilidad; se prefiere construir sobre Supabase (PostgreSQL + Edge Functions) para mantener el stack unificado.
- **Alternativa C — Render de plantillas en el cliente (client-side):** Renderizar plantillas en el navegador del destinatario. Descartado por seguridad (exposición de lógica de plantillas) y porque los envíos por email/push requieren render server-side.

## Riesgos y mitigaciónes

- **Riesgo 1 — Dependencia de Supabase Edge Functions para procesamiento de cola:** Si Edge Functions no está disponible, la cola se acumula en PostgreSQL. Mitigación: la cola persistente sobrevive a reinicios; al restablecerse Edge Functions, los workers reanudan el procesamiento.
- **Riesgo 2 — Volumen de cola satura PostgreSQL:** Si el volumen de notificaciones crece, `notification_queue` puede impactar el rendimiento de PostgreSQL. Mitigación: monitoreo de longitud de cola, archivado de items `done` tras 30 días, migración a SQS/RabbitMQ en post-MVP si es necesario.
- **Riesgo 3 — Plantilla con variable faltante genera contenido inválido:** Una plantilla publicada sin validar todas las variables puede producir emails con contenido roto. Mitigación: validación de variables al crear/publicar plantilla; test de render antes de publicar; fallback a valor por defecto.
- **Riesgo 4 — Preferencias no respetadas:** Un bug en la lógica de preferencias puede enviar notificaciones a usuarios que se desuscribieron. Mitigación: tests automatizados que verifican preferencias; validación server-side antes de cada envío; categoría `security` siempre opt-in.
