---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
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

# Visita 7 Iglesias - Web - PRD

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Ficha del documento

- Proyecto/App: Visita 7 Iglesias (Web)
- Owner de producto: Iván Ezequiel Iencinella
- Owner técnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Estado: draft
- Version: v0.1
- Fecha: 2026-09-05

## Objetivo de negocio

Convertir a Fósforo en la **guía confiable de la devoción de las siete iglesias**: itinerarios por ciudad, oraciones de cada visita y registro del progreso en un solo lugar. La app capitaliza una devoción con demanda estacional concentrada (Cuaresma, con pico el Jueves Santo) para captar usuarios de alta intención espiritual y engancharlos al ecosistema (sesión, Oraciones, Calendario). El éxito del MVP se mide en **peregrinaciones completadas (7/7)**, no en visitas sueltas.

## Problema

La devoción de las siete iglesias se practica hace siglos, pero carece de guía digital confiable:

- **Itinerarios informales**: los fieles dependen de papelitos caseros, listados en grupos de WhatsApp o PDFs antiguos; no saben con certeza **cuáles son las siete iglesias de su ciudad** ni el orden razonable del recorrido.
- **Oraciones dispersas**: en cada iglesia se reza una oración distinta según la intención tradicional, y esa información está dispersa o directamente ausente de las guías caseras.
- **Progreso perdido**: durante el día de la peregrinación se pierde la cuenta de cuáles iglesias ya se visitaron (especialmente con recorridos largos o interrumpidos), y el registro no sobrevive entre dispositivos.
- **Datos desactualizados**: iglesias cerradas, horarios cambiados o direcciones viejas arruinan la peregrinación en el peor momento posible: el Jueves Santo.

## Jobs To Be Done (JTBD)

**Segmento 1 — Peregrino de Jueves Santo:**
"Cuando llega el Jueves Santo, quiero una guía clara de qué iglesias visitar, en qué orden y qué orar en cada una, para hacer la devoción completa sin depender de papelitos ni preguntar a la pasada."

**Segmento 2 — Devoto de Cuaresma:**
"Durante la Cuaresma, quiero cumplir la visita a las siete iglesias con calma y sin apuro, para vivir la preparación de la Pascua con orden y no improvisar el recorrido."

**Segmento 3 — Fiel fuera de temporada:**
"Cuando siento la devoción en cualquier época del año, quiero iniciar una peregrinación guiada en mi ciudad, para practicar la devoción aunque no sea Jueves Santo."

## Requisitos de producto priorizados

| ID          | Requisito                                                                                               | Prioridad | Justificación                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| PRD-V7I-001 | Listado de itinerarios por ciudad (MVP: 3 ciudades base)                                                | Must      | Es el punto de entrada: sin itinerario confiable por ciudad, no hay devoción guiada.                                  |
| PRD-V7I-002 | Ficha de itinerario con las 7 iglesias: nombre, dirección textual, mapa embebido y oración de la visita | Must      | La ficha es el producto: resuelve qué visitar, dónde y qué rezar en cada parada.                                      |
| PRD-V7I-003 | Modo peregrino: lista con checkboxes para recorrer la peregrinación en el día                           | Must      | El uso real es caminando, con el celular en una mano: necesita una lista simple de marcar.                            |
| PRD-V7I-004 | Registro de visita completada por iglesia (idempotente)                                                 | Must      | Sin registro no hay progreso: la marca es el gesto central del usuario durante la peregrinación.                      |
| PRD-V7I-005 | Progreso de la peregrinación (x/7) con celebración al completar                                         | Must      | Ver el avance sostiene la motivación en un recorrido de horas; completar 7/7 es el momento de mayor valor emocional.  |
| PRD-V7I-006 | Autenticación obligatoria para marcar visitas (progreso persistente por usuario)                        | Must      | El progreso es un dato personal; si no se persiste por usuario, la peregrinación se pierde al cambiar de dispositivo. |
| PRD-V7I-007 | Contexto litúrgico vía Motor Litúrgico (Cuaresma, Jueves Santo), informativo                            | Should    | Acompaña espiritualmente y prepara el pico de tráfico, sin condicionar el uso.                                        |
| PRD-V7I-008 | RUM de eventos de producto desde día 1 (embudo de peregrinación)                                        | Must      | Sin datos de uso no se puede medir el KPI (peregrinaciones completadas) ni priorizar.                                 |
| PRD-V7I-009 | Reporte de datos de iglesia incorrectos (dirección, horario)                                            | Should    | La confianza es el activo principal: el usuario debe poder señalar un dato errado y verlo corregido.                  |

## KPIs y métricas de éxito

| KPI                               | Objetivo MVP                          | Fuente de medición                          |
| --------------------------------- | ------------------------------------- | ------------------------------------------- |
| Peregrinaciones completadas (7/7) | Crecimiento temporada sobre temporada | RUM `v7i.peregrinacion.completada`          |
| LCP p75                           | < 2.5 s                               | RUM Web Vitals                              |
| Tasa de inicio de peregrinación   | Medición exploratoria (embudo)        | RUM `v7i.visita.marcada` vs vistas de ficha |
| Integridad del progreso           | 0 marcas duplicadas / 0 pérdidas      | Unique constraint + auditoría Supabase      |
| Corrección de datos de iglesia    | < 48 h en temporada                   | Cola editorial del CMS + reportes           |

## Riesgos de negocio

| Riesgo                                                 | Impacto | Mitigación                                                                                                                            | Owner                    |
| ------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Datos de iglesias desactualizados dañan la confianza   | Alto    | Contenido SIEMPRE del CMS con revisión editorial + reporte de usuario (PRD-V7I-009) + verificación intensiva pre-Jueves Santo         | Iván Ezequiel Iencinella |
| Geolocalización imprecisa confunde al peregrino        | Medio   | Dirección textual como fuente primaria; mapa embebido como apoyo; geolocalización solo opt-in y nunca fuente de verdad                | Iván Ezequiel Iencinella |
| Estacionalidad: pico de tráfico el Jueves Santo        | Alto    | Cache SSR agresivo + CDN (el contenido es casi estático); plan de capacidad y verificación técnica previa a la temporada (ver 07-ERM) | Iván Ezequiel Iencinella |
| RUM con datos personales (PII)                         | Alto    | RUM anónimo por diseño: sin PII, sin ubicación precisa, solo refs y progreso                                                          | Iván Ezequiel Iencinella |
| Enfoque disipado en features periféricas (GPS, social) | Medio   | Alcance MVP explícito y cerrado; GPS turn-by-turn y social fuera de alcance documentado                                               | Iván Ezequiel Iencinella |
