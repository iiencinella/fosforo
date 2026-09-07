---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - prd
type: app-prd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `PRD-CMS-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Problema y oportunidad

- Problema: Las apps de contenido del ecosistema (Misal, Santopedia, Oraciones, Vida de Misionero, Visita 7 Iglesias, Lectio Divina) necesitan un repositorio centralizado de contenido estructurado con versionado, flujo editorial y permisos. Sin un CMS, cada app duplicaría lógica de gestión de contenido, generando inconsistencias, deuda técnica y dependencia de desarrollo para cada cambio editorial.
- Oportunidad: Un CMS compartido permite que editores no técnicos publiquen contenido sin intervención de desarrollo, unifica la fuente de verdad de contenido del ecosistema y acelera el lanzamiento de apps de contenido al reutilizar la misma infraestructura.

## 3. Objetivo de negocio

Construir la capacidad central de gestión de contenidos del ecosistema Fósforo, permitiendo a editores crear, versionar y publicar contenido estructurado que consumen las apps de contenido de Fase 2 mediante una API REST con cache, con flujo editorial y permisos por rol.

## 4. Segmentos y JTBD

- Segmento principal: Editores de contenido del ecosistema (administradores, sacerdotes, catequistas).
- Segmento secundario: Apps consumidoras (Misal, Santopedia, Oraciones, etc.) que leen contenido via API.
- JTBD principal: "Como editor, quiero crear y publicar contenido estructurado sin escribir código, para que las apps del ecosistema lo muestren a los usuarios."

## 5. Alcance MVP

| ID          | Requisito de producto                                                  | Prioridad | Justificación                                                                       |
| ----------- | ---------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------- |
| PRD-CMS-001 | Gestión de tipos de contenido con campos personalizados                | Must      | Las apps consumidoras necesitan distintos tipos (oración, santo, artículo, lectura) |
| PRD-CMS-002 | Crear, editar, versionar y publicar entradas de contenido              | Must      | Flujo editorial básico requerido por todas las apps                                 |
| PRD-CMS-003 | Taxonomías y términos para clasificar contenido                        | Must      | Necesario para filtros, búsqueda y organización                                     |
| PRD-CMS-004 | Flujo editorial con estados (borrador, revisión, publicado, archivado) | Must      | Garantiza calidad y control de publicación                                          |
| PRD-CMS-005 | Permisos por rol (editor, revisor, administrador) con RLS              | Must      | Seguridad y separación de responsabilidades                                         |
| PRD-CMS-006 | API REST de lectura con cache para apps consumidoras                   | Must      | Las apps leen contenido en runtime                                                  |
| PRD-CMS-007 | Gestión de medios (imágenes) con Supabase Storage                      | Should    | Contenido enriquecido requiere imágenes                                             |
| PRD-CMS-008 | Búsqueda de contenido por texto y taxonomía                            | Should    | Facilita al editor encontrar contenido                                              |
| PRD-CMS-009 | Webhook de publicación para invalidar cache en apps consumidoras       | Should    | Evita contenido stale en apps                                                       |

## 6. No alcance MVP

- Editor visual WYSIWYG avanzado (MVP usa Markdown + campos estructurados).
- Versionado de tipos de contenido (solo versionado de entradas).
- Multi-idioma con traducción automática.
- Flujos de aprobación multi-nivel customizables.
- Headless CMS como SaaS externo.

## 7. KPI y criterios de exito

- KPI principal: Tiempo desde creación hasta publicación de una entrada < 30 minutos para contenido simple.
- KPI secundario 1: Disponibilidad de la API de lectura 99.9% mensual.
- KPI secundario 2: 100% de apps de contenido de Fase 2 integradas al CMS.

## 8. Riesgos de negocio

| Riesgo                                             | Impacto | Mitigación                                        | Owner                    |
| -------------------------------------------------- | ------- | ------------------------------------------------- | ------------------------ |
| Adopción lenta por editores no técnicos            | Medio   | UI editorial simple con preview en tiempo real    | Iván Ezequiel Iencinella |
| Contenido desactualizado por falta de revisión     | Medio   | Flujo editorial con notificaciones al revisor     | Iván Ezequiel Iencinella |
| Crecimiento de tipos de contenido fuera de control | Bajo    | Gobernanza de content types con rol administrador | Iván Ezequiel Iencinella |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
