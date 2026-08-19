---
tags:
  - proyecto/fosforo
  - portal
  - arquitectura
  - decisiones
  - aplicación
type: app-adr
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
---

# Decisiones de Arquitectura - 0101 Portal

## Contexto

- Plataforma objetivo: WEB
- Alcance de esta decision: definir la arquitectura base del portal web para Fase 1, incluyendo render público, catálogo y novedades manuales en archivos versionados, persistencia de formularios, observabilidad y despliegue.

## Funcionalidades generales obligatorias

- Catálogo centralizado de aplicaciónes con estado y navegación.
- Novedades editoriales del ecosistema.
- Formularios públicos de contacto y feedback, con derivación de colaboración técnica hacia pull requests.

## Decisiones clave

| ID                  | Decision                                                                                                          | Motivo                                                                                                                 | Impacto                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ADR-0101-PORTAL-001 | Implementar el portal como app web Astro dentro de `src/apps/portal/`.                                            | Alinea el portal con la arquitectura web oficial del monorepo y facilita SSR/SSG híbrido.                              | Se reutilizan convenciones de rutas, endpoints y despliegue del ecosistema.                                             |
| ADR-0101-PORTAL-002 | Reutilizar `src/packages/ui` y `src/packages/tailwind-config` como base visual obligatoria.                       | El portal es la cara pública del ecosistema y debe expresar consistencia visual desde Fase 1.                          | Reduce duplicación y deja al portal como referencia de shell visual compartido.                                         |
| ADR-0101-PORTAL-003 | Mantener catálogo y novedades del MVP en archivos versionados del portal, y usar Supabase PostgreSQL para envíos. | Reduce complejidad inicial, mantiene trazabilidad editorial en git y desacopla el portal del CMS compartido en Fase 1. | El contenido editorial y del catálogo se administra manualmente y puede migrarse más adelante a CMS o tablas dedicadas. |
| ADR-0101-PORTAL-004 | Resolver formularios mediante endpoints de Astro y no desde acceso directo del cliente a la base.                 | Respeta la capa de servicios y mejora validación, rate limiting y observabilidad.                                      | Centraliza reglas de negocio y endurece seguridad de escritura.                                                         |
| ADR-0101-PORTAL-005 | Desplegar el portal en Vercel durante MVP.                                                                        | Está alineado con la arquitectura declarada y simplifica previews y releases rápidos.                                  | El runtime debe ser compatible con endpoints Astro y variables seguras.                                                 |
| ADR-0101-PORTAL-006 | Canalizar sugerencias técnicas mediante pull requests al repositorio y no con un formulario propio del portal.    | Evita duplicar flujos de contribución técnica y aprovecha el proceso natural de revisión de código y documentación.    | El portal debe ofrecer guía clara y CTA al repositorio, pero no persistir aportes técnicos como entidad propia en MVP.  |

## Alternativas consideradas

- Alternativa A: construir el portal como sitio totalmente estático sin endpoints propios. Se descartó porque limita formularios, telemetría y actualización dinámica de estados del catálogo.
- Alternativa B: implementar el portal como frontend React aislado con backend separado. Se descartó por aumentar complejidad y romper consistencia con la arquitectura web oficial.
- Alternativa C: permitir escritura directa desde cliente a Supabase. Se descartó por seguridad, control de abuso y falta de validación centralizada.
- Alternativa D: guardar catálogo y novedades en Supabase desde el inicio. Se descartó en MVP porque introduce operación editorial extra donde todavía alcanza con archivos manuales versionados.

## Riesgos y mitigaciónes

- Riesgo 1: sobrecargar el portal con capacidades editoriales o comúnitarias no esenciales para MVP.
- Mitigación 1: mantener alcance acotado a descubrimiento, novedades y formularios básicos con triage manual.
- Riesgo 2: abuso de formularios públicos al no requerir autenticación en MVP.
- Mitigación 2: combinar rate limiting, validación server-side, honeypots/captcha si hiciera falta y clasificación operativa de envíos.
