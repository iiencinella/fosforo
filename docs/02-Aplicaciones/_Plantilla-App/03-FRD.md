---
tags:
  - proyecto/fosforo
  - plantilla
  - frd
  - aplicación
type: plantilla-app-frd
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-04-05
related:
  - "[[00-README|Plantilla App]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - [NOMBRE_APP]

## 1. Ficha

- ID base: `RB-[APP]-*`, `UC-[APP]-*`
- Plataforma: [Web|Mobile|Desktop]
- Owner funcional: [NOMBRE]
- Fecha: [YYYY-MM-DD]

## 2. Casos de uso

| ID           | Caso de uso | Flujo principal | Excepciones |
| ------------ | ----------- | --------------- | ----------- |
| UC-[APP]-001 | [DESCRIBIR] | [DESCRIBIR]     | [DESCRIBIR] |

## 3. Reglas de negocio

| ID           | Regla       |
| ------------ | ----------- |
| RB-[APP]-001 | [DESCRIBIR] |

## 4. Validaciónes y errores esperados

| Contexto    | Validación  | Error            |
| ----------- | ----------- | ---------------- |
| [DESCRIBIR] | [DESCRIBIR] | [CODIGO/MENSAJE] |

## 5. Estados funcionales

- Estado `loading`: [DESCRIBIR]
- Estado `empty`: [DESCRIBIR]
- Estado `error`: [DESCRIBIR]
- Estado `success`: [DESCRIBIR]

## 6. Trazabilidad FRD -> SRS

| FRD          | SRS          |
| ------------ | ------------ |
| RB-[APP]-001 | FR-[APP]-001 |
