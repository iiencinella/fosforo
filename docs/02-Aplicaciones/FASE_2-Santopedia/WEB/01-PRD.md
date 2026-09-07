---
tags:
  - proyecto/fosforo
  - santopedia
  - prd
  - web
type: app-prd
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|00-README]]"
  - "[[02-SRS|02-SRS]]"
---

# Santopedia — PRD

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Resumen ejecutivo

Santopedia es la enciclopedia de santos de Fósforo: una app web de consulta y búsqueda sobre la vida, patronazgos, fiesta litúrgica, iconografía y atributos de los santos. El contenido vive en el CMS (content type `santo`); Santopedia es el frontend de consulta. La fecha de fiesta se resuelve siempre contra el Motor Litúrgico, garantizando coherencia litúrgica con el resto del ecosistema.

## 2. Problema

La información sobre santos esta hoy dispersa y es poco confiable:

- **Dispersión:** decenas de sitios hagiográficos con criterios editoriales distintos, sin una fuente única dentro del ecosistema Fósforo.
- **Errores de contenido:** biografías confundidas, patronazgos atribuidos sin fuente, iconografía mal descripta.
- **Fechas de fiesta desalineadas:** sitios estáticos que ignoran traslaciones del calendario litúrgico (ej. fiesta cae en Domingo de Ramos y se traslada), mostrando fechas que ya no se celebran.
- **Experiencia fragmentada:** el usuario debe recorrer varios sitios para armar una respuesta completa; ninguna solución existe dentro del ecosistema para alimentar Biblia, Misal u otras apps con datos de santos.

## 3. Jobs To Be Done

**JTBD del fiel:**

> "Cuando escucho el nombre de un santo nuevo (en misa, en una imagen, en una conversación), quiero saber rápidamente quién fue, de qué es patrono y cuándo se celebra su fiesta, para rezarle con confianza y contar su historia sin equivocarme."

**JTBD del catequista / predicador:**

> "Cuando preparo una clase, catequesis u homilía, quiero una ficha confiable del santo con biografía, patronazgos, iconografía y la fecha de fiesta resuelta contra el calendario litúrgico real, para enseñar sin propagar errores ni fechas desactualizadas."

## 4. Requisitos de producto

| ID            | Nombre                        | Descripción                                                                                                                                                                             | Prioridad |
| ------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| PRD-SANTO-001 | Ficha de santo                | Página por santo con biografía, patronazgos, fiesta litúrgica (resuelta por el Motor), iconografía, atributos y atribuciones (categoría, siglo, país). URL canónica por slug.           | P0        |
| PRD-SANTO-002 | Listado y categorías          | Listado alfabético y por categoría taxonómica (mártires, papas, doctores de la Iglesia, fundadores, etc.), paginado, con filtros por categoría, siglo y país.                           | P0        |
| PRD-SANTO-003 | Buscador                      | Búsqueda por nombre y patronazgo desde un input con debounce; mínimo 2 caracteres; resultados con snippet relevante.                                                                    | P0        |
| PRD-SANTO-004 | Santo del día                 | Página/portlet que muestra el (o los) santo(s) cuya fiesta el Motor Litúrgico resuelve para la fecha de hoy en el calendario vigente.                                                   | P0        |
| PRD-SANTO-005 | Favoritos (auth)              | Usuarios autenticados pueden marcar/desmarcar santos favoritos y ver su colección; solo usuarios con sesión; persistencia en Supabase con RLS.                                          | P1        |
| PRD-SANTO-006 | RUM                           | Telemetría real user monitoring desde el día 1: eventos `santo.viewed` y `santo.searched` (con término y éxito), siempre previo consentimiento.                                         | P1        |
| PRD-SANTO-007 | Reporte de error de contenido | Desde cada ficha, el visitante puede reportar un error de contenido (biografía, patronazgo, fecha, imagen); reportes insert-only, anonimizados, enrutados a revisión editorial del CMS. | P1        |
| PRD-SANTO-008 | Imágenes optimizadas          | Iconografía e imágenes del CMS servidas en webp responsive (múltiples densidades/anchos), con lazy loading fuera del viewport y placeholder ante ausencia de imagen.                    | P1        |

## 5. Objetivos y KPI

| Objetivo                                      | KPI                                          | Meta         |
| --------------------------------------------- | -------------------------------------------- | ------------ |
| El buscador resuelve lo que el usuario busca  | Sesiones con búsqueda exitosa                | > 70%        |
| La ficha carga rápido en condiciones reales   | LCP p75 en ficha                             | < 2.5s       |
| El contenido es confiable y se corrige rápido | Tiempo de corrección de contenido reportado  | < 48h        |
| La app engagement agrega valor al ecosistema  | Fichas vistas por sesión; santo del día CTR  | baseline MVP |
| Los favoritos aportan retención               | % de sesiones autenticadas con >= 1 favorito | baseline MVP |

## 6. Usuarios y permisos (visión producto)

| Actor               | Rol                      | Puede                                                            |
| ------------------- | ------------------------ | ---------------------------------------------------------------- |
| Visitante anónimo   | lectura                  | Ver fichas, listados, buscar, santo del día, reportar error      |
| Usuario autenticado | lectura + personal       | Todo lo anterior + marcar/desmarcar favoritos y ver su colección |
| Editor CMS          | editorial (fuera de app) | Alta/edición de fichas `santo`, revisión de reportes de error    |
| Equipo Fósforo      | operativo                | Monitoreo RUM/SLA, gestión de incidentes y del error budget      |

## 7. Riesgos de producto

| Riesgo                                             | Impacto | Mitigación                                                                                        |
| -------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| Contenido erróneo publicado en el CMS              | Alto    | Revisión editorial obligatoria en el CMS + canal de reportes de error (PRD-SANTO-007) con SLA 48h |
| Falta de imágenes para muchos santos               | Medio   | Placeholder canónico + priorización editorial de imágenes; webp/lazy para no penalizar LCP        |
| Motor Litúrgico no disponible                      | Medio   | Cache de la resolución diaria + banner de estado degradado; nunca calcular fechas localmente      |
| CMS no disponible                                  | Medio   | SSR con cache por slug; banner de degradación; objetivo de lectura servida desde cache            |
| Búsquedas sin resultados masivas (nombres locales) | Bajo    | Sinónimos y aliases post-MVP en el índice de búsqueda; analítica de términos sin resultados       |

## 8. Fuera de alcance (visión producto)

- Imágenes votivas de culto local y registros de santuarios.
- Santos no canonizados (beatos, siervos de Dios).
- Multi-idioma (solo español en MVP).
- Edición de contenido desde Santopedia (siempre vía CMS).

## 9. Dependencias

- **CMS:** único origen del contenido `santo` (lectura, listados, búsqueda full-text, imágenes).
- **Motor Litúrgico:** resolución de la fecha de fiesta (única fuente de verdad litúrgica).
- **Sistema de Logueo:** autenticación y sesiones para favoritos.
- **Log:** plataforma de RUM y logs de aplicación.
- **Supabase:** esquema `santopedia` (favoritos, reportes) con RLS.
- **Sistema de Notificaciones (futuras):** avisos de fiesta de santos favoritos, novedades editoriales. No bloquea el MVP.

## 10. Trazabilidad

Este PRD genera el [02-SRS](02-SRS.md), donde cada PRD-SANTO-xxx se desagrega en requisitos funcionales FR-SANTO-xxx verificables.
