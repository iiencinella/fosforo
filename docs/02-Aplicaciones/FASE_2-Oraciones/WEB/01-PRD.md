---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
  - web
  - fase-2
  - prd
type: app-prd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README]]"
  - "[[docs/00-General/06-PRD-Maestro|PRD Maestro]]"
---

# Oraciones - Web - PRD

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Ficha del documento

- Proyecto/App: Oraciones (Web)
- Owner de producto: Iván Ezequiel Iencinella
- Owner técnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Estado: draft
- Version: v0.1
- Fecha: 2026-09-05

## Objetivo de negocio

Convertir a Fósforo en el punto de encuentro confiable para orar: una colección de oraciones católicas revisada, ordenada y disponible en el momento de la necesidad. Oraciones es una app de entrada al ecosistema (tráfico orgánico por búsqueda de oraciones concretas) y puerta de enganche hacia sesión (favoritos, colecciones) y devociones habituales (recordatorios).

## Problema

El católico que quiere rezar una oración concreta la busca en papelitos, PDFs, capturas de pantalla, grupos de WhatsApp o en sitios web antiguos con links rotos. El resultado es:

- Oraciones con versiones dudosas o erróneas sin forma de saber la fuente.
- Cero organización: no existen categorías ni taxonomías útiles ("por intención", "para el Rosario").
- Falta una colección confiable, persistente y accesible desde el móvil en el momento exacto de la necesidad.

## Jobs To Be Done (JTBD)

**Segmento 1 — Católico practicante habitual:**
"Cuando quiero rezar mi devoción diaria, quiero acceder a la oración completa y correcta en dos toques, para mantener mi vida de oración sin depender de papelitos."

**Segmento 2 — Católico en un momento de necesidad:**
"Cuando un familiar está enfermo o hay una necesidad urgente, quiero la oración correcta para esa intención concreta, para rezar con certeza de que es una oración de la Iglesia."

**Segmento 3 — Católico devoto del Rosario:**
"Cuando rezo el Rosario, quiero el texto organizado por misterios, para rezarlo completo sin saltar entre varios sitios."

## Requisitos de producto priorizados

| ID           | Requisito                                                                         | Prioridad | Justificación                                                                                    |
| ------------ | --------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| PRD-ORAC-001 | Listado de oraciones por categorías (comunes, por intención, devociones, rosario) | Must      | Es el punto de entrada y el motivo principal del problema validado: dispersión sin organización. |
| PRD-ORAC-002 | Ficha de oración por slug con texto completo, intención de uso y fuente           | Must      | La ficha es el producto mismo: donde se reza la oración.                                         |
| PRD-ORAC-003 | Buscador de oraciones                                                             | Must      | En un momento de necesidad, la búsqueda es más rápida que navegar categorías.                    |
| PRD-ORAC-004 | Modo lectura (tema claro/oscuro, tamaño de fuente)                                | Must      | El uso es nocturno (antes de dormir, vigilia); la legibilidad define la retención.               |
| PRD-ORAC-005 | Favoritos por oración                                                             | Must      | Conversión a sesión y retención: la oración frecuente debe estar a un toque.                     |
| PRD-ORAC-006 | Colecciones personales (agrupar oraciones con nombre y orden)                     | Should    | Valor personal: "mi novenario", "mi cuaderno de oración" digital.                                |
| PRD-ORAC-007 | RUM: eventos de uso desde día 1                                                   | Must      | Sin datos de uso no se puede priorizar ni medir DAU.                                             |
| PRD-ORAC-008 | Reporte de error de contenido                                                     | Should    | La confianza es el activo principal: el usuario debe poder señalar errores de texto.             |
| PRD-ORAC-009 | Recordatorio de devoción vía Notificaciones                                       | Could     | Diferenciador de hábito; postergable para no dilatar el MVP.                                     |

## KPIs y métricas de éxito

| KPI                             | Objetivo MVP                    | Fuente de medición                      |
| ------------------------------- | ------------------------------- | --------------------------------------- |
| DAU                             | Crecimiento sostenido mes a mes | RUM `oracion.viewed` + analytics        |
| LCP p75                         | < 2.5 s                         | RUM Web Vitals                          |
| Tasa de búsqueda exitosa        | > 70 %                          | RUM `oracion.searched` + clic posterior |
| Conversión a sesión (favoritos) | Medición exploratoria           | Sistema de Logueo                       |

## Riesgos de negocio

| Riesgo                                                         | Impacto | Mitigación                                                                                               | Owner                    |
| -------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- | ------------------------ |
| Contenido erróneo o dudoso daña la confianza en la marca       | Alto    | Contenido SIEMPRE del CMS con revisión editorial + reporte de error (PRD-ORAC-008) con corrección < 48 h | Iván Ezequiel Iencinella |
| Dependencia total del CMS: si cae, la app queda vacía          | Alto    | Cache de páginas SSR como respaldo + banner de degradación, nunca contenido local duplicado              | Iván Ezequiel Iencinella |
| Pico de tráfico por contenido viral sin preparación            | Medio   | SSR cacheado por categoría y slug, estático en CDN                                                       | Iván Ezequiel Iencinella |
| RUM con datos personales (PII)                                 | Alto    | RUM anónimo por diseño, sin capturar texto de búsqueda completo ni identificadores                       | Iván Ezequiel Iencinella |
| Enfoque disipado en features periféricas (audio, multi-idioma) | Medio   | Alcance MVP explícito y cerrado; fuera de alcance documentado                                            | Iván Ezequiel Iencinella |
