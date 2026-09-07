---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
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

# Oraciones - Web

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Metadatos

- Plataforma: WEB
- Fase: FASE 2
- Estado documental: draft
- Owner: Iván Ezequiel Iencinella
- Fecha última actualización: 2026-09-05

## Descripcion y contexto

**Oraciones** es la aplicación del ecosistema Fósforo que brinda una colección de oraciones católicas fiable, organizada y accesible desde cualquier dispositivo. Su propósito es que cualquier usuario encuentre la oración correcta en el momento oportuno: la oración de la mañana, la oración por un enfermo, el Rosario completo o una devoción concreta.

El contenido oracional vive en el **CMS** del ecosistema (fuente única de verdad editorial), mientras que la capa personal del usuario —favoritos, colecciones personales y preferencias de lectura— se persiste en **Supabase** con políticas RLS por usuario.

## Validación de la idea

Las oraciones católicas hoy están dispersas en papelitos, PDFs sueltos, capturas de pantalla, sitios web antiguos con links rotos y recortes en cuadernos. El católico que quiere rezar no tiene una colección confiable: encuentra oraciones con versiones dudosas, sin contexto de uso, o directamente no las encuentra. La validación cualitativa con miembros de la comunidad indica una necesidad clara de una colección única, ordenada, revisada y accesible en el momento de la necesidad (antes de dormir, en el hospital, en/temp/oración familiar).

## Estado de implementación

- Código: `src/apps/oraciones/` (a crear, aún sin implementación).
- La presente documentación define el alcance MVP y el contrato técnico que guiará esa implementación.

## Ubicación del codigo

- App web: `src/apps/oraciones/`
- Documentación: `docs/02-Aplicaciones/FASE_2-Oraciones/WEB/`
- Base de datos: esquema `oraciones` en Supabase (ver [06-Esquema de Datos](06-Esquema%20de%20Datos.md))

## Alcance MVP

1. **Listado por categorías**: navegación por taxonomías del CMS — Oraciones comunes, Por intención, Devociones, Rosario.
2. **Ficha de oración**: página por slug con texto completo, intención de uso, autor/fuente cuando aplique y acciones (favorito, reporte).
3. **Buscador**: búsqueda full-text sobre el contenido del catálogo.
4. **Modo lectura**: tema claro/oscuro y tamaño de fuente, persistido en localStorage.
5. **Favoritos**: marcar/desmarcar oraciones (requiere sesión).
6. **Colecciones personales**: agrupar oraciones en colecciones propias con nombre y orden (requiere sesión).
7. **RUM (Real User Monitoring)**: eventos `oracion.viewed` y `oracion.searched` desde el día 1, vía Sistema de Log.
8. **Recordatorio de devoción** (Could): notificación programada vía Sistema de Notificaciones.

## Fuera de alcance (explícito)

- Editor de contenido: pertenece al CMS, nunca a esta app. Oraciones no duplica ni almacena contenido editorial.
- Audio de oraciones grabadas.
- Multi-idioma: MVP solo español.

## KPIs

- **KPI principal**: DAU (usuarios diarios activos que abren al menos una oración).
- **Rendimiento**: LCP p75 < 2.5 s.
- Secundarios: tasa de búsqueda exitosa > 70 %, favoritos creados por sesión iniciada.

## Dependencias del ecosistema

| Sistema                   | Uso                                 | Criticidad |
| ------------------------- | ----------------------------------- | ---------- |
| CMS                       | Contenido oracional y taxonomías    | Must       |
| Sistema de Logueo         | Sesión para favoritos y colecciones | Must       |
| Sistema de Notificaciones | Recordatorios de devoción (Could)   | Could      |
| Log (RUM + logs)          | Telemetría de uso y errores         | Must       |

## Secuencia documental (estado draft)

1. [00-README.md](00-README.md) — este documento.
2. [01-PRD.md](01-PRD.md) — problema, JTBD, requisitos de producto.
3. [02-SRS.md](02-SRS.md) — requisitos funcionales y no funcionales.
4. [03-FRD.md](03-FRD.md) — casos de uso, reglas de negocio, validaciones.
5. [04-Flujos y Secuencias.md](04-Flujos%20y%20Secuencias.md) — flujos y diagramas de secuencia.
6. [05-Tests Unitarios.md](05-Tests%20Unitarios.md) — plan de pruebas con Vitest.
7. [06-Esquema de Datos.md](06-Esquema%20de%20Datos.md) — esquema `oraciones` en Supabase.
8. [07-ERM.md](07-ERM.md) — gestión de riesgos operativos.
9. [08-Decisiones de Arquitectura.md](08-Decisiones%20de%20Arquitectura.md) — ADRs.
10. [09-Especificacion Tecnica.md](09-Especificacion%20Tecnica.md) — stack, módulos, endpoints.
11. [10-OWASP.md](10-OWASP.md) — controles de seguridad.
12. [11-SLA y SLO.md](11-SLA%20y%20SLO.md) — objetivos de servicio y error budget.
