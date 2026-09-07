---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-sla-slo
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# SLA y SLO — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Acuerdo de nivel de servicio (SLA)

- **Servicio:** Lectio Divina WEB (sesión guiada, diario, historial, preferencias).
- **Disponibilidad comprometida:** 99.5 % mensual.
- **Mantenimiento:** ventanas coordinadas con plataformas del monorepo; avisos previos.
- **Soporte:** P1 respuesta < 30 min; P2 < 4 h; P3 < 1 día hábil.

## 2. SLIs y SLOs

### SLO-LECTIO-001 — Disponibilidad

| Campo | Valor                                                                        |
| ----- | ---------------------------------------------------------------------------- |
| SLI   | % minutos con health check OK de la app (rutas `/hoy`, `/sesion`, `/diario`) |
| SLO   | >= 99.5 % mensual                                                            |

### SLO-LECTIO-002 — LCP p75 < 2.5 s

| Campo | Valor                                                                                 |
| ----- | ------------------------------------------------------------------------------------- |
| SLI   | Largest Contentful Paint p75 (RUM web vitals) en `/hoy`, `/sesion/[fecha]`, `/diario` |
| SLO   | < 2.5 s mensual por ruta                                                              |

### SLO-LECTIO-003 — Pérdida de entradas de diario = 0

| Campo | Valor                                                                                  |
| ----- | -------------------------------------------------------------------------------------- |
| SLI   | Entradas confirmadas por autoguardado que faltan tras incidente (compare post-restore) |
| SLO   | 0 perdidas (crédito: cola local/autoguardado + PITR; RPO 1 h, ERM-LECTIO-002)          |

### SLO-LECTIO-004 — Accesos al diario por no-dueño = 0

| Campo | Valor                                                                                     |
| ----- | ----------------------------------------------------------------------------------------- |
| SLI   | Filas de `lectio` leídas/escritas por `auth.uid()` ≠ dueño (auditoría + tests RLS + logs) |
| SLO   | 0 accesos (cualquier acceso > 0 dispara incidente P1, RUN-LEX)                            |

### SLO-LECTIO-005 — Autoguardado exitoso > 99.5 %

| Campo | Valor                                                               |
| ----- | ------------------------------------------------------------------- |
| SLI   | `PUT /api/diario/{paso}` exitosos (después de reintentos) / totales |
| SLO   | > 99.5 % mensual                                                    |

### SLO-LECTIO-006 — Corrección de contenido < 48 h

| Campo | Valor                                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| SLI   | Tiempo en corregir textos erróneos reportados (guía o lecturas desalineadas) desde reporte a corrección publicada |
| SLO   | < 48 h (guía vía PR del repositorio; lecturas vía CMS)                                                            |

### SLO-LECTIO-007 — PII en RUM = 0

| Campo | Valor                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------- |
| SLI   | Eventos RUM con contenido/palabras del diario detectados por auditoría (TC-LECTIO-015 + escaneo runtime) |
| SLO   | 0 (incidente P1 con purga, RUN-RUM)                                                                      |

### SLO-LECTIO-008 — TTFB p95 < 800 ms

| Campo | Valor                                                  |
| ----- | ------------------------------------------------------ |
| SLI   | Server TTFB p95 de rutas SSR (excluye red del cliente) |
| SLO   | < 800 ms                                               |

## 3. Presupuesto de error (error budget) mensual

Base 99.5 % → presupuesto: **~3.6 h/mes** de indisponibilidad.

| SLO                  | Presupuesto asignado       | Consumo    | Acción si se agota                            |
| -------------------- | -------------------------- | ---------- | --------------------------------------------- |
| Disponibilidad (001) | 3.6 h indisp.              | RUM/health | Congelar cambios feature; hacer confiabilidad |
| LCP (002)            | 15 % de vistas sobre 2.5 s | RUM        | Optimizar render/imagen/SSR antes de features |
| Autoguardado (005)   | 0.5 % fallidos             | logs API   | Congelar; revisar dependencias Supabase       |
| TTFB (008)           | 5 % p95 sobre 800 ms       | APM        | Revisar SSR/dependencias Motor                |

## 4. Alertas

| ID            | Alerta                                       | Condición                                                                                                 | Severidad | Destino                          |
| ------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------- | -------------------------------- |
| AL-LECTIO-01  | **RLS violada o sospecha de acceso cruzado** | Cualquier acceso a `lectio.*` de no-dueño detectado en logs/auditoría, o fallo de tests RLS en producción | P1        | Security + on-call (RUN-LEX)     |
| AL-LECTIO-02  | Pérdida/ineguridad de entradas               | Autoguardado exitoso < 99.5 % en 1 h, o mismatches post-restore                                           | P1        | On-call (RUN-REC)                |
| AL-LECTIO-03  | App indisponible                             | Health check falla ≥ 2 min                                                                                | P1        | On-call                          |
| AL-LECTIO-04  | Motor degradado                              | Motor sin lecturas > 5 min o error rate > 20 %                                                            | P2        | On-call + equipo Motor (RUN-MOT) |
| AL-LECTIO-005 | PII sospechada en RUM                        | Escaneo detecta longitud/keywords atípicas en payload                                                     | P1        | Security (RUN-RUM)               |
| AL-LECTIO-06  | Latencia degradada                           | TTFB p95 > 800 ms por 15 min o LCP p75 > 2.5 s en día completo                                            | P2        | On-call                          |
| AL-LECTIO-07  | CMS caído                                    | Error rate CMS > 50 % o cache vacía                                                                       | P3        | Equipo contenidos (RUN-CMS)      |
| AL-LECTIO-08  | Abandono                                     | Sesiones/semana por cohortes caen > 30 % WoW                                                              | P3        | Producto (RUN-GRO)               |

## 5. Revisión

- Reporte mensual de SLOs junto a KPIs de producto (sesiones/semana; `00-README.md` §5).
- Revisión trimestral junto a `07-ERM.md` y `10-OWASP.md`.
