---
tags:
  - proyecto/fosforo
  - calendario
  - sla
  - slo
  - aplicación
type: app-sla-slo
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
---

# SLA y SLO - 0103 Calendario

## 1. Ficha

- ID base: `SLO-0103-CALENDARIO-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-05-20

## 2. SLA (externo)

- SLA-001: disponibilidad mensual objetivo de 99.5% para la lectura pública del calendario durante el MVP.
- SLA-002: respuesta funcional inmediata para consultas válidas de jornada diaria o calendario mensual, o error recuperable cuando corresponda.
- SLA-003: la actualización editorial del calendario fuera del alcance del dataset cargado queda fuera de SLA hasta definir operación de mantenimiento más rica.

## 3. SLO y SLI (interno)

| ID                      | SLI                                                       | Objetivo | Ventana |
| ----------------------- | --------------------------------------------------------- | -------- | ------- |
| SLO-0103-CALENDARIO-001 | Uptime de la superficie pública del calendario            | >= 99.5% | mensual |
| SLO-0103-CALENDARIO-002 | Latencia p95 de `GET /api/calendar/day`                   | < 300 ms | mensual |
| SLO-0103-CALENDARIO-003 | Latencia p95 de `GET /api/calendar/month`                 | < 300 ms | mensual |
| SLO-0103-CALENDARIO-004 | Tasa de error 5xx en endpoints del calendario             | < 1%     | mensual |
| SLO-0103-CALENDARIO-005 | Tasa de respuestas correctas para fechas válidas con dato | >= 98%   | mensual |

## 4. Error budget

- Politica: si se consume el 50% del error budget antes de la mitad de la ventana mensual, se priorizan estabilización, observabilidad y calidad de datos por encima de nuevas funcionalidades.
- Accion cuando se consume: congelar releases no críticas del calendario hasta recuperar estabilidad y revisar causas raíz de datos, contratos o infraestructura.

## 5. Alertas y observabilidad

- Dashboard principal: pendiente de definir cuando se active el stack de observabilidad del workspace.
- Alertas P1/P2: mínimas sobre caída total de lectura diaria, degradación severa de endpoints y fallos persistentes de contrato o RLS.
- Owner de guardia: Iván Ezequiel Iencinella
