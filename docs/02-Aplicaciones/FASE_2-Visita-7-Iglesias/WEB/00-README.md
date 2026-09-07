---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
type: app-readme
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[01-PRD]]"
  - "[[02-SRS]]"
  - "[[03-FRD]]"
  - "[[docs/00-General/06-PRD-Maestro|PRD Maestro]]"
---

# Visita 7 Iglesias - Web

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Metadatos

- Plataforma: WEB (PWA-ready post-MVP)
- Fase: FASE 2
- Estado documental: draft
- Owner: Iván Ezequiel Iencinella
- Fecha última actualización: 2026-09-05

## Descripcion y contexto

**Visita 7 Iglesias** es la aplicación de peregrinación del ecosistema Fósforo: guía a los fieles a realizar la devoción tradicional de las **Siete Iglesias**, en la que el peregrino visita siete templos en un mismo día (clásicamente el Jueves Santo, aunque se practica todo el año y con especial intensidad en Cuaresma), rezando en cada uno una oración y un intención concreta.

La app resuelve tres preguntas que hoy no tienen respuesta digital confiable: **qué iglesias visitar** (itinerario por ciudad), **en qué orden** (secuencia de la peregrinación) y **qué orar en cada una** (oración de la visita).

El contenido —itinerarios por ciudad, iglesias con dirección y mapa, oraciones de cada visita— vive en el **CMS** del ecosistema (fuente única de verdad editorial). El registro personal —peregrinaciones iniciadas, iglesias visitadas, progreso y preferencias— vive en **Supabase** (esquema `visita7`) con políticas RLS por usuario y **autenticación obligatoria** para marcar visitas, porque el progreso es un dato personal que debe sobrevivir entre dispositivos.

## Validación de la idea

La devoción de las siete iglesias se practica hoy **sin guía digital confiable**:

- Los fieles se apoyan en **papelitos caseros**, capturas de pantalla de grupos de WhatsApp o PDFs sueltos con listados desactualizados (iglesias cerradas, horarios incorrectos, direcciones viejas).
- El itinerario por ciudad no está claro: ¿cuáles son las siete iglesias de mi ciudad? ¿en qué orden conviene visitarlas para que el recorrido sea razonable?
- En cada iglesia se reza una oración distinta (según la intención tradicional: Hostia Santa, ánima sola, etc.) y hoy no existe una fuente única que la traiga en orden.
- No hay forma de llevar **registro del progreso** en el día de la peregrinación: se pierde la cuenta de cuáles se visitaron, sobre todo con distancias largas o cuando el recorrido se interrumpe.

La validación cualitativa con miembros de la comunidad confirma la necesidad en dos momentos: **planificación previa** (elegir itinerario de la ciudad) y **ejecución en el día** (recorrer, rezar, marcar).

## Arquitectura (resumen)

- **Frontend:** Astro 6 SSR + React 19 (islands) + Tailwind v4 con `@repo/ui`, siguiendo el design system compartido del ecosistema.
- **Contenido:** CMS vía API de lectura `GET /api/content/{content_type}` (content types `itinerario` e `iglesia`, con la oración de cada visita referenciada al catálogo de Oraciones). Nunca contenido duplicado en la app.
- **Datos personales:** Supabase, esquema `visita7` (tablas `pilgrimages`, `pilgrimage_visits`, `preferences`), RLS por `user_id` y escritura idempotente por `UNIQUE (pilgrimage_id, church_ref)`.
- **Contexto litúrgico:** Motor Litúrgico vía `GET /api/liturgia/{fecha}` (Cuaresma, Jueves Santo), solo informativo y no bloqueante.
- **Telemetría:** RUM vía Sistema de Log (eventos `v7i.visita.marcada`, `v7i.peregrinacion.completada`), anónimo sin PII.

## Estado de implementación

- Código: `src/apps/visita-7-iglesias/` (a crear, aún sin implementación).
- La presente documentación define el alcance MVP y el contrato técnico que guiará esa implementación.

## Ubicación del codigo

- App web: `src/apps/visita-7-iglesias/`
- Documentación: `docs/02-Aplicaciones/FASE_2-Visita-7-Iglesias/WEB/`
- Base de datos: esquema `visita7` en Supabase (ver [06-Esquema de Datos](06-Esquema%20de%20Datos.md))
- Estilos: tokens compartidos de `src/packages/tailwind-config/shared-styles.css` y primitivas de `src/packages/ui`

## Alcance MVP

1. **Listado de itinerarios por ciudad**: navegación por ciudad (MVP: 3 ciudades base); cada itinerario muestra ciudad, cantidad de iglesias (siempre 7), distancia estimada y estado de contenido verificado.
2. **Ficha de itinerario**: página por slug con las **7 iglesias** — nombre, dirección textual (fuente primaria), mapa embebido por iglesia (iframe, sin API keys en cliente) y **oración de la visita** referenciada desde el CMS.
3. **Registro de visita completada** (requiere sesión): marcar cada iglesia como visitada, idempotente (una sola marca por iglesia por peregrinación).
4. **Progreso de la peregrinación (x/7)**: barra de progreso persistente y **celebración** al completar 7/7.
5. **Modo peregrino**: vista de lista con checkboxes pensada para usar caminando; orden configurable por el usuario (por defecto, el orden sugerido del itinerario).
6. **Contexto litúrgico**: mensaje informativo vía Motor Litúrgico (temporada de Cuaresma, Jueves Santo), no bloqueante.
7. **RUM**: eventos `v7i.visita.marcada` y `v7i.peregrinacion.completada` desde el día 1, vía Sistema de Log.
8. **Reporte de datos de iglesia**: canal para señalar dirección u horario incorrecto de una iglesia.

## Fuera de alcance (explícito)

- **Navegación GPS turn-by-turn**: pertenece a apps de mapas; la app da dirección textual + mapa embebido, nunca navegación paso a paso.
- **Modo offline completo**: post-MVP (PWA-ready); MVP requiere conexión.
- **Social / compartir peregrinaciones**: post-MVP; el progreso es estrictamente personal.
- **Multi-ciudad ilimitado**: MVP con **3 ciudades base**; sumar ciudades es contenido editorial del CMS, no código.

## KPIs

- **KPI principal**: peregrinaciones completadas (7/7) por temporada.
- **Rendimiento**: LCP p75 < 2.5 s (crítico el Jueves Santo).
- Secundarios: tasa de inicio de peregrinación por visita a ficha, retención de la marca de visita (marcas repetidas sobre el mismo progreso), reportes de datos resueltos < 48 h.

## Dependencias del ecosistema

| Sistema                   | Uso                                                           | Criticidad |
| ------------------------- | ------------------------------------------------------------- | ---------- |
| CMS                       | Itinerarios, iglesias y oraciones de la visita (fuente única) | Must       |
| Motor Litúrgico           | Contexto de Cuaresma/Jueves Santo (informativo)               | Should     |
| Sistema de Logueo         | Auth obligatoria para registro de visitas y progreso          | Must       |
| Log (RUM + logs)          | Telemetría de uso, embudo de peregrinación y errores          | Must       |
| Sistema de Notificaciones | Futuro (recordatorio de peregrinación en Cuaresma)            | Could      |

## Secuencia documental (estado draft)

1. [00-README.md](00-README.md) — este documento.
2. [01-PRD.md](01-PRD.md) — problema, JTBD, requisitos de producto.
3. [02-SRS.md](02-SRS.md) — requisitos funcionales y no funcionales.
4. [03-FRD.md](03-FRD.md) — casos de uso, reglas de negocio, validaciones.
5. [04-Flujos y Secuencias.md](04-Flujos%20y%20Secuencias.md) — flujos y diagramas de secuencia.
6. [05-Tests Unitarios.md](05-Tests%20Unitarios.md) — plan de pruebas con Vitest.
7. [06-Esquema de Datos.md](06-Esquema%20de%20Datos.md) — esquema `visita7` en Supabase.
8. [07-ERM.md](07-ERM.md) — gestión de riesgos operativos.
9. [08-Decisiones de Arquitectura.md](08-Decisiones%20de%20Arquitectura.md) — ADRs.
10. [09-Especificacion Tecnica.md](09-Especificacion%20Tecnica.md) — stack, módulos, endpoints.
11. [10-OWASP.md](10-OWASP.md) — controles de seguridad.
12. [11-SLA y SLO.md](11-SLA%20y%20SLO.md) — objetivos de servicio y error budget.
