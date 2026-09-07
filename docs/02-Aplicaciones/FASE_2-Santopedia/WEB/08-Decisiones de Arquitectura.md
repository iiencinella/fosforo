---
tags:
  - proyecto/fosforo
  - santopedia
  - adrs
  - arquitectura
  - web
type: app-arquitectura
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS|02-SRS]]"
  - "[[06-Esquema de Datos|06-Esquema de Datos]]"
  - "[[09-Especificacion Tecnica|09-Especificacion Tecnica]]"
---

# Santopedia — Decisiones de Arquitectura (ADRs)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Índice de decisiones

| ID            | Decisión                                               | Estado   |
| ------------- | ------------------------------------------------------ | -------- |
| ADR-SANTO-001 | Contenido SIEMPRE del CMS                              | Aceptada |
| ADR-SANTO-002 | Fiesta SIEMPRE del Motor Litúrgico                     | Aceptada |
| ADR-SANTO-003 | SSR cacheado por slug (contenido casi estático)        | Aceptada |
| ADR-SANTO-004 | Búsqueda vía CMS (full-text); índice dedicado post-MVP | Aceptada |
| ADR-SANTO-005 | Solo esquema `santopedia` para datos de usuario        | Aceptada |
| ADR-SANTO-006 | RUM desde el día 1 (consentido)                        | Aceptada |
| ADR-SANTO-007 | JSON-LD (`schema.org/Person`) para SEO                 | Aceptada |

## ADR-SANTO-001 — Contenido SIEMPRE del CMS

- **Contexto:** Santopedia necesita biografías, patronazgos e iconografía confiables y corregibles.
- **Decisión:** el 100% del contenido proviene del CMS (content type `santo`); la app no tiene contenido local, ni copias en Postgres, ni archivos de datos propios.
- **Alternativas consideradas:**
  - _Duplicar contenido en Postgres o en archivos JSON de la app:_ descartada porque genera divergencia editorial (dos fuentes de verdad), duplica el flujo de corrección y contradice la capacidad compartida de contenido del ecosistema.
  - _Scrapear sitios hagiográficos externos:_ descartada por derechos, calidad y fiabilidad.
- **Consecuencias:** dependencia dura del CMS (mitigada con cache SSR, ADR-SANTO-003); la corrección de contenido es una sola y propaga a todo el ecosistema.
- **Riesgos y mitigaciones:** CMS caído → cache + banner de degradación (ERM-SANTO-002); contenido erróneo → revisión editorial + reportes con SLA 48h (ERM-SANTO-001).

## ADR-SANTO-002 — Fiesta SIEMPRE del Motor Litúrgico

- **Contexto:** las fechas de fiesta dependen del calendario litúrgico vigente (traslaciones, preeminencias, supresiones) y cambian por año.
- **Decisión:** la fecha de fiesta se resuelve SIEMPRE consultando al Motor Litúrgico; prohibido leer campos de fecha crudos del CMS como fuente de verdad, calcular fechas localmente o hardcodear calendarios.
- **Alternativas consideradas:**
  - _Campo de fecha estático en el CMS:_ descartado: rompe en años con traslaciones y generaría incoherencia con el resto de apps del ecosistema.
  - _Calendario importado a la app:_ descartado por duplicación y deriva de mantenimiento.
- **Consecuencias:** dependencia del Motor (mitigada con cache del cálculo diario y degradación controlada); garantiza coherencia litúrgica transversal.
- **Riesgos y mitigaciones:** Motor caído → último cálculo diario cacheado + banner (ERM-SANTO-002/003); contrato del Motor cambia → lib wrapper `lib/motor.ts` como punto único de acoplamiento.

## ADR-SANTO-003 — SSR cacheado por slug (contenido casi estático)

- **Contexto:** el contenido editorial cambia raramente; las fichas deben cargar < 2.5s LCP y soportar picos de fiestas.
- **Decisión:** Astro 6 SSR con cache por slug con revalidación en background (stale-while-revalidate); el santo del día se pre-calcula por fecha (24h); listados con TTL corto.
- **Alternativas consideradas:**
  - _Estático puro (SSG):_ descartado en MVP porque el inventario de slugs crecerá vía CMS y el santo del día es dinámico por fecha; re-hidratar el sitio en cada alta editorial agrega complejidad de build.
  - _SSR sin cache:_ descartado por TTFB y picos de tráfico (ERM-SANTO-003).
- **Consecuencias:** alta resiliencia ante CMS caído (servible desde cache); riesgo de servir contenido levemente desactualizado, aceptable y señalado con banner en degradación.
- **Riesgos y mitigaciones:** invalidación olvidada tras corrección editorial → paso 4 del runbook RB-SANTO-ER1; cache contaminado por query → claves de cache normalizadas.

## ADR-SANTO-004 — Búsqueda vía CMS (full-text); índice dedicado post-MVP

- **Contexto:** el buscador es el punto de entrada principal (KPI: éxito > 70%) pero el volumen MVP es modesto.
- **Decisión:** usar el full-text del CMS (`q=` sobre nombre y patronazgos) con debounce en cliente; en post-MVP, si el KPI lo justifica, migrar a un índice dedicado con sinónimos y aliases sin cambiar la API de la app (`lib/busqueda.ts` aísla el proveedor).
- **Alternativas consideradas:**
  - _Motor de búsqueda externo (Algolia/Meilisearch) desde el MVP:_ descartado: agrega costo, operativa y un segundo sistema de contenido antes de validar necesidad; se re-evaluará con datos RUM de términos sin resultados.
  - _Búsqueda client-side sobre dump completo:_ descartada por peso del payload y mantenimiento.
- **Consecuencias:** MVP más simple; límites de relevancia del full-text en variantes locales (ERM-SANTO-006).
- **Riesgos y mitigaciones:** sin resultados masivos → sinónimos/aliases post-MVP; latencia del CMS en búsqueda → debounce + cancelación de requests obsoletos.

## ADR-SANTO-005 — Solo esquema `santopedia` para datos de usuario

- **Contexto:** favoritos y reportes son datos exclusivos de esta app; el monorepo ya tiene apps con datos en Supabase.
- **Decisión:** toda tabla de la app vive en el esquema Postgres `santopedia` con RLS; sin tablas en `public`, sin compartir tablas con otras apps, sin service role en cliente.
- **Alternativas consideradas:**
  - _Tabla `favoritos` compartida global para todas las apps:_ descartada: acopla apps y complica RLS y evolución (ver Capacidades Compartidas; una capacidad compartida de favoritos generales sería una decisión transversal futura, no de esta app).
  - _LocalStorage para favoritos anónimos:_ descartado en MVP por falta de continuidad entre dispositivos; re-evaluable como mejora no bloqueante.
- **Consecuencias:** aislamiento claro y auditabilidad por esquema; ver [06-Esquema de Datos](06-Esquema%20de%20Datos.md).
- **Riesgos y mitigaciones:** drift de migraciones → SQL versionado en `db/scripts/` con validación en pipeline.

## ADR-SANTO-006 — RUM desde el día 1 (consentido)

- **Contexto:** el KPI principal (búsqueda exitosa > 70%) y los SLO de performance requieren datos reales de usuarios desde el lanzamiento.
- **Decisión:** instrumentar RUM (SDK de Log) desde el MVP con eventos tipados `santo.viewed` y `santo.searched`, siempre detrás del consentimiento compartido del ecosistema y sin PII.
- **Alternativas consideradas:**
  - _Rerizar RUM a una fase 2:_ descartada: sin datos reales no se puede gobernar el error budget ni iterar el buscador con evidencia.
  - _Analytics server-side por logs:_ descartada como única fuente: no captura UX real (Core Web Vitals, debounces, éxito de búsqueda).
- **Consecuencias:** evidencia desde el día 1; obligación de mantener el allowlist de eventos auditado (ERM-SANTO-005).
- **Riesgos y mitigaciones:** fuga de PII → SDK anónimo + payload tipado + test TC-SANTO-013; consentimiento degradando métricas → medir tasa de aceptación como metadato (sin identificar).

## ADR-SANTO-007 — JSON-LD (`schema.org/Person`) para SEO

- **Contexto:** el tráfico orgánico ("santo patrono de X", "fiesta de Y") es la puerta de entrada natural de una enciclopedia.
- **Decisión:** cada ficha emite JSON-LD `schema.org/Person` (name, alternateName, fechas si hay, patronazgo principal, description, image, sameAs), con meta title/description por santo, canonical por slug y sitemap generado desde el CMS.
- **Alternativas consideradas:**
  - _Solo meta tags sin datos estructurados:_ descartado: pierde rich results y disambiguación de homónimos (santos con nombres iguales).
  - _Markup microdata inline:_ descartado: acopla el markup visual con el SEO y complica el refactor de componentes.
- **Consecuencias:** mejor indexación y presentación en buscadores; obligación de validar el JSON-LD en QA (TC-SANTO-015).
- **Riesgos y mitigaciones:** JSON-LD desalineado del contenido visible (penalización) → se genera desde el mismo objeto del CMS, no a mano.
