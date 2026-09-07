---
tags:
  - proyecto/fosforo
  - tests
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-tests
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
---

# Tests Unitarios - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `TC-NOTIF-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Estrategia

- **Framework:** Vitest + React Testing Library para componentes; Vitest para lógica de `notification-core`, plantillas, cola y preferencias.
- **Alcance unitario:** Renderizado de plantillas (Mustache/Handlebars), validación de payload, lógica de cola (reintentos, backoff, estados), gestión de preferencias, idempotencia por `event_id`, endpoints de API (`/api/notifications/*`), y reglas RLS de PostgreSQL.
- **Exclusiones justificadas:** El proveedor de email (SMTP/Resend) se mockea en tests unitarios; se cubre con tests de integración en entorno de staging. La app Log (RUM) se prueba en su propio conjunto de tests. Web Push API se mockea en tests unitarios.
- **Cobertura de RLS:** Tests automatizados que verifican que cada política RLS en `notification_templates`, `notification_events`, `notification_preferences` y `notification_queue` bloquea/permite correctamente por rol y por usuario.

## 3. Matriz de pruebas

| ID           | Requisito trazado | Tipo        | Descripción                                                                                          | Estado    |
| ------------ | ----------------- | ----------- | ---------------------------------------------------------------------------------------------------- | --------- |
| TC-NOTIF-001 | FR-NOTIF-001      | Unitario    | Crear plantilla con variables válidas la guarda como borrador.                                       | Pendiente |
| TC-NOTIF-002 | FR-NOTIF-001      | Unitario    | Publicar plantilla crea versión inmutable; editar versión publicada retorna error.                   | Pendiente |
| TC-NOTIF-003 | FR-NOTIF-001      | Unitario    | Crear plantilla con nombre duplicado para el mismo canal retorna 409.                                | Pendiente |
| TC-NOTIF-004 | FR-NOTIF-001      | Unitario    | Renderizar plantilla con variables Mustache/Handlebars produce el contenido esperado.                | Pendiente |
| TC-NOTIF-005 | FR-NOTIF-001      | Unitario    | Renderizar plantilla con variable faltante usa valor por defecto o retorna error.                    | Pendiente |
| TC-NOTIF-006 | FR-NOTIF-002      | Unitario    | Enviar notificación por canal `email` renderiza y envía al proveedor SMTP.                           | Pendiente |
| TC-NOTIF-007 | FR-NOTIF-002      | Unitario    | Enviar notificación por canal `push` envía push web al destinatario.                                 | Pendiente |
| TC-NOTIF-008 | FR-NOTIF-002      | Unitario    | Enviar notificación por canal `in-app` registra la notificación en la UI del ecosistema.             | Pendiente |
| TC-NOTIF-009 | FR-NOTIF-002      | Unitario    | Enviar notificación con canal no soportado retorna 422.                                              | Pendiente |
| TC-NOTIF-010 | FR-NOTIF-003      | Unitario    | `GET /api/notifications/preferences/{user_id}` lista preferencias por canal y categoría.             | Pendiente |
| TC-NOTIF-011 | FR-NOTIF-003      | Unitario    | `PUT /api/notifications/preferences/{user_id}` actualiza opt-in/opt-out.                             | Pendiente |
| TC-NOTIF-012 | FR-NOTIF-003      | Integración | RLS bloquea gestión de preferencias ajenas.                                                          | Pendiente |
| TC-NOTIF-013 | FR-NOTIF-003      | Unitario    | Usuario con `opted_in: false` no recibe notificación (excepto categoría `security`).                 | Pendiente |
| TC-NOTIF-014 | FR-NOTIF-004      | Unitario    | Mensaje fallido se reintentá hasta 3 veces con backoff exponencial (10s, 30s, 90s).                  | Pendiente |
| TC-NOTIF-015 | FR-NOTIF-004      | Unitario    | Tras 3 fallos el estado pasa a `failed` en `notification_events`.                                    | Pendiente |
| TC-NOTIF-016 | FR-NOTIF-004      | Integración | Worker de Edge Function procesa cola y actualiza estados correctamente.                              | Pendiente |
| TC-NOTIF-017 | FR-NOTIF-005      | Unitario    | `notification_events` registra estado `pending` al encolar.                                          | Pendiente |
| TC-NOTIF-018 | FR-NOTIF-005      | Unitario    | `notification_events` actualiza estado a `sent` tras envío exitoso.                                  | Pendiente |
| TC-NOTIF-019 | FR-NOTIF-005      | Unitario    | `notification_events` actualiza estado a `delivered` tras webhook del proveedor.                     | Pendiente |
| TC-NOTIF-020 | FR-NOTIF-005      | Unitario    | `notification_events` actualiza estado a `opened` tras tracking de apertura.                         | Pendiente |
| TC-NOTIF-021 | FR-NOTIF-006      | Unitario    | `POST /api/notifications` con payload válido encola el mensaje y retorna 202.                        | Pendiente |
| TC-NOTIF-022 | FR-NOTIF-006      | Unitario    | `POST /api/notifications` con `template_id` inexistente retorna 404.                                 | Pendiente |
| TC-NOTIF-023 | FR-NOTIF-006      | Unitario    | `POST /api/notifications` con `variables` incompletas retorna 422.                                   | Pendiente |
| TC-NOTIF-024 | FR-NOTIF-007      | Unitario    | `event_id` duplicado retorna 200 con resultado previo (idempotencia).                                | Pendiente |
| TC-NOTIF-025 | FR-NOTIF-007      | Integración | Idempotencia bajo concurrencia: dos requests simultáneos con mismo `event_id` generan un solo envío. | Pendiente |
| TC-NOTIF-026 | FR-NOTIF-008      | Integración | Evento de envío (sent) se envía a app Log (RUM).                                                     | Pendiente |
| TC-NOTIF-027 | FR-NOTIF-008      | Integración | Evento de fallo (failed) se envía a app Log (RUM).                                                   | Pendiente |
| TC-NOTIF-028 | NFR-NOTIF-001     | Integración | Disponibilidad del endpoint `POST /api/notifications` >= 99.5% en ventana mensual.                   | Pendiente |
| TC-NOTIF-029 | NFR-NOTIF-002     | Integración | Latencia de encolado < 5s en p95.                                                                    | Pendiente |
| TC-NOTIF-030 | NFR-NOTIF-003     | Unitario    | Plantilla con variable faltante no se publica; validación bloquea.                                   | Pendiente |
| TC-NOTIF-031 | NFR-NOTIF-004     | Unitario    | Logs de envío del proveedor no contienen PII.                                                        | Pendiente |
| TC-NOTIF-032 | NFR-NOTIF-005     | Integración | RLS en `notification_preferences` permite solo gestión propia.                                       | Pendiente |
| TC-NOTIF-033 | NFR-NOTIF-005     | Integración | RLS en `notification_templates` permite escritura solo a editor/admin.                               | Pendiente |
| TC-NOTIF-034 | NFR-NOTIF-006     | Unitario    | Rol `usuario` no puede crear ni publicar plantillas (403).                                           | Pendiente |

## 4. Cobertura objetivo

- **Cobertura global:** >= 80%
- **Módulos críticos (cola, plantillas, preferencias, idempotencia):** >= 90%

## 5. Criterios de aprobación

- [ ] Tests unitarios críticos (TC-NOTIF-001 a TC-NOTIF-025) en verde.
- [ ] Tests de integración de RLS (TC-NOTIF-012, TC-NOTIF-016, TC-NOTIF-025, TC-NOTIF-032, TC-NOTIF-033) en verde.
- [ ] Cobertura global >= 80% alcanzada.
- [ ] Cobertura de módulos críticos >= 90% alcanzada.
- [ ] Trazabilidad FR → TC actualizada en la matriz.
- [ ] Latencia de encolado < 5s en p95 verificado en entorno de staging.
