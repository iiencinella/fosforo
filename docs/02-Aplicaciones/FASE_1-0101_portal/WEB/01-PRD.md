---
tags:
  - proyecto/fosforo
  - portal
  - prd
  - aplicación
type: app-prd
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - 0101 Portal

## 1. Ficha

- ID base: `PRD-0101-PORTAL-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-05-08
- Estado: vigente

## 2. Problema y oportunidad

- Problema: el ecosistema Fósforo necesita un punto de entrada claro para evitar que las aplicaciónes se perciban como iniciativas aisladas, sin visibilidad unificada de estado, novedades y canales de contacto.
- Oportunidad: un portal central puede acelerar descubrimiento, adopción y retroalimentación temprana, además de convertirse en la superficie principal para captar soporte, ideas y colaboración técnica o comunitaria.

## 3. Objetivo de negocio

Construir la puerta de entrada oficial del ecosistema Fósforo para Fase 1, permitiendo descubrir aplicaciónes, entender su disponibilidad, acceder a novedades y canalizar consultas, feedback y aportes de la comúnidad desde una experiencia web coherente y medible.

## 4. Segmentos y JTBD

- Segmento principal: personas que llegan por primera vez al ecosistema y necesitan entender qué aplicaciónes existen, para qué sirven y cuáles ya están disponibles.
- Segmento secundario: usuarios, colaboradores técnicos y no técnicos que quieren reportar consultas, ideas, feedback o correcciones.
- JTBD principal: "Cuando entro a Fósforo, quiero ver rápidamente qué aplicaciónes existen, cuál es su estado y cómo interactuar con el ecosistema para usarlo o mejorarlo".

## 5. Alcance MVP

| ID                  | Requisito de producto                                                                                                                                                   | Prioridad | Justificación                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| PRD-0101-PORTAL-001 | Mostrar un catálogo centralizado de aplicaciónes con nombre, descripción breve, estado y acceso correspondiente.                                                        | Must      | El portal pierde su función principal si no permite descubrir y entrar al ecosistema.                                                 |
| PRD-0101-PORTAL-002 | Publicar novedades del ecosistema y de las aplicaciónes para comúnicar lanzamientos, avances o cambios relevantes.                                                      | Must      | El portal debe actuar también como superficie editorial mínima de Fase 1.                                                             |
| PRD-0101-PORTAL-003 | Ofrecer un formulario de contacto para soporte y consultas generales.                                                                                                   | Must      | Se necesita una vía directa y trazable para soporte inicial del ecosistema.                                                           |
| PRD-0101-PORTAL-004 | Permitir que personas técnicas y no técnicas envíen ideas, sugerencias y feedback sobre las aplicaciónes.                                                               | Must      | El portal debe recoger señales de producto y priorización para las siguientes fases.                                                  |
| PRD-0101-PORTAL-005 | Incluir un espacio específico para desarrolladores que explique cómo proponer correcciones documentales, de código o integración mediante pull requests al repositorio. | Should    | Ayuda a escalar la colaboración y la calidad del repositorio desde etapas tempranas sin sumar un flujo técnico paralelo en el portal. |
| PRD-0101-PORTAL-006 | Registrar eventos y envíos para medir descubrimiento y uso de los formularios.                                                                                          | Must      | Sin medición no se puede validar si el portal cumple su función de activación y feedback.                                             |

## 6. No alcance MVP

- Portal autenticado con personalización por usuario, historial de actividad o panel privado.
- Moderación colaborativa avanzada, reputación de contribuidores o publicación automática tipo foro.
- Integraciónes bidireccionales profundas con herramientas externas de issue tracking, CRM o help desk.
- Automatizaciónes complejas de newsletter o marketing beyond eventos básicos del portal.

## 7. KPI y criterios de exito

- KPI principal: porcentaje de sesiones del portal que terminan en clic hacia una aplicación del ecosistema.
- KPI secundario 1: tasa de envío exitoso de formularios sobre sesiones que interactúan con soporte o feedback.
- KPI secundario 2: número de aportes accionables aceptados para roadmap, documentación o correcciones técnicas por mes.

## 8. Riesgos de negocio

| Riesgo                                                                            | Impacto | Mitigación                                                                     | Owner            |
| --------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------ | ---------------- |
| Falta de claridad entre apps disponibles y apps futuras.                          | Alto    | Mostrar estados explícitos y descripciones breves consistentes por aplicación. | Producto         |
| Bajo valor percibido si el portal sólo funciona como índice sin información útil. | Alto    | Combinar catálogo con novedades, soporte y espacios de colaboración.           | Producto         |
| Spam o ruido en formularios públicos.                                             | Alto    | Validaciónes, rate limiting, moderación y trazabilidad mínima por envío.       | Técnico          |
| Retraso en respuesta a consultas o aportes.                                       | Medio   | Estados de atención, priorización manual inicial y métricas de backlog.        | Producto         |
| Desalineación entre documentación del portal y su implementación futura.          | Medio   | Mantener trazabilidad PRD -> SRS -> FRD -> técnica y revisar cambios por fase. | Producto/Técnico |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
- Flujos derivados: [04-Flujos y Secuencias.md](04-Flujos%20y%20Secuencias.md)
