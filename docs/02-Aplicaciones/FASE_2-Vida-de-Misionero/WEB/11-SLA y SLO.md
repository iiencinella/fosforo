---
tags:
  - proyecto/fosforo
  - aplicación
  - fase-2
type: app-sla-slo
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[07-ERM|ERM Vida de Misionero]]"
  - "[[01-PRD|PRD Vida de Misionero]]"
---

# SLA y SLO - Vida de Misionero (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. SLA del servicio

- **Disponibilidad comprometida: 99.5% mensual** (aprox. 3h 39m de downtime máximo al mes) para las funciones core: ver rutas, ver "hoy", completar misión, ver progreso.
- Ventanas de mantenimiento planificado se comunican con >= 48h y quedan fuera del cómputo cuando sea posible.
- El cómputo de disponibilidad se mide con checks sintéticos autenticados sobre `/hoy` + éxito de `POST /api/misiones/completar` (probes con usuario de prueba).

## 2. SLOs (SLO-MISION-001..008)

| ID             | SLO                                                                     | Objetivo                    | Medición                                                          |
| -------------- | ----------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------- |
| SLO-MISION-001 | Disponibilidad del servicio (funciones core)                            | >= 99.5% mensual            | Checks sintéticos + error rate server (5xx)                       |
| SLO-MISION-002 | Performance de carga: LCP p75 en `/rutas`, `/hoy`, `/progreso`          | < 2.5s (móvil, 4G)          | RUM/Real user metrics + lab (Lighthouse)                          |
| SLO-MISION-003 | Integridad de completado: tasa de completados registrados sin duplicado | 100% (idempotencia exacta)  | Diff `mission_completions` vs puntos otorgados; constraint unique |
| SLO-MISION-004 | Pérdida de progreso                                                     | 0 eventos (RPO 1h, RTO 2h)  | Auditoría post-incidente + conteo vs RUM del período              |
| SLO-MISION-005 | Reset diario correcto (disponibilidad del día materializada por TZ)     | >= 99.9% de ejecuciones     | Logs del cron + alarma de fallo; idempotencia verificada          |
| SLO-MISION-006 | Corrección de contenido reportado (ERM-MISION-003 / FR-MISION-010)      | < 48h hábiles desde reporte | Cola de `content_reports` del CMS (tiempo de resolución)          |
| SLO-MISION-007 | Privacidad: PII en eventos RUM/logs                                     | 0 hallazgos                 | Escaneo automático semanal + revisión de release                  |
| SLO-MISION-008 | Recordatorios entregados (opt-in, con Notificaciones)                   | > 95% de envíos esperados   | Métricas del Sistema de Notificaciones (entregados/en cola)       |

## 3. Error budget

- Presupuesto mensual: (1 - 0.995) x 30d x 24h = **3.6h/mes** de indisponibilidad tolerada en funciones core.
- Consumo del budget (dashboard): > 50% consumido -> congelar cambios no críticos, priorizar confiabilidad; > 80% -> solo fixes de estabilidad.
- El error budget aplica a SLO-MISION-001/002/005; SLO-MISION-003/004/007 son objetivos de integridad sin budget (0 tolerancia).

## 4. Alertas y severidades

### P1 (respuesta inmediata, guardia on-call)

| Condición                                          | Umbral               | Acción                                         |
| -------------------------------------------------- | -------------------- | ---------------------------------------------- |
| Escrituras de progreso fallando (5xx en completar) | > 5 min consecutivos | Mitigación + posible congelar escrituras (ERM) |
| Indicios de pérdida/daño de progreso               | Cualquier detección  | Runbook ERM-MISION-002 (RTO 2h)                |
| PII en RUM/logs (scanner)                          | Cualquier hallazgo   | Purga + fix del emisor (ERM-MISION-006)        |
| Indisponibilidad de funciones core                 | Downtime > 5 min     | Incidente P1, status page                      |

### P2 (mismo día hábil)

| Condición                                                 | Umbral             | Acción                                  |
| --------------------------------------------------------- | ------------------ | --------------------------------------- |
| Cron de reset diario fallido                              | 1 falla            | Re-ejecutar (idempotente) + investigar  |
| CMS sin misiones vigentes del día                         | Detección por cron | Alerta a editores (ERM-MISION-003)      |
| Anomalías anti-fraude (completados/min > p99 por usuario) | Umbral de anomalía | Revisión de moderación (ERM-MISION-001) |
| Tasa de duplicado de puntos > 0                           | Cualquier caso     | Bug P2 + fix con test                   |

### P3 (backlog semanal)

| Condición                                     | Umbral                 | Acción                                |
| --------------------------------------------- | ---------------------- | ------------------------------------- |
| CMS degradado (cache sirviendo stale)         | > 30 min               | Coordinar con app CMS                 |
| Recordatorios por debajo de 95% entregados    | 1 ciclo diario         | Revisar con Notificaciones            |
| KPI retención 30d < 40% o misiones/semana < 3 | 2 semanas consecutivas | Análisis de producto (ERM-MISION-007) |
| LCP p75 > 2.5s en algún core page             | 1 semana               | Optimización en backlog               |

## 5. Reportes y revisión

- **Reporte mensual de SLO:** disponibilidad, LCP p75, error budget consumido, incidentes por severidad, correcciones de contenido < 48h, hallazgos de PII (esperado: 0).
- **Revisión trimestral:** revisar umbrales con datos reales, ejercicios de restauración (ERM-MISION-002), test de TZ en producción controlada, balance del juego (puntos/niveles) con ADR-MISION-005.
- **Fuente de verdad:** Log (RUM + logs), métricas DB, métricas del Sistema de Notificaciones; el dashboard consolidado es del ecosistema.

## 6. Compromisos con el usuario

- Su progreso, racha e insignias no se pierden (RPO 1h / RTO 2h, cero pérdida objetivo).
- Sus completados valen una sola vez y su racha se cuenta en SU día, no en el del servidor.
- Su privacidad: progreso privado por defecto (RLS) y telemetría sin datos personales.
- Sus recordatorios solo si él los pidió, y se detienen apenas los revoca.
