---
tags:
  - proyecto/fosforo
  - calendario
  - aplicación
type: app-readme
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-08-14
related:
  - "[[../00-README|Indice de aplicaciónes]]"
---

# 0103 Calendario

## Metadatos

- Plataforma: WEB
- Estado: vigente
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-08-14

## Descripcion

0103 Calendario es la base litúrgica de Fósforo para el MVP web. Combina dos responsabilidades en un mismo producto: por un lado actúa como superficie pública de consulta diaria para personas que quieren saber que celebra la Iglesia hoy; por otro lado funciona como la primera implementación operativa del núcleo litúrgico que otras apps del ecosistema podrán consumir.

Durante el MVP, la app resuelve el calendario litúrgico del rito romano para la región AR, reutiliza persistencia real en Supabase y publica datos normalizados a través de endpoints Astro. La experiencia inicial prioriza ver la jornada actual, navegar por mes y abrir el detalle de una fecha con celebración principal, referencias de lecturas, contexto litúrgico y enlaces hacia experiencias relaciónadas del ecosistema.

## Validación de la idea

- El ecosistema necesita una referencia común del día litúrgico para que Biblia, Misal, Oraciones, Santopedia y futuras apps conserven coherencia funcional.
- El post de catálogo del portal ya valida el interés y el valor percibido de una experiencia diaria simple, clara y serena para consulta litúrgica.
- La existencia de `public.liturgy_daily_readings` en Supabase permite arrancar con persistencia real en vez de maqueta local y acelera el camino hacia contratos reutilizables.

## Arquitectura

- **Frontend:** Astro + Tailwind CSS + componentes y estilos compartidos de `@repo/ui`
- **Backend:** Endpoints Astro con acceso server-side a Supabase
- **Datos:** Supabase PostgreSQL, reutilizando `public.liturgy_daily_readings` como tabla base del MVP y `public.liturgy_day_profiles` como proyección mensual enriquecida para 2026 y futuras extensiones
- **Integración:** consumo por otras apps del ecosistema a través de contratos HTTP internos y despliegue web compatible con Vercel

## Estado de implementación

- **Completado:** documentación spec-driven, implementación Astro del MVP, endpoints `day`/`month`/`health`, pruebas unitarias base, enriquecimiento GCatholic 2026 en `public.liturgy_day_profiles`, reestructuración de layout con calendario al inicio, aside sticky para detalle del día, sección de info secundaria, ocultado de botones de auth en el header y widget embebible de jornada del día vía iframe (`/widget/day`).
- **En curso:** exposición progresiva de metadata litúrgica enriquecida en DTOs, UI y contratos reutilizables del ecosistema.
- **Completado en esta iteración:** tests de integración Supabase opt-in, E2E HTTP, estados de error, validación de RLS, headers de cache, health degradado y sanitización de errores técnicos.
- **Pendiente:** ejecutar los gates contra el proyecto Supabase y CI Linux, y cerrar runbooks/alertas de operación para próximos ciclos litúrgicos.

## Ubicación del codigo

- App: `src/apps/calendario/`
- Componentes: `src/apps/calendario/src/components/`
- Estilos: `src/packages/ui/`, `src/packages/tailwind-config/shared-styles.css` y `src/apps/calendario/src/styles/`
- Contenido y servicios: `src/apps/calendario/src/lib/` y `src/apps/calendario/src/types/`
- API: `src/apps/calendario/src/pages/api/`

## Alcance MVP

- Mostrar la jornada actual con celebración principal, referencias de lecturas, tiempo litúrgico, color y resumen breve.
- Permitir navegación mensual y selección de una fecha para consultar su detalle litúrgico.
- Exponer endpoints de lectura para jornada diaria y vista mensual, desacoplando UI y base de datos.
- Publicar enlaces contextuales hacia apps relaciónadas como Biblia, Misal, Oraciones y Santopedia cuando corresponda.
- Persistir el núcleo de datos litúrgicos en Supabase reutilizando `public.liturgy_daily_readings` como columna vertebral del MVP.

## No alcance MVP

- Backoffice editorial completo, workflow de aprobación de cambios y administración multiusuario.
- Soporte multi-rito, multi-región o multi-país más allá de rito romano y región AR.
- Texto bíblico completo embebido en la app; en MVP se priorizan referencias y deep links a la experiencia adecuada.
- Personalización por usuario, favoritos, recordatorios, notificaciónes y sincronización offline.

## KPI principal

- KPI principal: porcentaje de sesiones que consultan correctamente la jornada actual o una fecha del mes sin abandonar por error.
- KPI secundario 1: latencia p95 de lectura diaria y mensual dentro de objetivo técnico del MVP.
- KPI secundario 2: cantidad de apps del ecosistema que reutilizan el contrato del calendario sin duplicar lógica litúrgica crítica.

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------- |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | vigente |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | vigente |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | vigente |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | vigente |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | vigente |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificacion Tecnica](09-Especificacion%20Tecnica.md)           | vigente |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | vigente |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | vigente |

## Documentos complementarios

| Documento                                                   | Descripcion                                                                                    | Estado  |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------- |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)               | Estrategia de validación para servicios, endpoints, mapeos y reglas de negocio del calendario. | vigente |
| [09-Especificacion Tecnica](09-Especificacion%20Tecnica.md) | Definicion del stack, modulos, endpoints, DTOs y estructura esperada del workspace web.        | vigente |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- La implementación del workspace está activa con layout reestructurado, endpoints operativos y estilos del ecosistema; esta documentación mantiene el contrato funcional y técnico alineado con el codigo.
