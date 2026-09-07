---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
  - web
  - fase-2
  - sla
  - slo
type: app-sla-slo
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[07-ERM]]"
  - "[[02-SRS]]"
---

# Oraciones - Web - SLA y SLO

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Objetivos de nivel de servicio

| ID           | Objetivo                | Métrica                                                           | Umbral    | Fuente                                       |
| ------------ | ----------------------- | ----------------------------------------------------------------- | --------- | -------------------------------------------- |
| SLO-ORAC-001 | Disponibilidad          | % de requests 200/301/304 sobre totales (ventana 30 días)         | >= 99.5 % | Monitoring Vercel + uptime externo           |
| SLO-ORAC-002 | Velocidad percibida     | LCP p75 (navegación a listado o ficha)                            | < 2.5 s   | RUM Web Vitals                               |
| SLO-ORAC-003 | Latencia de servidor    | TTFB p95 en páginas cacheadas                                     | < 800 ms  | RUM/Web Vitals + logs Vercel                 |
| SLO-ORAC-004 | Tasa de error           | % de 5xx sobre totales                                            | < 0.1 %   | Logs Vercel                                  |
| SLO-ORAC-005 | Calidad del buscador    | % de búsquedas con >= 1 resultado visto (clic posterior en ficha) | > 70 %    | RUM `oracion.searched`                       |
| SLO-ORAC-006 | Corrección de contenido | Tiempo entre reporte confirmado y corrección publicada en CMS     | < 48 h    | Seguimiento editorial + `oraciones.reports`  |
| SLO-ORAC-007 | Privacidad              | Incidentes con exposición de PII en RUM o reportes                | 0         | Checklist de release + auditoría de payloads |

## Error budget

- Tercero sobre 99.5 % de disponibilidad → error budget de **3.6 horas/mes** (0.5 % de 720 h).
- Uso del budget:
  - Si el budget se acumula (no agotado), se priorizan cambios/features.
  - Si el budget se agota en el mes: se congelan cambios no críticos hasta restaurar el margen (regla del ecosistema de plataformas).
- Consumos esperados: deploy window, degradación del CMS (mitigada por cache, ADR-ORAC-002).

## Alertas

### P1 (responde on-call de inmediato)

- Página caída (disponibilidad < 99 % en 15 min) → runbook ERM-ORAC-002/003.
- Error rate > 2 % durante 10 min.
- Eventos RUM detectados con PII (ERM-ORAC-004).

### P2 (mismo día hábil)

- CMS no responde mientras la cache está vencida en páginas clave (determinación de banner activo > 1 h).
- LCP p75 > 3 s sostenido 24 h.
- Fallo de escritura en Supabase detectado por monitores sintéticos (colecciones/favoritos/recordatorios).

### P3 (corrección en sprint)

- Picos de tráfico con latencia degradada pero sobre la cache (ERM-ORAC-003).
- Recordatorios fallidos reportados por usuarios (ERM-ORAC-006).
- Tasa de búsqueda exitosa < 60 % en 7 días (revisar cobertura y calidad del contenido en el CMS).

## Revisión y reporting

- Revisión mensual de SLOs y error budget con los registros del Sistema de Log.
- Runbooks referenciados en [07-ERM](07-ERM.md). RTO 4 h / RPO 24 h para la capa personal.
- Este documento queda actualizado junto con cualquier cambio de SLO en PR.
