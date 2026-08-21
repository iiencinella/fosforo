---
tags:
  - proyecto/fosforo
  - tests
  - aplicacion/log
type: app-tests
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-08-21
related:
  - "[[00-README|README Log]]"
  - "[[04-Flujos y Secuencias|Flujos Log]]"
---

# Tests Unitarios - 0105_log

## 1. Ficha

- ID base: `TC-0105-LOG-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. Estrategia

- **Framework:** Vitest (configuracion del monorepo)
- **Alcance unitario:** Validacion de payloads, logica de filtros, formateo de datos, transformacion de queries, componentes React puros (sin integracion)
- **Alcance de integracion:** API endpoints de ingesta y consulta (con Supabase local)
- **Exclusiones justificadas:** Tests E2E (se cubriran en fase posterior); tests visuales de graficos

## 3. Matriz de pruebas

| ID              | Requisito trazado | Tipo                                                                 | Estado                                                    |
| --------------- | ----------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| TC-0105-LOG-001 | FR-0105-LOG-001   | Unitario - Validacion de payload valido                              | Hecho                                                     |
| TC-0105-LOG-002 | FR-0105-LOG-002   | Unitario - Payload invalido devuelve 422                             | Hecho                                                     |
| TC-0105-LOG-003 | FR-0105-LOG-002   | Unitario - Campos requeridos (app, level, message)                   | Hecho                                                     |
| TC-0105-LOG-004 | FR-0105-LOG-003   | Unitario - API key invalida devuelve 401                             | Hecho                                                     |
| TC-0105-LOG-005 | FR-0105-LOG-003   | Unitario - Request sin API key devuelve 401                          | Hecho                                                     |
| TC-0105-LOG-006 | FR-0105-LOG-004   | Integration - Listado paginado devuelve 50 items + total             | Hecho                                                     |
| TC-0105-LOG-007 | FR-0105-LOG-005   | Integration - Filtro por nivel devuelve solo ese nivel               | Hecho                                                     |
| TC-0105-LOG-008 | FR-0105-LOG-006   | Integration - Filtro por app devuelve solo esa app                   | Hecho                                                     |
| TC-0105-LOG-009 | FR-0105-LOG-007   | Integration - Filtro por rango de fechas                             | Hecho                                                     |
| TC-0105-LOG-010 | FR-0105-LOG-008   | Integration - Busqueda por texto libre                               | Hecho                                                     |
| TC-0105-LOG-011 | FR-0105-LOG-009   | Unitario - Formateo de metadata JSON para vista detalle              | Hecho                                                     |
| TC-0105-LOG-012 | FR-0105-LOG-010   | Integration - Dashboard devuelve metricas correctas                  | Hecho                                                     |
| TC-0105-LOG-013 | FR-0105-LOG-011   | Unitario - Logica de threshold de alertas                            | Hecho                                                     |
| TC-0105-LOG-014 | FR-0105-LOG-012   | Unitario - Redireccion a login si no autenticado                     | Hecho                                                     |
| TC-0105-LOG-015 | FR-0105-LOG-013   | Unitario - Render de pagina "acceso denegado" para rol no autorizado | Parcial (gate server-side cubierto; render visual en E2E) |
| TC-0105-LOG-016 | RB-0105-LOG-001   | Unitario - Validacion de campos obligatorios en payload              | Hecho                                                     |
| TC-0105-LOG-017 | RB-0105-LOG-002   | Unitario - Niveles de severidad validos                              | Hecho                                                     |
| TC-0105-LOG-018 | RB-0105-LOG-007   | Unitario - Paginacion maxima 50 items                                | Hecho                                                     |

## 4. Cobertura objetivo

- **Cobertura global:** >= 80%
- **Modulos criticos:** >= 90% (validacion payload, API endpoints de ingesta, logica de filtros)

## 5. Criterios de aprobacion

- [x] Tests unitarios criticos en verde (29 tests en 3 suites: `log-data.test.ts`, `logs.test.ts`, `authz.test.ts`)
- [ ] Cobertura minima alcanzada (medicion con `@vitest/coverage-v8` pendiente de integrar al pipeline)
- [x] Trazabilidad FR -> TC actualizada
- [ ] No hay regresiones en tests existentes del monorepo (validado en apps log/calendario; resto sin cambios)

Notas de implementacion (2026-08-21):

- Los tests de integracion de filtros se implementan sobre la logica pura (`queryLogs`) y el handler de API con repositorio mockeado; la validacion contra Supabase local/remoto queda en verificacion E2E.
- TC-015 cubre el gate server-side (`requireRole` + middleware); el render visual de la pagina de acceso denegado se verifica en E2E.
