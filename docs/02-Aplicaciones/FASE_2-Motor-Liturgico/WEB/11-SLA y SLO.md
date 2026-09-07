---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - sla
  - slo
type: app-sla-slo
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
---

# SLA y SLO - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SLO-MOTOR-LIT-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. SLA (externo)

- SLA-001: Disponibilidad del 99.9% mensual para `GET /api/liturgia/{fecha}`.
- SLA-002: Latencia p95 < 100 ms para `GET /api/liturgia/{fecha}`.
- SLA-003: Respuesta 200 para todas las fechas validas en el rango 2000-2100 (determinismo).

## 3. SLO y SLI (interno)

| ID                | SLI                                          | Objetivo | Ventana |
| ----------------- | -------------------------------------------- | -------- | ------- |
| SLO-MOTOR-LIT-001 | Disponibilidad de la API                     | 99.9%    | Mensual |
| SLO-MOTOR-LIT-002 | Latencia p95 de `GET /api/liturgia/{fecha}`  | < 100 ms | Mensual |
| SLO-MOTOR-LIT-003 | Latencia p99 de `GET /api/liturgia/{fecha}`  | < 250 ms | Mensual |
| SLO-MOTOR-LIT-004 | Tasa de error (5xx)                          | < 0.05%  | Mensual |
| SLO-MOTOR-LIT-005 | Determinismo (misma fecha = mismo resultado) | 100%     | Mensual |
| SLO-MOTOR-LIT-006 | Cache hit ratio para consultas por fecha     | > 90%    | Mensual |

## 4. Error budget

- Politica: El error budget se calcula como 0.1% del tiempo mensual (aprox. 43.2 minutos/mes para disponibilidad 99.9%).
- Accion cuando se consume:
  - Si se consume > 50% del budget en una semana: alerta de advertencia al owner.
  - Si se consume > 100% del budget en una semana: congelar nuevas features y priorizar estabilidad.
  - Si se consume > 100% del budget en el mes: revisar SLA con stakeholders y considerar degradacion graceful.
- Budget de latencia: si el p95 supera 100 ms por mas de 5 minutos consecutivos, se dispara alerta P2.
- Budget de errores: si la tasa de 5xx supera 0.05% en una ventana de 1 hora, se dispara alerta P2.

## 5. Alertas y observabilidad

- Dashboard principal: app Log (RUM) con metricas de latencia, throughput, tasa de error y cache hit ratio por endpoint.
- Alertas P1:
  - Disponibilidad de la API < 99.9% en ventana de 1 hora.
  - Calculo de Pascua retorna resultado incorrecto (detectado por test de regresion automatico).
- Alertas P2:
  - Latencia p95 > 100 ms sostenido por 5 minutos.
  - Tasa de error 5xx > 0.05% en ventana de 1 hora.
  - Cache hit ratio < 90% en ventana de 1 hora.
- Alertas P3:
  - Referencias `cms_entry_id` rotas detectadas por job de verificacion periodica.
- Owner de guardia: Iván Ezequiel Iencinella
- Runbooks: ver [07-ERM.md](07-ERM.md) seccion 3.
