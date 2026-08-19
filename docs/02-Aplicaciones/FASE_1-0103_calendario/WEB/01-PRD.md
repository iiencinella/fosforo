---
tags:
  - proyecto/fosforo
  - calendario
  - prd
  - aplicación
type: app-prd
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - 0103 Calendario

## 1. Ficha

- ID base: `PRD-0103-CALENDARIO-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-05-20
- Estado: vigente

## 2. Problema y oportunidad

- Problema: el ecosistema necesita una fuente litúrgica confiable y reutilizable para resolver que se celebra cada día, pero hoy la app `calendario` no tiene implementación funcional y la lógica no está formalizada como producto ni como contrato técnico.
- Oportunidad: construir un calendario litúrgico con persistencia real en Supabase permite ofrecer valor inmediato al usuario final y, al mismo tiempo, habilitar una capacidad transversal que evite duplicación de reglas en Biblia, Misal, Oraciones, Santopedia y futuras apps del ecosistema.

## 3. Objetivo de negocio

Construir durante la Fase 1 una app web que resuelva la jornada litúrgica diaria con experiencia simple y confiable para el usuario final, y que además publique contratos reutilizables para otras apps de Fósforo, usando Supabase como persistencia real desde el MVP.

## 4. Segmentos y JTBD

- Segmento principal: personas que quieren saber rapidamente que celebra la Iglesia hoy y encontrar el contexto litúrgico básico de la jornada.
- Segmento secundario: apps y equipos del ecosistema que necesitan consumir una referencia diaria consistente para no duplicar lógica de calendario.
- JTBD principal: "Cuando entro a Fósforo o a una app relaciónada, quiero saber que se celebra hoy y acceder a las lecturas y recursos asociados sin tener que interpretar reglas litúrgicas complejas por mi cuenta".

## 5. Alcance MVP

| ID                      | Requisito de producto                                                                                                       | Prioridad | Justificación                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| PRD-0103-CALENDARIO-001 | Mostrar la jornada actual con celebración principal, tiempo litúrgico, color y referencias de lecturas.                     | Must      | Es la razón principal de uso para el usuario final y el punto de entrada del producto.                     |
| PRD-0103-CALENDARIO-002 | Permitir navegación mensual y apertura del detalle de una fecha.                                                            | Must      | La app debe ser útil más allá del día actual y facilitar exploración de temporadas y fechas cercanas.      |
| PRD-0103-CALENDARIO-003 | Persistir el calendario litúrgico del MVP en Supabase reutilizando `public.liturgy_daily_readings` como base.               | Must      | El usuario eligió persistencia real desde el MVP y la tabla existente reduce duplicación y riesgo inicial. |
| PRD-0103-CALENDARIO-004 | Exponer contratos de lectura para jornada diaria y calendario mensual desde endpoints Astro.                                | Must      | Otras apps del ecosistema deben poder consumir la capacidad sin acoplarse a la base.                       |
| PRD-0103-CALENDARIO-005 | Publicar enlaces contextuales hacia apps del ecosistema relacionadas con la jornada.                                        | Should    | Refuerza el rol del calendario como núcleo de experiencia y de derivación funcional.                       |
| PRD-0103-CALENDARIO-006 | Resolver el MVP para rito romano y región AR con reglas y datos explícitamente acotados.                                    | Must      | Limita complejidad, mantiene foco y aprovecha el shape actual de la tabla base.                            |
| PRD-0103-CALENDARIO-007 | Mantener la experiencia visual coherente con el design system compartido del ecosistema y la estética ya visible en portal. | Must      | La app debe sentirse parte del mismo producto y no una superficie aislada.                                 |

## 6. No alcance MVP

- Panel editorial con autenticación, roles finos y flujos de aprobación de contenido litúrgico.
- Multi-rito, multi-región o soporte completo para calendarios particulares fuera de rito romano y región AR.
- Texto bíblico completo incrustado en la UI; en MVP se muestran referencias y enlaces a la superficie adecuada.
- Experiencias avanzadas como favoritos, notificaciónes, recordatorios, historial personal o sincronización con calendarios externos.

## 7. KPI y criterios de exito

- KPI principal: porcentaje de consultas diarias resueltas correctamente sin error técnico visible para el usuario.
- KPI secundario 1: latencia p95 de `day` y `month` dentro del objetivo técnico del MVP.
- KPI secundario 2: cantidad de consumidores internos del ecosistema que reutilizan el contrato del calendario durante Fase 1.

## 8. Riesgos de negocio

| Riesgo                                                                                | Impacto | Mitigación                                                                                        | Owner                    |
| ------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- | ------------------------ |
| Cobertura incompleta o inconsistente de la tabla `liturgy_daily_readings`.            | Alto    | Auditar la tabla, documentar huecos y ampliar el modelo solo donde sea necesario.                 | Iván Ezequiel Iencinella |
| Sobreprometer una experiencia litúrgica más rica de lo que el MVP puede sostener.     | Alto    | Acotar el alcance a consulta diaria y mensual con referencias, sin backoffice ni multi-región.    | Iván Ezequiel Iencinella |
| Duplicación de lógica entre calendario y otras apps consumidoras.                     | Alto    | Exponer contratos HTTP estables y documentar el calendario como capacidad fundacional.            | Iván Ezequiel Iencinella |
| Baja comprensión del usuario si el lenguaje litúrgico se muestra sin contexto mínimo. | Medio   | Priorizar resumen claro, color, tiempo litúrgico y enlaces útiles en la interfaz.                 | Iván Ezequiel Iencinella |
| Desalineación entre documentación, esquema real y futura implementación.              | Medio   | Mantener trazabilidad PRD -> SRS -> FRD -> técnica y ajustar docs transversales junto con la app. | Iván Ezequiel Iencinella |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
- Flujos derivados: [04-Flujos y Secuencias.md](04-Flujos%20y%20Secuencias.md)
