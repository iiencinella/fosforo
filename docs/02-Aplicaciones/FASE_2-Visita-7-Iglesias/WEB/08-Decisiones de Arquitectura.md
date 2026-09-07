---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
  - decisiones
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS]]"
  - "[[06-Esquema de Datos]]"
  - "[[09-Especificacion Tecnica]]"
---

# Decisiones de Arquitectura - Visita 7 Iglesias

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto

- Plataforma objetivo: WEB (PWA-ready post-MVP).
- Alcance de estas decisiones: el MVP de la app — contenido devocional, registro de peregrinación, progreso, modo peregrino, contexto litúrgico y telemetría.
- Restricciones del ecosistema: Astro 6 SSR + React 19 + Tailwind v4 + `@repo/ui`; Supabase para datos personales; CMS como fuente única de contenido; Motor Litúrgico para calendario; Log para RUM.

## Decisiones clave

| ID          | Decisión                                                                       | Motivo                                                                                                                                                     | Impacto                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| ADR-V7I-001 | El contenido (itinerarios, iglesias, oraciones de la visita) vive en el CMS    | Fuente única de verdad editorial: la corrección de un dato se hace una sola vez y se propaga a todas las apps; la app nunca duplica contenido (RB-V7I-001) | La app referencia por `itinerary_ref`/`church_ref`; si el CMS cae, cache SSR + banner; requires content types `itinerario` e `iglesia` en el CMS |
| ADR-V7I-002 | Registro de visitas con idempotencia por `UNIQUE (pilgrimage_id, church_ref)`  | La marca es el gesto central y se repite (doble tap, reconexión): la integridad del progreso no puede depender del cliente                                 | Enforced en BD (server-side); conflicto tratado como éxito idempotente (200 con estado actual); testeado en TC-V7I-006                           |
| ADR-V7I-003 | Autenticación obligatoria para marcar visitas                                  | El progreso es un dato personal que debe sobrevivir entre dispositivos; sin identidad no hay progreso fiable ni RLS posible (RB-V7I-003)                   | Sin sesión: lectura 100 % funcional, marca con CTA de inicio de sesión; ninguna escritura anónima en `visita7`                                   |
| ADR-V7I-004 | Orden de visitas configurable por el usuario (default: orden sugerido del CMS) | El recorrido real depende del punto de partida de cada peregrino; el CMS sugiere, no impone (RB-V7I-005)                                                   | Orden propio persistido en `visita7.preferences` (jsonb); el contenido editorial nunca se altera por el orden del usuario                        |
| ADR-V7I-005 | Mapa embebido vía iframe (sin API keys en cliente)                             | El mapa es apoyo visual de la dirección textual; exponer una API key de mapas en el cliente sería un vector de abuso y costo                               | Sin dependencia de SDK de mapas en cliente; iframe restringido por origen en CSP (SEC-V7I-010); sin facturación por uso expuesta                 |
| ADR-V7I-006 | Contexto litúrgico del Motor: solo informativo y no bloqueante                 | El valor devocional principal es el itinerario + oraciones; el contexto de Cuaresma/Jueves Santo acompaña pero no puede frenar la peregrinación            | Consumo no bloqueante con timeout corto; Motor caído → mensaje omitido silenciosamente (FR-V7I-006)                                              |
| ADR-V7I-007 | Cache SSR agresivo en contenido (casi estático)                                | El pico de tráfico del Jueves Santo debe servirse mayoritariamente desde CDN; el contenido cambia con baja frecuencia y con invalidación por tag           | Fichas y listados cacheados con tags (`itinerario={slug}`, `ciudad={term}`); TTFB p95 < 800 ms; soporta el SLO de 99.9 % en la semana pico       |
| ADR-V7I-008 | RUM de eventos de producto (embudo de peregrinación)                           | El KPI principal (peregrinaciones completadas 7/7) solo es medible con eventos de producto desde el día 1 (PRD-V7I-008)                                    | `v7i.itinerario.visto` → `v7i.visita.marcada` → `v7i.peregrinacion.completada`; sin PII; alimenta el embudo y priorización post-MVP              |

## Alternativas consideradas

- **ADR-V7I-001 — Alternativa A (contenido en la BD de la app):** descartada: duplicaría contenido devocional, rompería la fuente única del ecosistema y haría las correcciones editoriales imposibles de propagar.
- **ADR-V7I-002 — Alternativa B (idempotencia solo en cliente):** descartada: el cliente puede fallar, duplicar requests o ser manipulado; la garantía vive en la BD.
- **ADR-V7I-003 — Alternativa B (marcas anónimas con identificador de dispositivo):** descartada: el progreso se perdería al cambiar de dispositivo y complicaría RLS y privacidad sin beneficio real.
- **ADR-V7I-005 — Alternativa B (SDK de mapas en cliente con API key):** descartada por exposición de credenciales, costo variable por uso y peso extra en el bundle; el iframe cubre el caso de uso (ver dónde queda la iglesia).
- **ADR-V7I-006 — Alternativa B (exigir el Motor para renderizar):** descartada: convertiría un acompañamiento espiritual en un punto único de falla.
- **ADR-V7I-007 — Alternativa B (SSR sin cache / client-side rendering):** descartada: pondría el pico del Jueves Santo sobre el origen y degradaría LCP/TTFB justo cuando importa.

## Riesgos y mitigaciónes

- Riesgo 1: datos de iglesias desactualizados en el CMS → mitigado por reporte de usuario (FR-V7I-008), revisión trimestral y verificación pre-Jueves Santo (ERM-V7I-001).
- Riesgo 2: pico de tráfico supera capacidad del origen → mitigado por cache SSR + CDN y load test pre-temporada (ERM-V7I-002, ADR-V7I-007).
- Riesgo 3: usuarios anónimos frustrados por el CTA de inicio de sesión al marcar → mitigado por CTA claro y no bloqueante (la lectura nunca exige sesión); se medirá conversión con RUM (ADR-V7I-008).
- Riesgo 4: dependencia del CMS como único origen de contenido → aceptada y mitigada con cache como respaldo y escritura de marcas independiente del CMS (ERM-V7I-004).
