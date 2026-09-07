---
tags:
  - proyecto/fosforo
  - arquitectura
  - flujos
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

# Flujos y Secuencias - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Objetivo

Describir cómo interactúan las apps consumidoras, los usuarios finales y el sistema con las funcionalidades principales del Sistema de Notificaciones, detallando los flujos de envío, cola de procesamiento, plantillas y preferencias.

## Flujo principal

1. Una app consumidora (CMS, Misal, Oraciones, etc.) necesita notificar a un usuario.
2. La app llama `POST /api/notifications` con `event_id`, `template_id`, `channel`, `recipient`, `variables`.
3. El sistema valida el payload: `event_id` no duplicado (idempotencia), `template_id` existe y está publicada, `channel` es válido, `variables` completas.
4. El sistema consulta las preferencias del usuario (`notification_preferences`); si el usuario tiene `opted_in: false` para el canal y categoría (y no es categoría `security`), se omite el envío y se retorna 200 sin envío.
5. El sistema renderiza la plantilla con las variables (Mustache/Handlebars).
6. El sistema encola el mensaje en `notification_queue` con estado `pending` y registra el evento en `notification_events`.
7. Un worker de Edge Function procesa la cola: toma mensajes `pending`, envía por el canal correspondiente (email SMTP, push web, in-app) y actualiza el estado en `notification_events` (`sent` o `failed`).
8. Si el envío falla, el worker programa un reintento con backoff exponencial (10s, 30s, 90s); tras 3 fallos, el estado pasa a `failed`.
9. El proveedor de email envía un webhook de entrega/apertura; el sistema actualiza el estado a `delivered` u `opened` en `notification_events`.
10. Los eventos de envío (encolado, enviado, entregado, fallido, abierto) se envían a la app Log (RUM) para observabilidad.

## Flujos secundarios

- **Flujo A — Actualización de preferencias:** Usuario accede a sus preferencias → `GET /api/notifications/preferences/{user_id}` → cambia opt-in/opt-out por canal y categoría → `PUT /api/notifications/preferences/{user_id}` → se respeta en el próximo envío.
- **Flujo B — Creación y publicación de plantilla:** Editor accede al panel → define nombre, canal, subject, body y variables → guarda borrador → revisa → crea versión → publica → la versión anterior queda inmutable → `POST /api/notifications/templates`.
- **Flujo C — Reintento de mensaje fallido:** Un mensaje en estado `failed` puede ser reencolado manualmente por un admin via el panel de administración → el sistema lo reinserta en `notification_queue` con estado `pending` y reinicia el contador de intentos.
- **Flujo D — Consulta de trazabilidad:** Editor/admin consulta `notification_events` por `event_id` o destinatario → filtra por estado → obtiene historial completo de un mensaje (pendiente, enviado, entregado, fallido, abierto).

## Secuencias clave

### Secuencia 1 - Envío de notificación

1. App consumidora: Construye el payload con `event_id`, `template_id`, `channel`, `recipient`, `variables`.
2. App consumidora: Llama `POST /api/notifications` (directamente o via `@repo/notification-core`).
3. Sistema: Valida `event_id` no duplicado (idempotencia) en `notification_events`.
4. Sistema: Valida `template_id` existe y está publicada en `notification_templates`.
5. Sistema: Valida `channel` es soportado y `variables` contiene todas las requeridas por la plantilla.
6. Sistema: Consulta `notification_preferences` del destinatario para el canal y categoría.
7. Sistema: Si `opted_in: false` (y no es categoría `security`), retorna 200 sin envío y termina.
8. Sistema: Renderiza la plantilla con las variables (Mustache/Handlebars).
9. Sistema: Inserta el evento en `notification_events` con estado `pending` y encola en `notification_queue`.
10. Sistema: Retorna 202 Accepted con el `event_id` y estado `pending`.
11. Worker (Edge Function): Toma el mensaje de `notification_queue`, envía por el canal (SMTP/push/in-app).
12. Worker: Actualiza `notification_events` a `sent` si el envío fue exitoso o programa reintento si falló.
13. Worker: Envía evento de envío a app Log (RUM) para observabilidad.

### Secuencia 2 - Procesamiento de cola con reintentos

1. Worker (Edge Function): Sondea `notification_queue` para mensajes en estado `pending` con `next_retry_at` <= now().
2. Worker: Toma el mensaje, marca `attempts = attempts + 1` y intenta el envío.
3. Proveedor de canal (SMTP/push): Recibe el mensaje y responde (200 OK o error).
4. Worker: Si el envío es exitoso, actualiza `notification_events` a `sent` y elimina de la cola.
5. Worker: Si el envío falla y `attempts < 3`, calcula `next_retry_at` con backoff exponencial (10s, 30s, 90s) y actualiza la cola.
6. Worker: Si `attempts >= 3`, actualiza `notification_events` a `failed`, registra el error y deja el evento visible para soporte.
7. Worker: Envía el resultado (sent/failed) a app Log (RUM) para observabilidad.

### Secuencia 3 - Actualización de preferencias

1. Usuario: Accede a la página de preferencias de notificaciones.
2. Sistema: Carga las preferencias del usuario via `GET /api/notifications/preferences/{user_id}`.
3. Sistema: Muestra las preferencias actuales por canal (email, push, in-app) y categoría.
4. Usuario: Cambia el opt-in/opt-out de uno o más canales/categorías.
5. Usuario: Guarda los cambios via `PUT /api/notifications/preferences/{user_id}`.
6. Sistema: Valida que el usuario solo edite sus propias preferencias (RLS).
7. Sistema: Actualiza `notification_preferences` con el nuevo estado y timestamp.
8. Sistema: Las preferencias se respetan en el próximo envío procesado por la cola.
9. Sistema: Muestra confirmación de guardado exitoso.
