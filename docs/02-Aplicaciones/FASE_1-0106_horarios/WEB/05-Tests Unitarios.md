---
tags:
  - proyecto/fosforo
  - horarios
  - tests
  - aplicación
type: app-tests
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
  - "[[04-Flujos y Secuencias|Flujos Horarios]]"
---

# Tests Unitarios - 0106_horarios

## 1. Ficha

- ID base: `TC-0106-HORARIOS-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. Estrategia

- Framework: Vitest (unidad) + pruebas de integracion de API con entorno controlado.
- Alcance unitario: validacion de query params, logica de filtros, orden por cercania, mapeo de DTOs y componentes puros.
- Alcance de integracion: endpoints de busqueda y detalle contra repositorio de datos (mock o Supabase local).
- Exclusiones justificadas: pruebas E2E cross-browser y performance testing profundo quedan para siguiente iteracion.

## 3. Matriz de pruebas

| ID                   | Requisito trazado     | Tipo                                                          | Estado    |
| -------------------- | --------------------- | ------------------------------------------------------------- | --------- |
| TC-0106-HORARIOS-001 | FR-0106-HORARIOS-001  | Unitario - normaliza query de busqueda por templo/ciudad      | Pendiente |
| TC-0106-HORARIOS-002 | FR-0106-HORARIOS-001  | Integracion - `GET /api/celebraciones` retorna lista paginada | Pendiente |
| TC-0106-HORARIOS-003 | FR-0106-HORARIOS-002  | Unitario - filtro por tipo aplica correctamente               | Pendiente |
| TC-0106-HORARIOS-004 | FR-0106-HORARIOS-003  | Unitario - filtro por franja y fecha valida casos limite      | Pendiente |
| TC-0106-HORARIOS-005 | FR-0106-HORARIOS-004  | Integracion - `GET /api/templos/{id}` retorna ficha completa  | Pendiente |
| TC-0106-HORARIOS-006 | FR-0106-HORARIOS-005  | Unitario - mapeo de estado de actualizacion por templo        | Pendiente |
| TC-0106-HORARIOS-007 | FR-0106-HORARIOS-007  | Unitario - orden por cercania con geolocalizacion habilitada  | Pendiente |
| TC-0106-HORARIOS-008 | FR-0106-HORARIOS-009  | Unitario - estados UI loading/empty/error/success             | Pendiente |
| TC-0106-HORARIOS-009 | RB-0106-HORARIOS-006  | Unitario - composicion de filtros en modo AND                 | Pendiente |
| TC-0106-HORARIOS-010 | NFR-0106-HORARIOS-003 | Unitario - rechazo de parametros invalidos en API             | Pendiente |

## 4. Cobertura objetivo

- Cobertura global: >= 80%
- Modulos criticos: >= 90% (filtros, validaciones API y orden por cercania)

## 5. Criterios de aprobación

- [ ] Tests unitarios criticos en verde
- [ ] Cobertura minima alcanzada
- [ ] Trazabilidad FR -> TC actualizada
- [ ] No hay regresiones en suites compartidas del monorepo
