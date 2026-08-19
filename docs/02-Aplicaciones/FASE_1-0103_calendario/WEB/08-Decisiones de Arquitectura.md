---
tags:
  - proyecto/fosforo
  - calendario
  - arquitectura
  - decisiones
  - aplicación
type: app-adr
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
---

# Decisiones de Arquitectura - 0103 Calendario

## Contexto

- Plataforma objetivo: WEB
- Alcance de esta decision: definir la arquitectura base del calendario litúrgico durante el MVP, incluyendo persistencia real en Supabase, contratos HTTP de lectura, estructura del workspace y reglas de reutilización visual del ecosistema.

## Funcionalidades generales obligatorias

- Consulta de la jornada actual con contexto litúrgico y referencias de lecturas.
- Navegación mensual y detalle por fecha.
- Publicación de contratos de lectura reutilizables para otras apps del ecosistema.

## Decisiones clave

| ID                      | Decision                                                                                                                     | Motivo                                                                                                         | Impacto                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| ADR-0103-CALENDARIO-001 | Implementar `calendario` como app web Astro dentro de `src/apps/calendario/`.                                                | Mantiene coherencia con la arquitectura web del monorepo y permite combinar páginas, SSR y endpoints propios.  | La app reutiliza convenciones estándar de `src/apps/*` y despliegue compatible con el resto del ecosistema.                   |
| ADR-0103-CALENDARIO-002 | Usar Supabase desde el MVP como persistencia real del calendario.                                                            | El producto necesita una base litúrgica fundacional y el usuario confirmó persistencia real desde el inicio.   | El modelo de datos, seguridad y contratos deben cerrarse antes de la UI final.                                                |
| ADR-0103-CALENDARIO-003 | Reutilizar `public.liturgy_daily_readings` como tabla base del MVP y expandir con tablas satélite si hace falta.             | Ya existe una base diaria cargada y evitar duplicación reduce riesgo y tiempo de implementación.               | El diseño de servicios debe adaptarse al esquema existente sin acoplar la UI al shape SQL.                                    |
| ADR-0103-CALENDARIO-004 | Resolver consultas del calendario mediante Astro API y servicios server-side, no desde acceso directo del cliente a la base. | Respeta la capa de servicios del ecosistema y simplifica seguridad, validación y evolución del contrato.       | El frontend depende de DTOs estables y no de tablas expuestas.                                                                |
| ADR-0103-CALENDARIO-005 | Limitar el MVP a rito romano y región AR.                                                                                    | Reduce complejidad y coincide con el scope actual observable de la tabla base.                                 | La expansión a otros ritos o regiones requerirá nueva iteración documental y de datos.                                        |
| ADR-0103-CALENDARIO-006 | Mantener la estética del ecosistema reutilizando `@repo/ui`, `@repo/tailwind-config` y `calendar.css`.                       | La app debe sentirse parte de Fósforo y aprovechar primitives y tokens ya disponibles.                         | La UI local solo debe agregar reglas estrictamente de dominio, no reinventar shell ni base visual.                            |
| ADR-0103-CALENDARIO-007 | Incorporar `liturgy_day_profiles` como proyección mensual por `MM-DD` para enriquecer fechas futuras.                        | El dataset exacto hoy cubre 2025; la proyección evita depender solo del fallback heurístico en UI y servicios. | La app mejora consistencia de temporada, color y lecturas para fechas sin match exacto sin duplicar una tabla anual completa. |

## Alternativas consideradas

- Alternativa A: construir el MVP con datos versionados en repo. Se descartó porque el usuario definió Supabase como persistencia real desde el comienzo.
- Alternativa B: crear una tabla completamente nueva para la jornada diaria. Se descartó porque `public.liturgy_daily_readings` ya cubre el núcleo del caso de uso y duplicar datos agregaría deuda.
- Alternativa C: consultar Supabase directamente desde el frontend. Se descartó por acoplamiento, seguridad y contradicción con los requisitos transversales del ecosistema.
- Alternativa D: separar desde el día uno el motor litúrgico como servicio independiente. Se descartó en MVP para reducir complejidad operativa inicial, aunque la documentación preserva esa dirección futura.

## Riesgos y mitigaciónes

- Riesgo 1: que la tabla base no cubra toda la experiencia mensual esperada.
- Mitigación 1: auditar huecos, documentar límites del rango cargado y ampliar el modelo solo donde sea imprescindible.
- Riesgo 2: acoplar el calendario a una estructura de datos interna difícil de reutilizar por otras apps.
- Mitigación 2: fijar DTOs públicos, validación centralizada y endpoints estables antes de cerrar la UI.
