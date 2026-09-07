---
tags:
  - proyecto/fosforo
  - frd
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-frd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `RB-NOTIF-*`, `UC-NOTIF-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Casos de uso

| ID           | Caso de uso                    | Flujo principal                                                                                                                                                                                       | Excepciones                                                                                                                                                                          |
| ------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UC-NOTIF-001 | Crear plantilla                | Editor accede al panel → define nombre, canal, subject, body y variables → guarda como borrador → `POST /api/notifications/templates`                                                                 | Validación de variables → 422; permiso insuficiente → 403; nombre duplicado → 409                                                                                                    |
| UC-NOTIF-002 | Versionar y publicar plantilla | Editor revisa una plantilla → crea nueva versión → publica → la versión anterior queda inmutable → `POST /api/notifications/templates` con versión nueva                                              | Versión duplicada → 409; plantilla no encontrada → 404; permiso insuficiente → 403                                                                                                   |
| UC-NOTIF-003 | Enviar notificación            | App consumidora llama `POST /api/notifications` con `event_id`, `template_id`, `channel`, `recipient`, `variables` → sistema valida → encola → procesa cola → envía por canal → registra trazabilidad | `event_id` duplicado → 200 con resultado previo (idempotencia); plantilla no encontrada → 404; variables faltantes → 422; preferencia opt-out → 200 sin envío (excepto obligatorios) |
| UC-NOTIF-004 | Procesar cola                  | Worker de Edge Function procesa `notification_queue` → toma mensajes `pending` → envía por canal → actualiza estado en `notification_events` → si falla, programa reintento con backoff               | Sin mensajes pendientes → idle; proveedor de canal caído → reintento; 3 fallos → `failed`                                                                                            |
| UC-NOTIF-005 | Consultar preferencias         | Usuario autenticado → `GET /api/notifications/preferences/{user_id}` → sistema devuelve preferencias por canal y categoría                                                                            | Sesión expirada → 401; acceso a preferencias ajenas → 403; usuario no encontrado → 404                                                                                               |
| UC-NOTIF-006 | Actualizar preferencias        | Usuario modifica preferencias → `PUT /api/notifications/preferences/{user_id}` → sistema valida y actualiza → se respeta en próximo envío                                                             | Categoría inválida → 422; canal inválido → 422; acceso a preferencias ajenas → 403                                                                                                   |
| UC-NOTIF-007 | Ver trazabilidad               | Editor/admin consulta `notification_events` por `event_id` o destinatario → filtra por estado (pending, sent, delivered, failed, opened) → obtiene historial                                          | Permiso insuficiente → 403; sin resultados → estado `empty`                                                                                                                          |
| UC-NOTIF-008 | Listar plantillas              | App consumidora o editor → `GET /api/notifications/templates` → sistema devuelve plantillas con versión publicada activa                                                                              | Sin plantillas → estado `empty`; permiso insuficiente → 403                                                                                                                          |

## 3. Reglas de negocio

| ID           | Regla                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RB-NOTIF-001 | Las plantillas son versionadas: una vez publicada una versión, no se puede editar; solo se puede crear una nueva versión. La versión publicada se usa en todos los envíos.     |
| RB-NOTIF-002 | Las preferencias del usuario respetan envíos obligatorios de seguridad y comprobantes: un usuario no puede desuscibirse de notificaciones obligatorias (categoría `security`). |
| RB-NOTIF-003 | La idempotencia se garantiza por `event_id`: un mismo `event_id` no se procesa dos veces; se retorna el resultado del primer procesamiento.                                    |
| RB-NOTIF-004 | Los reintentos máximos son 3 con backoff exponencial (10s, 30s, 90s); tras el tercer fallo el mensaje se marca como `failed` en `notification_events`.                         |
| RB-NOTIF-005 | La PII (email del destinatario, payload con datos personales) no se loguea en logs de canal; solo se almacena en `notification_events` con acceso restringido por RLS.         |
| RB-NOTIF-006 | Solo roles `editor` y `admin` pueden crear, versionar y publicar plantillas; las apps consumidoras solo pueden leer plantillas publicadas.                                     |
| RB-NOTIF-007 | El canal de envío se valida antes de encolar: si el canal no está soportado (`email`, `push`, `in-app`), se rechaza con 422.                                                   |
| RB-NOTIF-008 | Si el usuario tiene preferencia `opted_in: false` para el canal y categoría dados, el sistema no envía la notificación (excepto categoría `security`).                         |

## 4. Validaciónes y errores esperados

| Contexto                | Validación                                                           | Error                             |
| ----------------------- | -------------------------------------------------------------------- | --------------------------------- |
| Enviar notificación     | `event_id` único (idempotencia)                                      | 200 con resultado previo (no 409) |
| Enviar notificación     | `template_id` existe y está publicada                                | 404 Not Found                     |
| Enviar notificación     | `channel` es válido (`email`, `push`, `in-app`)                      | 422 Unprocessable Entity          |
| Enviar notificación     | `recipient` tiene formato válido (email válido para canal email)     | 422 Unprocessable Entity          |
| Enviar notificación     | `variables` contiene todas las variables requeridas por la plantilla | 422 Unprocessable Entity          |
| Enviar notificación     | `event_id` ya procesado                                              | 200 OK con resultado previo       |
| Crear plantilla         | Nombre no vacío, canal válido, body no vacío                         | 422 Unprocessable Entity          |
| Crear plantilla         | Nombre duplicado para el mismo canal                                 | 409 Conflict                      |
| Publicar plantilla      | Solo roles `editor` o `admin`                                        | 403 Forbidden                     |
| Actualizar preferencias | Categoría y canal válidos dentro de los soportados                   | 422 Unprocessable Entity          |
| Actualizar preferencias | Usuario solo puede editar sus propias preferencias                   | 403 Forbidden                     |
| Consultar trazabilidad  | Solo roles `editor` o `admin`                                        | 403 Forbidden                     |

## 5. Estados funcionales

- Estado `pending`: Mensaje encolado en `notification_queue`, esperando procesamiento por el worker.
- Estado `sent`: Mensaje enviado al proveedor del canal (SMTP, push service, in-app renderizado); confirmado por el proveedor.
- Estado `delivered`: Mensaje entregado al destinatario (confirmado por webhook del proveedor de email).
- Estado `failed`: Mensaje fallido tras 3 reintentos; visible para soporte y observabilidad.
- Estado `opened`: Mensaje abierto por el destinatario (tracking de open en email via pixel o click link).
- Estado `loading`: Cargando plantillas, preferencias o trazabilidad en la UI.
- Estado `empty`: Sin plantillas publicadas, sin eventos de notificación o sin preferencias para mostrar.
- Estado `error`: Falla de validación, falla del proveedor de canal o error de red; mostrar mensaje de error con opción de reintento.

## 6. Trazabilidad FRD -> SRS

| FRD          | SRS                        |
| ------------ | -------------------------- |
| RB-NOTIF-001 | FR-NOTIF-001               |
| RB-NOTIF-002 | FR-NOTIF-003               |
| RB-NOTIF-003 | FR-NOTIF-007               |
| RB-NOTIF-004 | FR-NOTIF-004               |
| RB-NOTIF-005 | NFR-NOTIF-004              |
| RB-NOTIF-006 | NFR-NOTIF-006              |
| RB-NOTIF-007 | FR-NOTIF-002               |
| RB-NOTIF-008 | FR-NOTIF-003               |
| UC-NOTIF-001 | FR-NOTIF-001               |
| UC-NOTIF-002 | FR-NOTIF-001               |
| UC-NOTIF-003 | FR-NOTIF-006, FR-NOTIF-007 |
| UC-NOTIF-004 | FR-NOTIF-004, FR-NOTIF-005 |
| UC-NOTIF-005 | FR-NOTIF-003               |
| UC-NOTIF-006 | FR-NOTIF-003               |
| UC-NOTIF-007 | FR-NOTIF-005               |
| UC-NOTIF-008 | FR-NOTIF-001               |
