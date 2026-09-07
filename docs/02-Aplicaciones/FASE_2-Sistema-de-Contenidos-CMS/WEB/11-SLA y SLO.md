---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - sla
  - slo
type: app-sla-slo
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
---

# SLA y SLO - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SLO-CMS-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. SLA (externo)

- SLA-001: API de lectura disponible 99.9% mensual (excluyendo ventanas de mantenimiento programado).
- SLA-002: Panel editorial disponible 99.5% mensual durante horario laboral (08:00-20:00 UTC-3).

## 3. SLO y SLI (interno)

| ID          | SLI                                         | Objetivo | Ventana |
| ----------- | ------------------------------------------- | -------- | ------- |
| SLO-CMS-001 | Disponibilidad API de lectura               | 99.9%    | mensual |
| SLO-CMS-002 | Latencia p95 API de lectura (cache hit)     | < 50ms   | mensual |
| SLO-CMS-003 | Latencia p95 API de lectura (cache miss)    | < 200ms  | mensual |
| SLO-CMS-004 | Latencia p95 panel editorial (CRUD entries) | < 1s     | mensual |
| SLO-CMS-005 | Tasa de error de API de lectura             | < 0.1%   | mensual |
| SLO-CMS-006 | Tiempo de publicación (review → published)  | < 5s     | mensual |

## 4. Error budget

- Politica: 99.9% disponibilidad API = 43.2 min/mes de error budget.
- Accion cuando se consume: Investigar causa raíz, revisar logs en app Log, priorizar fix antes de nuevas features.

## 5. Alertas y observabilidad

- Dashboard principal: app Log (`src/apps/log`) con métricas de CMS.
- Alertas P1: API de lectura caída; error rate > 1% en 5 min.
- Alertas P2: Latencia p95 > 500ms; panel editorial no responde.
- Owner de guardia: Iván Ezequiel Iencinella.
- Integración: `@repo/api-utils/log-client` para logs operativos; SDK de RUM para pageviews y Web Vitals del panel editorial.
