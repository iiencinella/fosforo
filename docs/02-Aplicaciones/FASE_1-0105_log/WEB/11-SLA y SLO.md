---
tags:
  - proyecto/fosforo
  - sla
  - slo
  - aplicacion/log
  - rum
  - analiticas
type: app-sla-slo
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
---

# SLA y SLO - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `SLO-0105-LOG-*` (logs operativos), `SLO-LOG-RUM-*` (RUM y analíticas)
- Owner servicio: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. SLA (externo)

### Logs operativos

- SLA-001: Disponibilidad del dashboard de logs 99.5% mensual (excluyendo ventanas de mantenimiento programado).
- SLA-002: Latencia p95 de ingesta de logs < 500ms mensual.
- SLA-003: Latencia de aparición de un log en el dashboard < 5 segundos (p95) mensual.

### RUM y analíticas (extensión)

- SLA-004: Disponibilidad del dashboard de producto 99.5% mensual.
- SLA-005: Latencia p95 de ingesta RUM < 1 segundo mensual.
- SLA-006: SDK RUM < 5KB comprimido (verificado en cada release).

## 3. SLO y SLI (interno)

### Logs operativos

| ID               | SLI                                             | Objetivo | Ventana    |
| ---------------- | ----------------------------------------------- | -------- | ---------- |
| SLO-0105-LOG-001 | Disponibilidad dashboard de logs                | 99.5%    | mensual    |
| SLO-0105-LOG-002 | Latencia p95 ingesta de logs                    | < 500ms  | mensual    |
| SLO-0105-LOG-003 | Latencia de aparición de log en dashboard (p95) | < 5s     | mensual    |
| SLO-0105-LOG-004 | Latencia p95 de listado de logs con filtros     | < 2s     | mensual    |
| SLO-0105-LOG-005 | Tasa de error en ingesta de logs                | < 0.1%   | mensual    |
| SLO-0105-LOG-006 | Tasa de adopción (% de apps que envían logs)    | > 80%    | trimestral |

### RUM y analíticas (extensión)

| ID              | SLI                                                      | Objetivo           | Ventana     |
| --------------- | -------------------------------------------------------- | ------------------ | ----------- |
| SLO-LOG-RUM-001 | Disponibilidad ingesta RUM                               | 99.5%              | mensual     |
| SLO-LOG-RUM-002 | Latencia p95 ingesta RUM (POST /api/rum)                 | < 1s               | mensual     |
| SLO-LOG-RUM-003 | Latencia p95 ingesta Web Vitals (POST /api/rum/vitals)   | < 1s               | mensual     |
| SLO-LOG-RUM-004 | Tamaño del SDK `@repo/analytics` (comprimido)            | < 5KB              | por release |
| SLO-LOG-RUM-005 | Tasa de eventos RUM perdidos                             | < 2%               | mensual     |
| SLO-LOG-RUM-006 | Tasa de adopción del SDK RUM (% de apps que lo integran) | 100% (apps nuevas) | trimestral  |
| SLO-LOG-RUM-007 | Tasa de incidentes donde SDK rompe app anfitriona        | 0                  | mensual     |
| SLO-LOG-RUM-008 | Tasa de eventos RUM con PII detectados                   | 0                  | mensual     |

## 4. Error budget

### Logs operativos

- **Politica:** 99.5% disponibilidad = 3.6 horas/mes de error budget.
- **Accion cuando se consume:** Investigar causa raíz, revisar logs en app Log, priorizar fix antes de nuevas features. Si se consume > 50% del budget, congelar deploys no críticos.

### RUM y analíticas

- **Politica:** 99.5% disponibilidad = 3.6 horas/mes de error budget.
- **Accion cuando se consume:** Mismo procedimiento que logs operativos. Adicionalmente, revisar si el incidente fue causado por el SDK RUM en apps anfitrionas (ERM-LOG-RUM-005) y aplicar fix.

## 5. Alertas y observabilidad

### Logs operativos

- Dashboard principal: `/dashboard` en la app Log.
- Alertas P1: Ingesta caída; error rate > 1% en 5 min; DB no disponible.
- Alertas P2: Latencia p95 > 1s; dashboard no responde; RLS mal configurada.
- Alertas P3: Tabla `log_entries` > 5M registros (advertencia de crecimiento).
- Owner de guardia: Iván Ezequiel Iencinella.
- Integración: `@repo/api-utils/log-client` para auto-monitoreo de la app Log.

### RUM y analíticas (extensión)

- Dashboard principal: `/dashboard-producto` en la app Log.
- Alertas P1:
  - SDK RUM rompe app anfitriona (reportado via `@repo/api-utils/log-client` con `level=fatal` y `app=<app-afectada>`)
  - Fuga de PII detectada en evento RUM (`metadata` con regex PII)
  - Consentimiento no respetado (`has_consent=false` en eventos)
- Alertas P2:
  - Volumen de eventos RUM supera threshold (advertencia de saturación de ingesta)
  - Latencia p95 ingesta RUM > 2s
  - Tamaño del SDK RUM > 5KB comprimido
- Alertas P3:
  - Tabla `rum_events` > 10M registros
  - Tabla `rum_vitals` > 5M registros
- Owner de guardia: Iván Ezequiel Iencinella.
- Integración:
  - Dashboard de producto consume métricas de RUM via `GET /api/dashboard/producto`.
  - Alertas se reportan via `@repo/api-utils/log-client` a la propia app Log (dogfooding).
