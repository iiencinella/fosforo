---
tags:
  - proyecto/fosforo
  - sla
  - slo
  - aplicacion
  - notificaciones
  - plantillas
  - multicanal
type: app-sla-slo
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Notificaciones]]"
---

# SLA y SLO - Sistema de Notificaciones

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SLO-NOTIF-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. SLA (externo)

- **SLA-NOTIF-001:** Supabase PostgreSQL — SLA de disponibilidad del 99.95% para la base de datos que aloja `notification_templates`, `notification_events`, `notification_preferences` y `notification_queue`.
- **SLA-NOTIF-002:** Supabase Edge Functions — SLA de disponibilidad del 99.5% para el procesamiento de la cola de envíos.
- **SLA-NOTIF-003:** Proveedor de email (SMTP/Resend) — SLA del proveedor contratado para entrega de email; el Sistema de Notificaciones hereda el SLA del proveedor para el canal email.

## 3. SLO y SLI (interno)

| ID            | SLI                                                           | Objetivo | Ventana |
| ------------- | ------------------------------------------------------------- | -------- | ------- |
| SLO-NOTIF-001 | Disponibilidad del endpoint `POST /api/notifications`         | 99.5%    | mensual |
| SLO-NOTIF-002 | Latencia de encolado (desde request hasta encolado)           | < 5s     | mensual |
| SLO-NOTIF-003 | Tasa de entrega de email (enviados vs. entregados)            | > 98%    | mensual |
| SLO-NOTIF-004 | Tasa de entrega de push web (enviados vs. entregados)         | > 95%    | mensual |
| SLO-NOTIF-005 | Reintentos máximos por mensaje                                | 3        | n/a     |
| SLO-NOTIF-006 | Preferencias de usuario respetadas (0 preferencias ignoradas) | 100%     | mensual |
| SLO-NOTIF-007 | Latencia de envío (desde encolado hasta envío al proveedor)   | < 30s    | mensual |
| SLO-NOTIF-008 | Idempotencia (event_id duplicados no generan envío duplicado) | 100%     | mensual |

## 4. Error budget

- **Política:** Con un SLO de disponibilidad del 99.5% en el endpoint `POST /api/notifications`, el error budget mensual es de 3.6 horas de downtime permitido (basado en un mes de 30 días = 720 horas; 0.5% = 3.6 horas).
- **Acción cuando se consume:** Si el error budget se consume en más del 50% (1.8 horas) en una ventana de 7 días, se detiene el despliegue de nuevas features y se prioriza la investigación y corrección de la causa raíz. Si se consume el 100%, se congela el release y se abre un incidente P1.
- **Monitoreo:** Dashboard de Supabase (PostgreSQL + Edge Functions) + alertas custom via app Log (RUM) para detectar degradación de latencia, tasa de entrega y longitud de cola.

## 5. Alertas y observabilidad

- **Dashboard principal:** Dashboard de Supabase (PostgreSQL + Edge Functions) + dashboard custom de métricas de `notification_events` (tasa de entrega, latencia, fallos, longitud de cola). A crear en app Log o panel de observabilidad dedicado.
- **Alertas P1/P2:**
  - P1: Disponibilidad del endpoint `POST /api/notifications` cae por debajo del 99.5% en ventana de 5 minutos.
  - P1: Longitud de cola > 1000 items en `notification_queue` (cola saturada).
  - P1: Tasa de fallo de envío > 10% en ventana de 10 minutos.
  - P2: Tasa de entrega de email < 98% en ventana de 1 hora.
  - P2: Tasa de entrega de push web < 95% en ventana de 1 hora.
  - P2: Latencia de encolado > 5s en p95 en ventana de 10 minutos.
- **Owner de guardia:** Iván Ezequiel Iencinella (hasta que se asigne un equipo de ops dedicado).
- **Integración con app Log:** Los eventos de envío (encolado, enviado, entregado, fallido, abierto) se envían a la app Log (RUM) para correlación con métricas de RUM y detección de anomalías de entrega.
