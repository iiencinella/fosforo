---
tags:
  - proyecto/fosforo
  - biblia
  - prd
  - aplicación
type: app-prd
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-05-25
related:
  - "[[00-README|0102 Biblia]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - 0102_biblia

## 1. Ficha

- ID base: `PRD-0102-BIBLIA-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-05-18
- Estado: vigente

## 2. Problema y oportunidad

- Problema: no existe en el ecosistema una experiencia unificada para leer la Biblia por referencia, realizar búsqueda textual y consultar lecturas litúrgicas diarias desde una misma interfaz.
- Oportunidad: construir una base sólida de lectura bíblica y liturgia con datos estructurados en Supabase, lista para escalar a múltiples versiones y funciones avanzadas en fases posteriores.

## 3. Objetivo de negocio

Entregar en Fase 1 una app Biblia de uso interno que permita lectura por referencia, búsqueda y lecturas del día con buena experiencia operativa, validando arquitectura de datos y flujo funcional antes de habilitar publicación pública.

## 4. Segmentos y JTBD

- Segmento principal: equipo interno de producto/tecnología y usuarios piloto internos para validación funcional.
- Segmento secundario: colaboradores pastorales o de contenido que necesitan verificar referencias y lecturas litúrgicas.
- JTBD principal: "Cuando necesito consultar un pasaje o las lecturas del día, quiero encontrarlo rápido y con contexto mínimo para usarlo en estudio, oración o preparación pastoral".

## 5. Alcance MVP

| ID                  | Requisito de producto                                                                                           | Prioridad | Justificación                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------- |
| PRD-0102-BIBLIA-001 | Permitir lectura bíblica por libro, capítulo y versículo sobre una versión activa.                              | Must      | Es el núcleo de valor de la aplicación.                         |
| PRD-0102-BIBLIA-002 | Ofrecer búsqueda textual simple por palabras clave, devolviendo referencias bíblicas navegables.                | Must      | Sin búsqueda la consulta práctica queda limitada para uso real. |
| PRD-0102-BIBLIA-003 | Mostrar lecturas del día desde un calendario litúrgico de Rito Romano (Argentina) cargado en Supabase.          | Must      | Diferencia el producto para uso cotidiano en contexto católico. |
| PRD-0102-BIBLIA-004 | Modelar catálogo abierto de versiones bíblicas en Supabase, dejando una sola versión habilitada en MVP interno. | Must      | Permite escalado posterior sin rehacer arquitectura de datos.   |
| PRD-0102-BIBLIA-005 | Mantener el MVP en entorno interno privado mientras no exista licencia de distribución pública del contenido.   | Must      | Evita incumplimiento legal y reduce riesgo reputacional.        |

## 6. No alcance MVP

- Publicación pública de "El Libro del Pueblo de Dios" sin licencia explícita de distribución.
- Autenticación de usuarios, favoritos, listas personales y sincronización entre dispositivos.
- Generación de tarjetas para compartir en redes sociales.
- Sección de niños/adolescentes con contenido gamificado o educativo.
- Búsqueda avanzada por temas semánticos o filtros teológicos complejos.

## 7. KPI y criterios de exito

- KPI principal: tasa de éxito de consultas internas de lectura/búsqueda (solicitudes con resultado útil / solicitudes totales).
- KPI secundario 1: latencia p95 de búsqueda textual.
- KPI secundario 2: porcentaje de fechas operativas con lecturas de Rito Romano (Argentina) correctamente cargadas.

## 8. Riesgos de negocio

| Riesgo                                                                                | Impacto | Mitigación                                                                         | Owner              |
| ------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- | ------------------ |
| Bloqueo legal por ausencia de licencia de distribución pública del contenido bíblico. | Alto    | Mantener uso interno privado y documentar condición de release público.            | Producto/Seguridad |
| Cobertura incompleta de texto bíblico o lecturas litúrgicas durante carga inicial.    | Alto    | Definir proceso de ingestion validado con controles de calidad de datos.           | Técnico            |
| Degradación de performance en búsquedas textuales al crecer volumen de contenido.     | Medio   | Diseñar índices y estrategia de consultas optimizadas en Supabase/Postgres.        | Técnico            |
| Desalineación entre documentación y avance real de implementación del workspace.      | Medio   | Mantener trazabilidad estricta PRD -> SRS -> FRD -> técnica y actualizar por fase. | Producto/Técnico   |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
- Flujos derivados: [04-Flujos y Secuencias.md](04-Flujos%20y%20Secuencias.md)
