---
tags:
  - proyecto/fosforo
  - srs
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-srs
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Notificaciones-y-Plantillas|SRS Notificaciones y Plantillas]]"
---

# SRS - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `FR-NOTIF-*`, `NFR-NOTIF-*`, `IR-NOTIF-*`, `CA-NOTIF-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Proposito y alcance tecnico

El Sistema de Notificaciones provee la capacidad transversal de envío de comunicaciones del ecosistema Fósforo. Implementa plantillas versionadas con variables, envío multicanal (email, push web, in-app), preferencias de usuario por canal y categoría, cola de envíos con reintentos y backoff exponencial, trazabilidad por mensaje (pendiente, enviado, entregado, fallido, abierto) y una API REST para que las apps consumidoras disparen notificaciones. Es consumido por todas las apps del ecosistema via API o el paquete `@repo/notification-core`.

El alcance técnico del MVP incluye: plantillas con versionado e immutabilidad tras publicación, envío por email (SMTP/Resend), push web (Web Push API) e in-app (notificación en la UI del ecosistema), preferencias opt-in/opt-out por canal y categoría con RLS, cola en PostgreSQL con reintentos máximos de 3, idempotencia por `event_id`, y trazabilidad por mensaje con estados pendiente/sent/delivered/failed/opened.

## 3. Actores

- **App consumidora (sistema):** Cualquier app del ecosistema (CMS, Misal, Oraciones, Santopedia, etc.) que dispara notificaciones via `POST /api/notifications` o `@repo/notification-core`.
- **Usuario final (destinatario):** Persona que recibe notificaciones por email, push web o in-app; gestiona sus preferencias de opt-in/opt-out por canal y categoría.
- **Editor de plantillas (admin):** Usuario con rol `editor` o `admin` que crea, versiona y publica plantillas de notificación mediante el panel de administración.
- **Sistema de Logueo (Auth):** Valida la identidad y permisos de quien solicita envíos (apps consumidoras via API key o JWT) y de quien gestiona plantillas y preferencias.

## 4. Requisitos funcionales

| ID           | Requisito                                                                 | Criterio verificable                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-NOTIF-001 | Plantillas con versionado y variables (Mustache/Handlebars) por canal     | Un editor puede crear una plantilla con variables, versionarla y publicarla; las versiones publicadas son inmutables; el envío usa la última versión publicada.                                                              |
| FR-NOTIF-002 | Envío por canal: email, push web, in-app                                  | Dado un evento de notificación con canal `email`, `push` o `in-app`, el sistema envía el mensaje al canal correspondiente con el contenido de la plantilla renderizada.                                                      |
| FR-NOTIF-003 | Preferencias por usuario: opt-in/opt-out por canal y categoría            | Un usuario puede consultar y modificar sus preferencias via `GET/PUT /api/notifications/preferences/{user_id}`; el sistema respeta las preferencias antes de enviar (excepto envíos obligatorios de seguridad/comprobantes). |
| FR-NOTIF-004 | Cola de envíos con reintentos (máximo 3) y backoff exponencial            | Un mensaje que falla en el envío se reintentá hasta 3 veces con backoff exponencial (10s, 30s, 90s); tras el tercer fallo se marca como `failed` en `notification_events`.                                                   |
| FR-NOTIF-005 | Trazabilidad por mensaje: pendiente, enviado, entregado, fallido, abierto | Cada mensaje en `notification_events` tiene un estado (`pending`, `sent`, `delivered`, `failed`, `opened`); el estado se actualiza tras cada intento de envío y webhook del proveedor.                                       |
| FR-NOTIF-006 | API de eventos `POST /api/notifications` con payload validado             | Las apps consumidoras pueden disparar notificaciones via `POST /api/notifications` con un payload que incluye `event_id`, `template_id`, `channel`, `recipient`, `variables`; el payload se valida antes de encolar.         |
| FR-NOTIF-007 | Idempotencia por `event_id`                                               | Un mismo `event_id` no se procesa dos veces; si se recibe un evento duplicado, se retorna el resultado del primer procesamiento sin encolar un nuevo envío.                                                                  |
| FR-NOTIF-008 | Integración RUM con app Log para observabilidad de envíos                 | Los eventos de envío (encolado, enviado, entregado, fallido, abierto) se envían a la app Log (RUM) para observabilidad, métricas de entrega y detección de anomalías.                                                        |

## 5. Requisitos no funcionales

| ID            | Requisito                                     | Objetivo                                                                                                                                                                               |
| ------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-NOTIF-001 | Disponibilidad del servicio de notificaciones | 99.5% de disponibilidad del endpoint `POST /api/notifications` y de la cola de envíos (excluyendo fallos del proveedor externo).                                                       |
| NFR-NOTIF-002 | Latencia de encolado                          | El tiempo desde `POST /api/notifications` hasta el encolado del mensaje debe ser < 5s en p95.                                                                                          |
| NFR-NOTIF-003 | Plantillas con variables validadas            | Al crear o publicar una plantilla, el sistema valida que las variables requeridas estén definidas; una plantilla con variable faltante no se publica.                                  |
| NFR-NOTIF-004 | PII no en logs de canal                       | Los logs de envío del proveedor (SMTP, push) no contienen PII; la información del destinatario solo se almacena en `notification_events` con acceso restringido.                       |
| NFR-NOTIF-005 | RLS en todas las tablas de notificaciones     | `notification_templates`, `notification_events`, `notification_preferences` y `notification_queue` tienen RLS habilitado; un usuario solo accede a sus propias preferencias y eventos. |
| NFR-NOTIF-006 | Seguridad del panel de plantillas             | Solo roles `editor` y `admin` pueden crear, versionar y publicar plantillas; `GET /api/notifications/templates` es público para apps autenticadas.                                     |

## 6. Integraciónes

| ID           | Integración                                    | Contrato                          | Version |
| ------------ | ---------------------------------------------- | --------------------------------- | ------- |
| IR-NOTIF-001 | Supabase Auth                                  | SDK de Supabase Auth + JWT        | v2      |
| IR-NOTIF-002 | Supabase Edge Functions (envíos async)         | Deno runtime + Supabase SDK       | v1      |
| IR-NOTIF-003 | App Log (RUM/observabilidad)                   | Eventos de envío enviados via API | v1      |
| IR-NOTIF-004 | Apps consumidoras via API                      | REST API (`/api/notifications/*`) | v1      |
| IR-NOTIF-005 | `@repo/notification-core` (paquete compartido) | API TypeScript exportada          | v1      |
| IR-NOTIF-006 | Proveedor de email (SMTP/Resend)               | API SMTP o HTTP del proveedor     | v1      |

## 7. Criterios de aceptación

| ID           | Criterio                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-NOTIF-001 | CMS y Misal pueden disparar notificaciones usando la misma infraestructura via `POST /api/notifications`.                                                       |
| CA-NOTIF-002 | Un usuario puede cambiar sus preferencias (opt-in/opt-out) y el sistema las respeta en el próximo envío, excepto envíos obligatorios de seguridad/comprobantes. |
| CA-NOTIF-003 | Un mensaje fallido se reintentá hasta 3 veces con backoff exponencial; tras el tercer fallo se marca como `failed` y queda visible para soporte.                |
| CA-NOTIF-004 | Un `event_id` duplicado no genera un segundo envío; se retorna el resultado del primer procesamiento (idempotencia).                                            |
| CA-NOTIF-005 | Una plantilla publicada no se puede editar; solo se puede crear una nueva versión, garantizando immutabilidad del contenido enviado.                            |
| CA-NOTIF-006 | Los eventos de envío (encolado, enviado, entregado, fallido, abierto) se envían a la app Log (RUM) para observabilidad.                                         |
| CA-NOTIF-007 | La latencia de encolado es < 5s en p95 y la latencia de envío es < 30s en p95.                                                                                  |
| CA-NOTIF-008 | Las preferencias, eventos y plantillas tienen RLS habilitado y verificado con tests automatizados.                                                              |

## 8. Trazabilidad PRD -> SRS

| PRD           | SRS                          |
| ------------- | ---------------------------- |
| PRD-NOTIF-001 | FR-NOTIF-001                 |
| PRD-NOTIF-002 | FR-NOTIF-002                 |
| PRD-NOTIF-003 | FR-NOTIF-003                 |
| PRD-NOTIF-004 | FR-NOTIF-004                 |
| PRD-NOTIF-005 | FR-NOTIF-005                 |
| PRD-NOTIF-006 | FR-NOTIF-006, FR-NOTIF-007   |
| PRD-NOTIF-007 | FR-NOTIF-008                 |
| PRD-NOTIF-003 | NFR-NOTIF-005, NFR-NOTIF-006 |
| PRD-NOTIF-004 | NFR-NOTIF-001                |
