---
tags:
  - proyecto/fosforo
  - prd
  - aplicacion/log
type: app-prd
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|README Log]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - 0105_log

## 1. Ficha

- ID base: `PRD-0105-LOG-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-05-26
- Estado: vigente

## 2. Problema y oportunidad

- **Problema:** Las aplicaciones del ecosistema Fósforo generan errores y eventos sin un punto central de monitoreo. Cada equipo debe revisar logs localmente o no tiene visibilidad del estado de las apps. Esto retrasa la detección de incidentes y dificulta el análisis de causas raíz.
- **Oportunidad:** Un sistema centralizado de logs permitirá detectar errores en tiempo real, identificar patrones, medir SLIs y reducir el tiempo de diagnóstico de incidentes de horas a minutos.

## 3. Objetivo de negocio

Reducir el tiempo medio de detección y diagnóstico de errores en las apps del ecosistema Fósforo mediante un panel de observabilidad unificado, accesible para los equipos de desarrollo y operaciones.

## 4. Segmentos y JTBD

- **Segmento principal:** Equipo de desarrollo de Fósforo (devs)
  - JTBD principal: "Cuando una app falla, quiero ver el error rápidamente para diagnosticar y corregir sin tener que acceder a cada servidor."
- **Segmento secundario:** Equipo de operaciones/DevOps
  - JTBD secundario: "Quiero monitorear la salud del ecosistema en un solo panel y recibir alertas cuando algo se degrada."

## 5. Alcance MVP

| ID               | Requisito de producto                     | Prioridad | Justificación                                         |
| ---------------- | ----------------------------------------- | --------- | ----------------------------------------------------- |
| PRD-0105-LOG-001 | API de ingesta de logs                    | Must      | Base del sistema: sin ingesta no hay datos            |
| PRD-0105-LOG-002 | Listado y busqueda de logs                | Must      | Funcionalidad principal de consulta                   |
| PRD-0105-LOG-003 | Vista detalle de log                      | Must      | Necesaria para diagnosticar errores                   |
| PRD-0105-LOG-004 | Dashboard con metricas basicas            | Must      | Visibilidad rapida del estado del sistema             |
| PRD-0105-LOG-005 | Autenticacion y control de acceso por rol | Must      | Datos sensibles de operacion, solo dev/ops            |
| PRD-0105-LOG-006 | Alertas basicas en UI                     | Should    | Valor añadido sin depender de infraestructura externa |

## 6. No alcance MVP

- Alertas por email, Slack o webhooks
- Deduplicacion automatica de logs repetidos
- Exportacion a CSV/JSON
- Correlacion de trazas distribuidas (trace ID)
- Panel de administracion de usuarios dentro de la app (se gestiona via Supabase)
- Retencion configurable por nivel de log

## 7. KPI y criterios de exito

- **KPI principal:** Tiempo entre generacion del log y visualizacion en dashboard < 5 segundos (p95)
- **KPI secundario 1:** % de apps del ecosistema integradas al sistema de logging (> 80% en primeros 3 meses)
- **KPI secundario 2:** Tiempo promedio de diagnostico de incidentes (objetivo: reduccion del 50% respecto a la linea base sin el sistema)

## 8. Riesgos de negocio

| Riesgo                                       | Impacto | Mitigacion                                                                       | Owner           |
| -------------------------------------------- | ------- | -------------------------------------------------------------------------------- | --------------- |
| Baja adopcion por apps del ecosistema        | Alto    | Documentacion clara de integracion; hacer la ingesta simple (POST JSON)          | Owner tecnico   |
| Falsos positivos saturan el dashboard        | Medio   | Filtros por nivel y app; alertas configurables por threshold                     | Owner producto  |
| Costo de almacenamiento crece con el volumen | Medio   | Definir politicas de retencion desde el MVP; usar tablas particionadas por fecha | Owner tecnico   |
| Acceso no autorizado a logs sensibles        | Alto    | RLS estricto por rol; solo dev/ops; auditoria de accesos                         | Seguridad owner |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
