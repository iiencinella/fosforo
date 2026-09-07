---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - sla
  - slo
type: app-sla-slo
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
---

# SLA y SLO - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SLO-MISAL-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. SLA (externo)

- SLA-001: Disponibilidad 99.5% mensual (los domingos y fiestas de precepto tienen prioridad de estabilidad).
- SLA-002: Contenido del día disponible siempre (con degradación a cache si CMS/Motor fallan).

## 3. SLO y SLI (interno)

| ID            | SLI                                                      | Objetivo | Ventana           |
| ------------- | -------------------------------------------------------- | -------- | ----------------- |
| SLO-MISAL-001 | Disponibilidad                                           | 99.5%    | mensual           |
| SLO-MISAL-002 | LCP p75 (página del día)                                 | < 2.5s   | mensual (via RUM) |
| SLO-MISAL-003 | TTFB p95                                                 | < 800ms  | mensual           |
| SLO-MISAL-004 | Tasa de error de página                                  | < 0.1%   | mensual           |
| SLO-MISAL-005 | Disponibilidad de contenido del día (lecturas completas) | 99.9%    | mensual           |
| SLO-MISAL-006 | Tiempo de corrección tras reporte de contenido           | < 24h    | por reporte       |
| SLO-MISAL-007 | Eventos RUM con PII                                      | 0        | mensual           |

## 4. Error budget

- Politica: 99.5% disponibilidad = 3.6 h/mes de error budget.
- Accion cuando se consume: Congelar deploys no críticos; investigar causa raíz en Log; priorizar fix de contenido/calendario.

## 5. Alertas y observabilidad

- Dashboard: RUM de Misal en `/dashboard-producto` (app Log).
- Alertas P1: CMS sin lecturas del día (diaria, 05:00 UTC-3); Motor con celebración errónea (reporte); app caída.
- Alertas P2: LCP p75 > 2.5s; tasa de degradación > 1% de peticiones.
- Alertas P3: Reportes de contenido acumulados > 10 sin revisar.
- Owner de guardia: Iván Ezequiel Iencinella.
- Integración: `@repo/api-utils/log-client` (logs), `@repo/analytics` (RUM), Notificaciones (alertas a editores).
