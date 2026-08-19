---
tags:
  - proyecto/fosforo
  - cancionero
  - sla
  - slo
  - aplicación
type: doc-app-sla-slo
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-05-28
related:
  - "[[00-README|Cancionero App]]"
---

# SLA y SLO - 0401_cancionero

## 1. Ficha

- ID base: `SLO-0401-CANCIONERO-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-05-28

## 2. SLA (externo)

- **SLA-001:** Disponibilidad del servicio en horario de uso típico (viernes 18-22hs, sábados 16-22hs, domingos 8-14hs) >= 99.5%.
- **SLA-002:** Tiempo de respuesta de búsqueda < 1 segundo para consultas estándar.

## 3. SLO y SLI (interno)

| ID                      | SLI                                                      | Objetivo       | Ventana |
| ----------------------- | -------------------------------------------------------- | -------------- | ------- |
| SLO-0401-CANCIONERO-001 | Tiempo de respuesta de búsqueda libre (p95)              | < 500ms        | Mensual |
| SLO-0401-CANCIONERO-002 | Tiempo de respuesta de búsqueda por tiempo+momento (p95) | < 300ms        | Mensual |
| SLO-0401-CANCIONERO-003 | Disponibilidad de la app en horas de uso                 | > 99.5%        | Mensual |
| SLO-0401-CANCIONERO-004 | Tiempo entre contribución y moderación (p95)             | < 48hs hábiles | Mensual |

## 4. Error budget

- **Politica:** Presupuesto de error mensual del 0.5% de disponibilidad (aproximadamente 3.6 horas de caída en horas de uso). Si se consume > 50% del presupuesto antes del día 15 del mes, se congela la publicación de nuevas features hasta fin de mes.
- **Accion cuando se consume:** Reunión post-mortem para identificar causa raíz; priorización de deuda técnica en el siguiente sprint.

## 5. Alertas y observabilidad

- **Dashboard principal:** Vercel Dashboard para métricas de rendimiento y disponibilidad; Supabase Dashboard para queries lentas y uso de base de datos.
- **Alertas P1/P2:** Notificación por email/Slack cuando la disponibilidad cae por debajo del 99% o la latencia p95 supera 1 segundo por más de 5 minutos consecutivos.
- **Owner de guardia:** Iván Ezequiel Iencinella (contacto directo para incidencias).
