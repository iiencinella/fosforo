---
tags:
  - proyecto/fosforo
  - prd
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-prd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `PRD-NOTIF-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Problema y oportunidad

- **Problema:** Las apps del ecosistema Fósforo necesitan notificar a los usuarios (recordatorios de oración, alertas litúrgicas, confirmaciones de publicación, comprobantes). Sin un servicio centralizado de notificaciones, cada app duplica lógica de canales (email, push, in-app), plantillas, manejo de preferencias y reintentos. Esto genera inconsistencias, falta de trazabilidad por mensaje y deuda técnica creciente por app.
- **Oportunidad:** Un servicio compartido de notificaciones unifica preferencias de usuario, plantillas versionadas, cola de envíos con reintentos y trazabilidad por mensaje. Las apps consumidoras solo disparan eventos via API o `@repo/notification-core`, sin necesidad de implementar lógica de canales. Se centraliza la observabilidad de entregas, fallos y latencia en un único punto.

## 3. Objetivo de negocio

Construir el Sistema de Notificaciones como la capacidad transversal de notificaciones del ecosistema Fósforo, permitiendo que toda app consumidora envie comunicaciones por email, push web e in-app mediante un servicio unificado con plantillas versionadas, preferencias por canal y categoría, cola de envíos con reintentos y trazabilidad por mensaje. El sistema debe lograr una tasa de entrega de email > 98%, latencia de envío < 30s y 0 preferencias ignoradas.

## 4. Segmentos y JTBD

- **Segmento principal — Apps consumidoras (sistema):** CMS, Misal, Oraciones, Santopedia y demás apps del ecosistema que necesitan notificar a sus usuarios. Disparan notificaciones via `POST /api/notifications` o `@repo/notification-core`.
- **Segmento secundario — Usuarios finales (destinatarios):** Reciben notificaciones por email, push web o in-app; gestionan sus preferencias de opt-in/opt-out por canal y categoría.
- **Segmento terciario — Editores de plantillas (admin):** Editores y administradores que crean, versionan y publican plantillas de notificación mediante el panel de administración.

- **JTBD principal:** "Como app consumidora, quiero disparar una notificación a un usuario con una plantilla y canal adecuados, para que el usuario reciba la comunicación correcta sin que mi app implemente lógica de envío."

## 5. Alcance MVP

| ID            | Requisito de producto                                                                       | Prioridad | Justificación                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| PRD-NOTIF-001 | Plantillas versionadas con variables (Mustache/Handlebars) por canal (email, push, in-app)  | Must      | Sin plantillas versionadas no hay consistencia ni rollback de contenido.                      |
| PRD-NOTIF-002 | Envío multicanal: email, push web, in-app                                                   | Must      | Los usuarios esperan notificaciones por múltiples canales; in-app cubre la UI del ecosistema. |
| PRD-NOTIF-003 | Preferencias por usuario: opt-in/opt-out por canal y categoría                              | Must      | Cumplimiento de privacidad; el usuario debe poder controlar qué recibe y por qué canal.       |
| PRD-NOTIF-004 | Cola de envíos con reintentos (máximo 3) y backoff exponencial                              | Must      | Sin cola con reintentos, un fallo transitorio del proveedor de email descarta el mensaje.     |
| PRD-NOTIF-005 | Trazabilidad por mensaje: pendiente, enviado, entregado, fallido, abierto                   | Must      | Observabilidad de entregas; sin trazabilidad no se puede medir el KPI de entrega.             |
| PRD-NOTIF-006 | API de eventos `POST /api/notifications` con payload validado e idempotencia por `event_id` | Must      | Las apps consumidoras necesitan un contrato estable para disparar notificaciones.             |
| PRD-NOTIF-007 | Integración RUM con app Log para observabilidad de envíos                                   | Should    | Observabilidad de latencia, tasa de entrega y fallos; detección de anomalías.                 |

## 6. No alcance MVP

- Automatizaciones de marketing (drip campaigns, segmentación dinámica, journeys).
- A/B testing de plantillas.
- Push nativo mobile (FCM/APNs) — post-MVP, el MVP cubre push web.
- SMS como canal de envío — post-MVP.
- Plantillas multidioma con traducción automática — post-MVP (soporte de plantillas por idioma manual sí está en alcance).

## 7. KPI y criterios de exito

- **KPI principal:** Tasa de entrega de email > 98% (mensajes enviados vs. entregados).
- **KPI secundario 1:** Latencia de envío < 30s (desde encolado hasta envío al proveedor del canal).
- **KPI secundario 2:** 0 preferencias de usuario ignoradas (todo envío respeta opt-in/opt-out).
- **KPI secundario 3:** Tasa de apertura de email > 20% (tracking de `opened` en trazabilidad).

## 8. Riesgos de negocio

| Riesgo                                                       | Impacto | Mitigación                                                                                  | Owner                    |
| ------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Fallo del proveedor de email (SMTP/Resend) interrumpe envíos | Alto    | Cola con reintentos (máximo 3) y backoff exponencial; monitoreo de salud del proveedor.     | Iván Ezequiel Iencinella |
| Preferencias de usuario no respetadas (spam)                 | Alto    | Validación server-side antes de cada envío; tests automatizados que verifican preferencias. | Iván Ezequiel Iencinella |
| Plantilla con variable faltante genera contenido inválido    | Medio   | Validación de variables al crear/publicar plantilla; fallback a valor por defecto.          | Iván Ezequiel Iencinella |
| Cola de envíos saturada por pico de notificaciones           | Medio   | Backoff exponencial; monitoreo de longitud de cola; escalado de workers de Edge Functions.  | Iván Ezequiel Iencinella |
| PII expuesta en logs de canal                                | Alto    | PII no se loguea en logs de envío; solo en `notification_events` con acceso restringido.    | Iván Ezequiel Iencinella |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
- SRS de referencia transversal: `docs/01-Arquitectura/Capacidades Compartidas/SRS-Notificaciones-y-Plantillas.md`
