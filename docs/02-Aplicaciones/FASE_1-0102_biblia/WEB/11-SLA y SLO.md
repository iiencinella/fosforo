---
tags:
  - proyecto/fosforo
  - biblia
  - sla
  - slo
  - aplicación
type: app-sla-slo
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-05-25
related:
  - "[[00-README|0102 Biblia]]"
---

# SLA y SLO - 0102_biblia

## 1. Ficha

- ID base: `SLO-0102-BIBLIA-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-05-18

## 2. SLA (externo)

- SLA-001: disponibilidad mensual objetivo de 99.5% para entorno interno habilitado del MVP.
- SLA-002: consultas válidas de lectura/búsqueda deben devolver respuesta funcional o error controlado sin timeout percibido por usuario.
- SLA-003: la publicación pública queda fuera de SLA hasta resolver licencia de contenido bíblico.

## 3. SLO y SLI (interno)

| ID                  | SLI                                                                                      | Objetivo | Ventana |
| ------------------- | ---------------------------------------------------------------------------------------- | -------- | ------- |
| SLO-0102-BIBLIA-001 | Uptime de la app en entorno interno                                                      | >= 99.5% | mensual |
| SLO-0102-BIBLIA-002 | Latencia p95 de lectura por referencia                                                   | < 300 ms | mensual |
| SLO-0102-BIBLIA-003 | Latencia p95 de búsqueda textual                                                         | < 600 ms | mensual |
| SLO-0102-BIBLIA-004 | Tasa de error 5xx en endpoints de lectura/búsqueda/liturgia                              | < 1%     | mensual |
| SLO-0102-BIBLIA-005 | Cobertura de lecturas litúrgicas cargadas (Rito Romano Argentina) para ventana operativa | >= 95%   | mensual |

## 4. Error budget

- Politica: si se consume 50% del error budget antes de mitad de mes, se prioriza estabilización sobre nuevas features.
- Accion cuando se consume: congelar cambios no críticos, revisar causas raíz y ejecutar plan de remediación.

## 5. Alertas y observabilidad

- Dashboard principal: pendiente de definir en stack de observabilidad del ecosistema al implementar la app.
- Alertas P1/P2: pendientes; mínimo para caída total, degradación de búsqueda y faltantes de lecturas litúrgicas de Rito Romano (Argentina).
- Owner de guardia: Iván Ezequiel Iencinella
