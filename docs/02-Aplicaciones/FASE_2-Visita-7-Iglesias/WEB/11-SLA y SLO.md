---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
  - sla-slo
type: app-sla-slo
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[01-PRD]]"
  - "[[07-ERM]]"
  - "[[10-OWASP]]"
---

# SLA y SLO - Visita 7 Iglesias

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto

El servicio tiene estacionalidad extrema: el Jueves Santo concentra el pico anual y es el único día en que la devoción "oficial" se practica masivamente. Los SLO se definen con dos regímenes: **régimen normal** (todo el año) y **régimen de temporada** (Semana Santa, con prioridad máxima esa semana).

## Objetivos de servicio (SLO)

| ID          | SLO                                       | Objetivo (régimen normal) | Objetivo (Semana Santa)                      | Fuente de medición                                                   |
| ----------- | ----------------------------------------- | ------------------------- | -------------------------------------------- | -------------------------------------------------------------------- |
| SLO-V7I-001 | Disponibilidad del servicio (web + API)   | 99.5 % mensual            | **99.9 % durante la semana de Jueves Santo** | Uptime Vercel + checks sintéticos                                    |
| SLO-V7I-002 | LCP p75 (listado y ficha)                 | < 2.5 s                   | < 2.5 s                                      | RUM Web Vitals                                                       |
| SLO-V7I-003 | Marca de visita sin duplicado             | = 100 %                   | = 100 %                                      | `UNIQUE (pilgrimage_id, church_ref)` + auditoría: 0 filas duplicadas |
| SLO-V7I-004 | Pérdida de progreso del usuario           | = 0 casos confirmados     | = 0 casos confirmados                        | Soporte + auditoría Supabase + backups (RPO 24h)                     |
| SLO-V7I-005 | Corrección de datos de iglesia reportados | < 72 h                    | **< 48 h** (cola prioritaria)                | Tiempo entre reporte y corrección en el CMS                          |
| SLO-V7I-006 | PII en eventos RUM                        | = 0 eventos con PII       | = 0                                          | Auditoría de eventos `v7i.*` por release                             |
| SLO-V7I-007 | TTFB p95 (rutas de itinerarios cacheadas) | < 800 ms                  | < 800 ms (hit ratio CDN > 95 %)              | RUM + métricas CDN/Vercel                                            |

## SLA del servicio

- Disponibilidad mínima comprometida del servicio web: **99.5 % mensual** (régimen normal), elevada a **99.9 %** en la semana de Jueves Santo mediante plan de capacidad, load test pre-temporada y guardia activa.
- No aplica SLA sobre el contenido de terceros embebido (mapas): la dirección textual es la fuente primaria siempre disponible.

## Error budget

- Régimen normal: budget mensual de **3.6 h** (99.5 % de ~730 h) de indisponibilidad.
- Semana Santa: budget semanal de **~10 min** (99.9 % de ~168 h); cualquier incidente en esa ventana consume el budget y activa revisión inmediata post-temporada.
- Consumo del budget por exceso de latencia: si TTFB p95 supera 800 ms por más de 1 h seguida en rutas cacheadas, se cuenta como error presupuestario y obliga a revisar hit ratio de CDN.
- Política de congelamiento: en la semana previa al Jueves Santo, **freeze de releases** salvo hotfix de seguridad o corrección de datos de iglesias (P1).

## Alertas

| Severidad | Condición                                                                                  | Acción                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **P1**    | Servicio caído o tasa de error > 5 % en la semana de Jueves Santo                          | Guardia inmediata; activar Runbook 2 (07-ERM); comunicación en banner si afecta al usuario   |
| **P1**    | Pérdida de progreso confirmada (SLO-V7I-004 violado)                                       | Runbook 3 (07-ERM): restaurar/compensar; fix con test de regresión (TC-V7I-005/006)          |
| **P1**    | Dato de iglesia errado con reporte activo en temporada (SLO-V7I-005)                       | Corrección exprés en CMS (< 48 h) vía Runbook 1 (07-ERM)                                     |
| **P1**    | Evento RUM con PII detectado (SLO-V7I-006)                                                 | Desactivar evento, purgar datos, fix inmediato y revisión de privacidad del release          |
| **P2**    | TTFB p95 > 800 ms sostenido > 1 h, o hit ratio de CDN < 95 % en Semana Santa (SLO-V7I-007) | Revisar cache/tags, invalidación y plan de capacidad Vercel                                  |
| **P2**    | CMS degradado con banners activos en producción (ERM-V7I-004)                              | Verificar última cache válida; escalar al equipo CMS; mantener escritura de marcas operativa |
| **P3**    | Dato de iglesia errado fuera de temporada (corrección < 72 h, SLO-V7I-005)                 | Cola editorial normal                                                                        |
| **P3**    | Reportes de reportes/bugs menores de UI                                                    | Backlog normal con priorización por impacto                                                  |

### Verificación pre-Jueves Santo (obligatoria, checklist)

- [ ] Load test sobre rutas cacheadas con hit ratio CDN > 95 % (SLO-V7I-007).
- [ ] Verificación editorial de las iglesias de las 3 ciudades: dirección, horario de apertura, mapa (ERM-V7I-001).
- [ ] Revisión OWASP: headers, CSP, rate limiting, RLS (10-OWASP).
- [ ] Backups verificados: último backup < 24 h, restauración probada (RTO 4h / RPO 24h, 07-ERM).
- [ ] Tests críticos en verde: idempotencia (TC-V7I-006), progreso (TC-V7I-008), completación (TC-V7I-009).
- [ ] Freeze de releases activo (solo hotfix P1).
- [ ] Guardia definida para Jueves Santo y Viernes Santo con acceso a runbooks.
