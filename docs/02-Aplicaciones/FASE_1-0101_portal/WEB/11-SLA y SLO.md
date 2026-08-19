---
tags:
  - proyecto/fosforo
  - portal
  - sla
  - slo
  - aplicación
type: app-sla-slo
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
---

# SLA y SLO - 0101 Portal

## 1. Ficha

- ID base: `SLO-0101-PORTAL-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-05-08

## 2. SLA (externo)

- SLA-001: disponibilidad mensual objetivo de 99.5% para la experiencia pública del portal en MVP.
- SLA-002: confirmación inmediata del resultado de envío para formularios aceptados o rechazados por validación del sistema.
- SLA-003: los tiempos humanos de respuesta a soporte o feedback quedan fuera de SLA formal hasta definir operación de atención.
- SLA-004: las contribuciones técnicas siguen el flujo del repositorio y su revisión no forma parte del SLA operativo del portal.

## 3. SLO y SLI (interno)

| ID                  | SLI                                                        | Objetivo | Ventana |
| ------------------- | ---------------------------------------------------------- | -------- | ------- |
| SLO-0101-PORTAL-001 | Uptime de la web pública                                   | >= 99.5% | mensual |
| SLO-0101-PORTAL-002 | Latencia p95 de `GET /api/apps` desde contenido versionado | < 300 ms | mensual |
| SLO-0101-PORTAL-003 | Tasa de error 5xx en endpoints del portal                  | < 1%     | mensual |
| SLO-0101-PORTAL-004 | Tasa de éxito en submit válidos de formularios             | >= 98%   | mensual |

## 4. Error budget

- Politica: si se consume el 50% del error budget antes de la mitad de la ventana mensual, se priorizan estabilización y observabilidad sobre nuevas funcionalidades.
- Accion cuando se consume: congelar releases no críticos del portal hasta recuperar estabilidad y revisar causas raíz.

## 5. Alertas y observabilidad

- Dashboard principal: pendiente de definir cuando exista implementación y stack de observabilidad activo.
- Alertas P1/P2: pendientes de definir; mínimo requerido sobre caída total, submit fallido y degradación severa.
- Owner de guardia: Iván Ezequiel Iencinella
