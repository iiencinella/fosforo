---
tags:
  - proyecto/fosforo
  - plantilla
  - srs
  - aplicación
type: plantilla-app-srs
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-04-05
related:
  - "[[00-README|Plantilla App]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - [NOMBRE_APP]

## 1. Ficha

- ID base: `FR-[APP]-*`, `NFR-[APP]-*`, `IR-[APP]-*`, `CA-[APP]-*`
- Plataforma: [Web|Mobile|Desktop]
- Owner tecnico: [NOMBRE]
- Fecha: [YYYY-MM-DD]
- Estado: [draft|vigente|completado]

## 2. Proposito y alcance tecnico

[DESCRIBIR]

## 3. Actores

- Actor 1: [DESCRIBIR]
- Actor 2: [DESCRIBIR]

## 4. Requisitos funcionales

| ID           | Requisito   | Criterio verificable |
| ------------ | ----------- | -------------------- |
| FR-[APP]-001 | [DESCRIBIR] | [DESCRIBIR]          |

## 5. Requisitos no funcionales

| ID            | Requisito                  | Objetivo   |
| ------------- | -------------------------- | ---------- |
| NFR-[APP]-001 | Disponibilidad/Estabilidad | [OBJETIVO] |
| NFR-[APP]-002 | Rendimiento                | [OBJETIVO] |
| NFR-[APP]-003 | Seguridad                  | [OBJETIVO] |

## 6. Integraciónes

| ID           | Integración | Contrato              | Version |
| ------------ | ----------- | --------------------- | ------- |
| IR-[APP]-001 | [DESCRIBIR] | [OpenAPI/Evento/etc.] | [v1]    |

## 7. Criterios de aceptación

| ID           | Criterio    |
| ------------ | ----------- |
| CA-[APP]-001 | [DESCRIBIR] |

## 8. Trazabilidad PRD -> SRS

| PRD           | SRS          |
| ------------- | ------------ |
| PRD-[APP]-001 | FR-[APP]-001 |
