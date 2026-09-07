---
tags:
  - proyecto/fosforo
  - prd
  - aplicacion/log
  - rum
  - analiticas
type: app-prd
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
  - "[[../../01-Arquitectura/Capacidades Compartidas/SRS-Observabilidad-y-Auditoria|SRS Observabilidad]]"
---

# PRD - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `PRD-0105-LOG-*` (logs operativos), `PRD-LOG-RUM-*` (RUM y analíticas)
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Problema y oportunidad

### Logs operativos (MVP vigente)

- **Problema:** Las aplicaciones del ecosistema Fósforo generan errores y eventos sin un punto central de monitoreo. Cada equipo debe revisar logs localmente o no tiene visibilidad del estado de las apps. Esto retrasa la detección de incidentes y dificulta el análisis de causas raíz.
- **Oportunidad:** Un sistema centralizado de logs permitirá detectar errores en tiempo real, identificar patrones, medir SLIs y reducir el tiempo de diagnóstico de incidentes de horas a minutos.

### RUM y analíticas (extensión 2026-09-05)

- **Problema:** Las apps del ecosistema no tienen visibilidad sobre rendimiento percibido por usuarios reales (Web Vitals) ni sobre comportamiento de uso (pageviews, embudos, retención). Cada equipo toma decisiones de producto sin datos reales.
- **Oportunidad:** Un sistema de RUM y analíticas de producto, con SDK compartido integrable desde el día 1, permitirá medir impacto de features, detectar regresiones de rendimiento y priorizar roadmap con datos reales, sin dependencias externas y respetando privacidad del usuario (DNT, sin PII).

## 3. Objetivo de negocio

### Logs operativos

Reducir el tiempo medio de detección y diagnóstico de errores en las apps del ecosistema Fósforo mediante un panel de observabilidad unificado, accesible para los equipos de desarrollo y operaciones.

### RUM y analíticas

Proporcionar visibilidad de rendimiento percibido (Web Vitals) y comportamiento de uso (pageviews, embudos, retención) mediante telemetría anonimizada capturada desde las apps del ecosistema con un SDK compartido, accesible para los equipos de desarrollo, operaciones y producto.

## 4. Segmentos y JTBD

### Logs operativos

- **Segmento principal:** Equipo de desarrollo de Fósforo (devs)
  - JTBD principal: "Cuando una app falla, quiero ver el error rápidamente para diagnosticar y corregir sin tener que acceder a cada servidor."
- **Segmento secundario:** Equipo de operaciones/DevOps
  - JTBD secundario: "Quiero monitorear la salud del ecosistema en un solo panel y recibir alertas cuando algo se degrada."

### RUM y analíticas

- **Segmento principal:** Equipo de producto
  - JTBD principal: "Quiero medir el impacto de una feature lanzando un embudo y midiendo retención, sin esperar a un dev que arme un dashboard."
- **Segmento secundario:** Equipo de desarrollo
  - JTBD secundario: "Quiero detectar regresiones de rendimiento (Web Vitals) antes de que los usuarios reporten quejas."
- **Segmento terciario:** Equipo de operaciones
  - JTBD terciario: "Quiero monitorear errores de frontend en producción y correlacionarlos con el comportamiento del usuario."

## 5. Alcance MVP

### MVP Logs operativos (vigente)

| ID               | Requisito de producto                     | Prioridad | Justificación                                         |
| ---------------- | ----------------------------------------- | --------- | ----------------------------------------------------- |
| PRD-0105-LOG-001 | API de ingesta de logs                    | Must      | Base del sistema: sin ingesta no hay datos            |
| PRD-0105-LOG-002 | Listado y busqueda de logs                | Must      | Funcionalidad principal de consulta                   |
| PRD-0105-LOG-003 | Vista detalle de log                      | Must      | Necesaria para diagnosticar errores                   |
| PRD-0105-LOG-004 | Dashboard con metricas basicas            | Must      | Visibilidad rapida del estado del sistema             |
| PRD-0105-LOG-005 | Autenticacion y control de acceso por rol | Must      | Datos sensibles de operacion, solo dev/ops            |
| PRD-0105-LOG-006 | Alertas basicas en UI                     | Should    | Valor añadido sin depender de infraestructura externa |

### MVP RUM y analíticas (extensión)

| ID              | Requisito de producto                                                           | Prioridad | Justificación                                                         |
| --------------- | ------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------- |
| PRD-LOG-RUM-001 | SDK `@repo/analytics` integrable por apps del ecosistema                        | Must      | Sin SDK compartido, cada app duplica lógica de tracking               |
| PRD-LOG-RUM-002 | Ingesta de eventos de producto (pageview, custom event) con taxonomía común     | Must      | Taxonomía común evita fragmentación de datos                          |
| PRD-LOG-RUM-003 | Captura automática de Web Vitals (LCP, INP, CLS) por página                     | Must      | Web Vitals son el estándar de la industria para rendimiento percibido |
| PRD-LOG-RUM-004 | Captura de errores de frontend con contexto (app, versión, browser, stack)      | Must      | Permite diagnosticar incidentes de frontend correlacionados con UX    |
| PRD-LOG-RUM-005 | Dashboard de producto con embudos, retención, top páginas, segmentación por app | Must      | Sin dashboard, los datos capturados no generan insights               |
| PRD-LOG-RUM-006 | Consentimiento del usuario y respeto de DNT (sin PII, sin IP persistida)        | Must      | Privacidad y cumplimiento normativo                                   |
| PRD-LOG-RUM-007 | Sampling configurable por app y tipo de evento                                  | Should    | Evita saturar ingesta en apps de alto tráfico                         |
| PRD-LOG-RUM-008 | Separación clara entre dashboard operativo (logs) y dashboard de producto (RUM) | Must      | Audiencias y queries diferentes; roles diferentes                     |

## 6. No alcance MVP

### Logs operativos

- Alertas por email, Slack o webhooks
- Deduplicacion automatica de logs repetidos
- Exportacion a CSV/JSON
- Correlacion de trazas distribuidas (trace ID)
- Panel de administracion de usuarios dentro de la app (se gestiona via Supabase)
- Retencion configurable por nivel de log

### RUM y analíticas

- Session recording / replay
- Heatmaps
- Data warehousing avanzado
- Analítica de marketing con PII identificable
- Tracking cross-session de usuarios (sin user ID crudo)
- Integración con herramientas externas (Google Analytics, Mixpanel, PostHog)
- Push de eventos a data lake externo

## 7. KPI y criterios de exito

### Logs operativos

- **KPI principal:** Tiempo entre generacion del log y visualizacion en dashboard < 5 segundos (p95)
- **KPI secundario 1:** % de apps del ecosistema integradas al sistema de logging (> 80% en primeros 3 meses)
- **KPI secundario 2:** Tiempo promedio de diagnostico de incidentes (objetivo: reduccion del 50% respecto a la linea base sin el sistema)

### RUM y analíticas

- **KPI principal 1:** Latencia p95 de ingesta RUM < 1 segundo
- **KPI principal 2:** 100% de apps nuevas del ecosistema integran SDK RUM desde el día 1
- **KPI secundario 1:** SDK `@repo/analytics` < 5KB comprimido
- **KPI secundario 2:** Tasa de eventos RUM perdidos < 2%
- **KPI secundario 3:** Tasa de adopción del dashboard de producto por equipo de producto (> 50% en 3 meses)

## 8. Riesgos de negocio

### Logs operativos

| Riesgo                                       | Impacto | Mitigacion                                                                       | Owner           |
| -------------------------------------------- | ------- | -------------------------------------------------------------------------------- | --------------- |
| Baja adopcion por apps del ecosistema        | Alto    | Documentacion clara de integracion; hacer la ingesta simple (POST JSON)          | Owner tecnico   |
| Falsos positivos saturan el dashboard        | Medio   | Filtros por nivel y app; alertas configurables por threshold                     | Owner producto  |
| Costo de almacenamiento crece con el volumen | Medio   | Definir politicas de retencion desde el MVP; usar tablas particionadas por fecha | Owner tecnico   |
| Acceso no autorizado a logs sensibles        | Alto    | RLS estricto por rol; solo dev/ops; auditoria de accesos                         | Seguridad owner |

### RUM y analíticas

| Riesgo                                        | Impacto | Mitigacion                                                                              | Owner           |
| --------------------------------------------- | ------- | --------------------------------------------------------------------------------------- | --------------- |
| Fuga de PII via eventos RUM                   | Alto    | Anonimización obligatoria en SDK; validación de schema en ingesta; revisión de metadata | Owner tecnico   |
| Consentimiento no respetado                   | Alto    | SDK respeta DNT; banner de consentimiento obligatorio; auditoría                        | Seguridad owner |
| Volumen de eventos RUM satura ingesta         | Medio   | Sampling configurable por app; rate limiting separado del de logs                       | Owner tecnico   |
| Baja adopción del dashboard de producto       | Medio   | UI simple con embudos predefinidos por app; documentación y ejemplos                    | Owner producto  |
| SDK RUM degrada rendimiento de app anfitriona | Medio   | SDK no bloqueante (sendBeacon); < 5KB; try-catch global; nunca lanza errores            | Owner tecnico   |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
- SRS transversal de Observabilidad: [SRS-Observabilidad-y-Auditoria](../../01-Arquitectura/Capacidades%20Compartidas/SRS-Observabilidad-y-Auditoria.md)
