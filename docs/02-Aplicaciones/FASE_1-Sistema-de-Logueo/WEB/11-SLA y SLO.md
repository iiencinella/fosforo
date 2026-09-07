---
tags:
  - proyecto/fosforo
  - sla
  - slo
  - aplicacion
  - logueo
  - identidad
  - auth
type: app-sla-slo
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Logueo]]"
---

# SLA y SLO - Sistema de Logueo

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SLO-AUTH-*`
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. SLA (externo)

- **SLA-AUTH-001:** Supabase Auth — SLA de disponibilidad del 99.95% según el plan contratado. El Sistema de Logueo hereda el SLA de Supabase Auth como proveedor crítico de autenticación.
- **SLA-AUTH-002:** Supabase PostgreSQL — SLA de disponibilidad del 99.95% para la base de datos que aloja `profiles`, `roles`, `consents` y `auth_audit_log`.

## 3. SLO y SLI (interno)

| ID           | SLI                                                               | Objetivo | Ventana |
| ------------ | ----------------------------------------------------------------- | -------- | ------- |
| SLO-AUTH-001 | Disponibilidad del servicio de autenticación                      | 99.95%   | mensual |
| SLO-AUTH-002 | Latencia p95 de login (desde envío de credenciales hasta JWT)     | < 500ms  | mensual |
| SLO-AUTH-003 | Tasa de login exitoso                                             | > 99%    | mensual |
| SLO-AUTH-004 | Tiempo de revocación de sesión (desde request hasta invalidación) | < 5s     | mensual |
| SLO-AUTH-005 | Tasa de error de `GET /api/auth/me` (no por sesión expirada)      | < 0.1%   | mensual |
| SLO-AUTH-006 | Tiempo de respuesta p95 de `GET /api/auth/me`                     | < 100ms  | mensual |

## 4. Error budget

- **Política:** Con un SLO de disponibilidad del 99.95%, el error budget mensual es de 21.6 minutos de downtime permitido (basado en un mes de 30 días = 43,200 minutos; 0.05% = 21.6 minutos).
- **Acción cuando se consume:** Si el error budget se consume en más del 50% (10.8 minutos) en una ventana de 7 días, se detiene el despliegue de nuevas features y se prioriza la investigación y corrección de la causa raíz. Si se consume el 100%, se congela el release y se abre un incidente P1.
- **Monitoreo:** Dashboard de Supabase (Auth + PostgreSQL) + alertas custom via app Log (RUM) para detectar degradación de latencia y tasa de error.

## 5. Alertas y observabilidad

- **Dashboard principal:** Dashboard de Supabase Auth + dashboard custom de métricas de `auth_audit_log` (login/logout rate, errores, latencia). A crear en app Log o panel de observabilidad dedicado.
- **Alertas P1/P2:**
  - P1: Disponibilidad de Supabase Auth cae por debajo del 99.95% en ventana de 5 minutos.
  - P1: Tasa de error de login > 5% en ventana de 5 minutos.
  - P1: p95 de login > 1s en ventana de 10 minutos.
  - P2: Tasa de login exitoso < 99% en ventana de 1 hora.
  - P2: Tiempo de revocación de sesión > 10s en ventana de 10 minutos.
- **Owner de guardia:** Iván Ezequiel Iencinella (hasta que se asigne un equipo de ops dedicado).
- **Integración con app Log:** Los eventos de autenticación (login, logout, sesión expirada, revocación) se envían a la app Log para correlación con métricas de RUM y detección de anomalías de acceso.
