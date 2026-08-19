---
tags:
  - proyecto/fosforo
  - horarios
  - sla
  - slo
  - aplicación
type: app-sla-slo
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|0106 Horarios]]"
---

# SLA y SLO - 0106_horarios

## 1. Ficha

- ID base: `SLO-0106-HORARIOS-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. SLA (externo)

- SLA-001: disponibilidad mensual objetivo de 99.5% para la experiencia publica de consulta.
- SLA-002: respuestas de consulta deben devolver resultado o error controlado en tiempo operativo esperado.
- SLA-003: tiempos de correccion de datos de templos quedan como compromiso operativo interno, no SLA contractual externo en MVP.

## 3. SLO y SLI (interno)

| ID                    | SLI                                                          | Objetivo | Ventana |
| --------------------- | ------------------------------------------------------------ | -------- | ------- |
| SLO-0106-HORARIOS-001 | Uptime de la web publica                                     | >= 99.5% | mensual |
| SLO-0106-HORARIOS-002 | Latencia p95 de `GET /api/celebraciones`                     | < 300 ms | mensual |
| SLO-0106-HORARIOS-003 | Tasa de error 5xx en endpoints principales                   | < 1%     | mensual |
| SLO-0106-HORARIOS-004 | Tasa de respuestas utiles en busqueda (con o sin resultados) | >= 99%   | mensual |
| SLO-0106-HORARIOS-005 | Cobertura de templos con estado de actualizacion visible     | >= 95%   | mensual |

## 4. Error budget

- Politica: si se consume el 50% del error budget antes de mitad de mes, se prioriza estabilizacion sobre nuevas features.
- Accion cuando se consume: congelar releases no criticos, ejecutar analisis de causa raiz y plan de remediacion con seguimiento semanal.

## 5. Alertas y observabilidad

- Dashboard principal: pendiente de instrumentacion final en stack de observabilidad del ecosistema.
- Alertas P1/P2: minimo sobre caida total, degradacion de latencia y pico anomalo de errores 5xx.
- Owner de guardia: Iván Ezequiel Iencinella
