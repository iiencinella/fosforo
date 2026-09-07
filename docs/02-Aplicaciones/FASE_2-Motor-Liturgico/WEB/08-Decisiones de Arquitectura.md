---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - arquitectura
  - decisiones
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
---

# Decisiones de Arquitectura - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto

- Plataforma objetivo: WEB
- Alcance de esta decision: Motor Liturgico MVP (calculo calendario, API REST, cache precalculado, integracion CMS por referencia)

## Funcionalidades generales obligatorias

- Calculo determinista de fecha a celebracion liturgica (ciclo, nombre, tipo, color).
- Calculo de Pascua y fiestas moviles (algoritmo de Gauss).
- API REST consumible por apps del ecosistema (Misal, Visita 7 Iglesias, Lectio Divina).
- Integracion con CMS por referencia (`cms_entry_id`), sin duplicar contenido textual.
- Telemetria RUM via app Log (pageviews, latencia, sin PII).
- Panel admin para gestion de celebraciones excepcionales (autenticado con Supabase Auth).

## Decisiones clave

| ID                | Decision                                                          | Motivo                                                                                    | Impacto                                                         |
| ----------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| ADR-MOTOR-LIT-001 | Astro 6 SSR para el Motor                                         | Consistencia con el stack del ecosistema Fosforo; SSR para API routes y panel admin       | Mediano: requiere Astro 6 en `src/apps/motor-liturgico/`        |
| ADR-MOTOR-LIT-002 | Supabase PostgreSQL para persistencia                             | Tablas precalculadas por ano; RLS; consistencia con el ecosistema                         | Mediano: schema de 4 tablas, indices y RLS policies             |
| ADR-MOTOR-LIT-003 | Calculo precalculado por ano en tabla `liturgical_celebrations`   | Evita recalcular en cada request; latencia p95 < 100 ms; determinismo garantizado         | Alto: job de precalculacion por ano; invalidacion de cache      |
| ADR-MOTOR-LIT-004 | Cache en memoria (LRU) ademas de PostgreSQL                       | Reduce latencia para fechas consultadas frecuentemente; PostgreSQL es la fuente de verdad | Bajo: TTL configurable; invalidacion tras escritura admin       |
| ADR-MOTOR-LIT-005 | API REST (GET) para consultas                                     | Contrato simple, cacheable, consumible por cualquier app del ecosistema                   | Bajo: endpoints REST documentados en 09-Especificacion Tecnica  |
| ADR-MOTOR-LIT-006 | Integracion CMS por referencia (`cms_entry_id`), no por contenido | Evita duplicar contenido; el CMS es la fuente de verdad editorial; Motor solo calcula     | Mediano: requiere job de verificacion de integridad referencial |
| ADR-MOTOR-LIT-007 | Algoritmo de Gauss para calculo de Pascua                         | Estandar ampliamente validado; determinista; cubre el rango 2000-2100                     | Bajo: tests de regresion contra fechas conocidas                |

## Alternativas consideradas

- **Alternativa A (calculo en runtime sin precalculacion):** Calcular Pascua y todas las fiestas moviles en cada request. Descartado por latencia impredecible y dificultad de garantizar determinismo ante cambios de algoritmo. La precalculacion por ano en PostgreSQL permite respuestas O(1) por fecha.
- **Alternativa B (calculo en el cliente/browser):** Enviar la logica de calculo al navegador. Descartado por mantenibilidad (actualizar el calendario requeriria redistribuir el bundle a todas las apps), inconsistencia potencial entre versiones de cliente y exposicion de logica de negocio.
- **Alternativa C (GraphQL en lugar de REST):** Sobrecarga innecesaria para un servicio de lectura con endpoints simples y predecibles. REST es suficiente para el MVP y mas facil de cachear.
- **Alternativa D (duplicar contenido del CMS en el Motor):** Descartado por riesgo de desincronizacion y mantenimiento doble. El Motor mantiene referencias, el CMS mantiene el contenido.

## Riesgos y mitigaciones

- **Riesgo 1 (cache stale):** Tras una actualizacion admin, el cache del ano afectado puede contener datos obsoletos. Mitigacion: invalidacion de cache tras escritura admin y TTL configurable.
- **Riesgo 2 (desincronizacion con CMS):** Una referencia `cms_entry_id` puede romperse si el CMS elimina una entrada. Mitigacion: job de verificacion periodica y manejo graceful en las apps consumidoras.
- **Riesgo 3 (rango de fechas limitado):** El MVP soporta 2000-2100. Mitigacion: validacion explicita y mensaje claro; extender el rango es trivial (recalcular mas anos).
