---
tags:
  - proyecto/fosforo
  - administracion
  - sla
  - slo
  - aplicacion
type: app-sla-slo
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[01-PRD|PRD Administracion]]"
---

# SLA y SLO - 0107_administracion

## 1. Ficha

- ID base: `SLO-0107-ADMINISTRACION-*`
- Owner servicio: Ivan Ezequiel Iencinella
- Fecha: 2026-05-27

## 2. SLA (externo)

- SLA-001: El panel de administracion estara disponible 99.5% del tiempo en horario diurno (08:00-22:00 ART, lunes a sabado).
- SLA-002: Las operaciones CRUD sobre iglesias y horarios se reflejaran en las apps del ecosistema en menos de 5 minutos.

## 3. SLO y SLI (interno)

| ID                          | SLI                                 | Objetivo                        | Ventana    |
| --------------------------- | ----------------------------------- | ------------------------------- | ---------- |
| SLO-0107-ADMINISTRACION-001 | Tiempo de carga de pagina del panel | < 3 segundos en p95             | mensual    |
| SLO-0107-ADMINISTRACION-002 | Disponibilidad del panel            | >= 99.5% en horario diurno      | mensual    |
| SLO-0107-ADMINISTRACION-003 | Tiempo de respuesta de API CRUD     | < 500ms en p95                  | mensual    |
| SLO-0107-ADMINISTRACION-004 | Precision en busqueda de iglesias   | >= 95% de resultados relevantes | trimestral |

## 4. Error budget

- Politica: 2% de tiempo de inactividad por mes (aprox. 8.6 horas en horario diurno). Si se excede, se congela la entrega de nuevas funcionalidades hasta recuperar estabilidad.
- Accion cuando se consume: revision de causa raiz, plan de mitigacion, comunicacion al equipo.

## 5. Alertas y observabilidad

- Dashboard principal: dashboard de Vercel + Supabase para monitoreo de uptime y rendimiento
- Alertas P1/P2: caida del panel o error en operaciones CRUD critico -> notificacion a canal de Slack del equipo
- Owner de guardia: Ivan Ezequiel Iencinella
