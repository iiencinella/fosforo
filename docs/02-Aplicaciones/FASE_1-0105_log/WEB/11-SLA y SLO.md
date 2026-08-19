---
tags:
  - proyecto/fosforo
  - sla
  - slo
  - aplicacion/log
type: app-sla-slo
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|README Log]]"
  - "[[01-PRD|PRD Log]]"
---

# SLA y SLO - 0105_log

## 1. Ficha

- ID base: `SLO-0105-LOG-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. SLA (externo)

- **SLA-001:** Disponibilidad del panel de logs del 99.5% en horario laboral (lunes a viernes 08:00-20:00 UTC-3).
- **SLA-002:** El tiempo maximo de ingesta (desde que la app emisora envia el log hasta que esta disponible para consulta) no supera los 10 segundos en el 95% de los casos.
- **SLA-003:** El tiempo maximo de respuesta del listado de logs con filtros no supera los 3 segundos en el 95% de los casos.

## 3. SLO y SLI (interno)

| ID               | SLI                                                      | Objetivo | Ventana |
| ---------------- | -------------------------------------------------------- | -------- | ------- |
| SLO-0105-LOG-001 | Latencia de ingesta (POST /api/logs -> visible en DB)    | p95 < 5s | Mensual |
| SLO-0105-LOG-002 | Latencia de consulta (GET /api/logs con filtros)         | p95 < 2s | Mensual |
| SLO-0105-LOG-003 | Tasa de exito de ingesta (requests 201 / total requests) | > 99%    | Mensual |
| SLO-0105-LOG-004 | Uptime del frontend (200 OK desde Vercel)                | > 99.5%  | Mensual |
| SLO-0105-LOG-005 | Tiempo de carga del dashboard                            | p95 < 3s | Mensual |

## 4. Error budget

- **Politica:** 0.5% de downtime mensual = ~3.6 horas/mes de error budget.
- **Accion cuando se consume:** Si se consume > 50% del error budget antes de la tercera semana del mes, se congela la entrega de nuevas features y el equipo se enfoca en estabilidad.

## 5. Alertas y observabilidad

- **Dashboard principal:** [PENDIENTE - definir URL del dashboard de la app]
- **Alertas P1/P2:** [PENDIENTE - Slack/webhook del equipo]
- **Owner de guardia:** Iván Ezequiel Iencinella
