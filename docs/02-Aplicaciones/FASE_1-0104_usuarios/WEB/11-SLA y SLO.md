---
tags:
  - proyecto/fosforo
  - usuarios
  - sla
  - slo
  - aplicación
type: app-sla-slo
area: aplicaciónes
status: draft
created: 2026-03-07
updated: 2026-05-25
related:
  - "[[00-README|0104 Usuarios]]"
---

# SLA y SLO - 0104_usuarios

## 1. Ficha

- ID base: `SLO-0104-USUARIOS-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-05-25

## 2. SLA (externo)

- SLA-001: El sistema de autenticación (login, registro, recuperación de contraseña) debe estar disponible el 99.5% del tiempo durante el horario de uso pico (08:00–22:00 UTC-3).
- SLA-002: El tiempo de respuesta del endpoint de login no debe exceder 1 segundo en el percentil 95 durante condiciones normales de operación.

## 3. SLO y SLI (interno)

| ID                    | SLI                                                                            | Objetivo      | Ventana |
| --------------------- | ------------------------------------------------------------------------------ | ------------- | ------- |
| SLO-0104-USUARIOS-001 | Disponibilidad de endpoints de autenticación (login, register, session).       | >= 99.5%      | Mensual |
| SLO-0104-USUARIOS-002 | Latencia p95 del endpoint de login.                                            | <= 500 ms     | Mensual |
| SLO-0104-USUARIOS-003 | Latencia p95 de consulta de perfil y roles.                                    | <= 300 ms     | Mensual |
| SLO-0104-USUARIOS-004 | Tasa de errores 5xx en endpoints de auth.                                      | <= 0.1%       | Mensual |
| SLO-0104-USUARIOS-005 | Tiempo de registro exitoso desde el envío del formulario hasta la redirección. | <= 2 segundos | Mensual |
| SLO-0104-USUARIOS-006 | Cobertura de eventos críticos auditados en audit_log.                          | >= 99%        | Mensual |

## 4. Error budget

- Politica: El error budget mensual es del 0.5% de disponibilidad (aproximadamente 3.6 horas de downtime permitido por mes para endpoints de autenticación).
- Accion cuando se consume:
  - 50% consumido: revisión de incidentes y plan de mitigación.
  - 80% consumido: congelación de deploys no críticos hasta próximo período.
  - 100% consumido: revisión post-mortem obligatoria y ajuste de SLOs si corresponde.

## 5. Alertas y observabilidad

- Dashboard principal: `[LINK_O_PATH]` — tablero con disponibilidad, latencia p95, tasa de errores y uptime de Supabase Auth.
- Alertas P1/P2: notificación a canal de incidentes cuando disponibilidad < 99% o latencia p95 > 1s sostenida por 5 minutos.
- Owner de guardia: Iván Ezequiel Iencinella (en MVP, cobertura durante horario laboral extendido).
