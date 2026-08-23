---
tags:
  - proyecto/fosforo
  - calendario
  - tests
  - aplicación
type: app-tests
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
---

# Tests Unitarios - 0103 Calendario

## 1. Ficha

- ID base: `TC-0103-CALENDARIO-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-05-20

## 2. Estrategia

- Framework: Vitest para validadores, mapeos, utilidades, servicios y endpoints desacoplados; pruebas de componentes aislados si la implementación lo justifica.
- Alcance unitario: validación de fechas y rango mensual, mapeo de filas SQL a DTOs públicos, composición de links ecosistema, fallback exacto y por `MM-DD`, metadata enriquecida (`rank`, `is_marian`, `is_argentina`, `source_note`), resúmenes mensuales (`metadataSummary`) y manejo de errores esperados.
- Exclusiones justificadas: integración real con Supabase, navegación end-to-end y rendering full page; esas coberturas corresponden a integración o smoke tests posteriores.

## 3. Matriz de pruebas

| ID                     | Requisito trazado                              | Tipo            | Estado  |
| ---------------------- | ---------------------------------------------- | --------------- | ------- |
| TC-0103-CALENDARIO-001 | FR-0103-CALENDARIO-001                         | Unitario        | Parcial |
| TC-0103-CALENDARIO-002 | FR-0103-CALENDARIO-002, FR-0103-CALENDARIO-008 | Unitario/E2E    | Parcial |
| TC-0103-CALENDARIO-003 | FR-0103-CALENDARIO-003                         | Unitario/E2E    | Parcial |
| TC-0103-CALENDARIO-004 | FR-0103-CALENDARIO-004, FR-0103-CALENDARIO-006 | Integración/E2E | Parcial |
| TC-0103-CALENDARIO-005 | FR-0103-CALENDARIO-005, RB-0103-CALENDARIO-002 | Integración     | Parcial |
| TC-0103-CALENDARIO-006 | FR-0103-CALENDARIO-007, RB-0103-CALENDARIO-006 | Unitario        | Parcial |
| TC-0103-CALENDARIO-007 | FR-0103-CALENDARIO-009, RB-0103-CALENDARIO-001 | Integración     | Parcial |

## 4. Cobertura objetivo

- Cobertura global: [>= 70%]
- Modulos criticos: [>= 85%]

## 5. Criterios de aprobación

- [ ] Tests unitarios criticos en verde
- [ ] Cobertura minima alcanzada
- [ ] Trazabilidad FR -> TC actualizada
- [ ] Casos de fecha inválida, ausencia de jornada y errores de contrato cubiertos
- [ ] Metadata enriquecida de perfiles mensuales cubierta en DTOs y vista mensual

## 6. Comandos adicionales

```bash
pnpm --filter=calendario test:unit
CALENDARIO_RUN_INTEGRATION=true pnpm --filter=calendario test:integration
CALENDARIO_E2E_BASE_URL=http://localhost:4321 pnpm --filter=calendario test:e2e
```
