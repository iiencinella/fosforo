---
tags:
  - proyecto/fosforo
  - horarios
  - erm
  - aplicación
type: app-erm
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
  - "[[06-Esquema de Datos|Esquema de Datos Horarios]]"
---

# ERM - 0106_horarios

## 1. Ficha

- ID base: `ERM-0106-HORARIOS-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. Registro de riesgos y errores

| ID                    | Riesgo/Error                                                       | Tipo   | Severidad | Mitigación                                                                                    | Owner            |
| --------------------- | ------------------------------------------------------------------ | ------ | --------- | --------------------------------------------------------------------------------------------- | ---------------- |
| ERM-0106-HORARIOS-001 | Horarios desactualizados en templos con alta demanda               | Riesgo | P1        | Estado visible por templo, auditoria semanal y circuito de correccion priorizado por trafico. | Producto/Técnico |
| ERM-0106-HORARIOS-002 | Caida de DB o degradacion de consultas de busqueda                 | Riesgo | P1        | Healthcheck, retries controlados, cache de lectura y monitoreo de latencia p95.               | Técnico          |
| ERM-0106-HORARIOS-003 | Geolocalizacion no disponible o denegada por usuario               | Error  | P3        | Fallback automatico a orden por relevancia textual y ciudad.                                  | Técnico          |
| ERM-0106-HORARIOS-004 | Filtros inconsistentes generan resultados erroneos                 | Error  | P2        | Validaciones estrictas en backend + pruebas unitarias de combinatoria de filtros.             | Técnico          |
| ERM-0106-HORARIOS-005 | Exposicion accidental de datos sensibles en telemetria de busqueda | Riesgo | P2        | Minimizar payload de eventos, sin PII y retencion acotada.                                    | Seguridad owner  |
| ERM-0106-HORARIOS-006 | Pico de trafico en solemnidades o fechas especiales                | Riesgo | P2        | Escalado automatico en plataforma y cache de endpoints de lectura.                            | Técnico          |

## 3. Runbooks

- P1 - Datos desactualizados: marcar templo en `review`, publicar aviso visible y escalar al circuito de actualizacion prioritaria.
- P1 - Caida de backend de lectura: validar `/api/health`, revisar logs y activar pagina degradada con mensaje operativo.
- P2 - Degradacion de filtros: rollback de version de API, activar feature flag de filtro afectado y validar consultas base.
- P3 - Geolocalizacion fallida: registrar incidente no bloqueante, mantener busqueda textual y sugerir ingreso manual de ciudad.

## 4. Continuidad operativa

- RTO objetivo: 4 horas para restaurar consulta publica ante caida severa.
- RPO objetivo: 1 hora para datos operativos de soporte (telemetria/eventos).
- Estrategia de rollback: mantener ultimo deploy estable en Vercel + reversión de migraciones no destructivas en Supabase.
