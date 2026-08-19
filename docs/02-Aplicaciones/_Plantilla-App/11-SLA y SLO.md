---
tags:
  - proyecto/fosforo
  - plantilla
  - sla
  - slo
  - aplicación
type: plantilla-app-sla-slo
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-04-05
related:
  - "[[00-README|Plantilla App]]"
---

# SLA y SLO - [NOMBRE_APP]

## 1. Ficha

- ID base: `SLO-[APP]-*`
- Owner servicio: [NOMBRE]
- Fecha: [YYYY-MM-DD]

## 2. SLA (externo)

- SLA-001: [DESCRIBIR]
- SLA-002: [DESCRIBIR]

## 3. SLO y SLI (interno)

| ID            | SLI         | Objetivo   | Ventana   |
| ------------- | ----------- | ---------- | --------- |
| SLO-[APP]-001 | [DESCRIBIR] | [OBJETIVO] | [mensual] |
| SLO-[APP]-002 | [DESCRIBIR] | [OBJETIVO] | [mensual] |

## 4. Error budget

- Politica: [DESCRIBIR]
- Accion cuando se consume: [DESCRIBIR]

## 5. Alertas y observabilidad

- Dashboard principal: [LINK_O_PATH]
- Alertas P1/P2: [LINK_O_PATH]
- Owner de guardia: [NOMBRE]
