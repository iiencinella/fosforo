---
tags:
  - proyecto/fosforo
  - administracion
  - tests
  - aplicacion
type: app-tests
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[04-Flujos y Secuencias|Flujos Administracion]]"
---

# Tests Unitarios - 0107_administracion

## 1. Ficha

- ID base: `TC-0107-ADMINISTRACION-*`
- Owner QA: Ivan Ezequiel Iencinella
- Fecha: 2026-05-27

## 2. Estrategia

- Framework: Vitest (compartido con el resto del ecosistema)
- Alcance unitario: validacion de formularios, reglas de negocio (unicidad de iglesia, validacion de coordenadas), logica de autorizacion por roles, formateo de datos para dashboard
- Exclusiones justificadas: tests de integracion con Supabase se cubriran en un segundo momento; tests visuales quedan fuera del alcance unitario

## 3. Matriz de pruebas

| ID                         | Requisito trazado                                                                                                                      | Tipo     | Estado    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| TC-0107-ADMINISTRACION-001 | FR-0107-ADMINISTRACION-001 - Validacion de creacion de iglesia                                                                         | Unitario | Pendiente |
| TC-0107-ADMINISTRACION-002 | FR-0107-ADMINISTRACION-001 - Validacion de unicidad nombre+ciudad                                                                      | Unitario | Pendiente |
| TC-0107-ADMINISTRACION-003 | FR-0107-ADMINISTRACION-001 - Validacion de coordenadas geograficas                                                                     | Unitario | Pendiente |
| TC-0107-ADMINISTRACION-004 | FR-0107-ADMINISTRACION-002 - Validacion de horario (formato hora, superposicion)                                                       | Unitario | Pendiente |
| TC-0107-ADMINISTRACION-005 | FR-0107-ADMINISTRACION-004 - Autorizacion por rol (admin puede crear/editar/desactivar, editor solo crear/editar, viewer solo lectura) | Unitario | Pendiente |
| TC-0107-ADMINISTRACION-006 | FR-0107-ADMINISTRACION-005 - Registro de auditoria en operaciones CRUD                                                                 | Unitario | Pendiente |
| TC-0107-ADMINISTRACION-007 | FR-0107-ADMINISTRACION-006 - Deteccion de iglesia duplicada                                                                            | Unitario | Pendiente |
| TC-0107-ADMINISTRACION-008 | FR-0107-ADMINISTRACION-007 - Busqueda de iglesias por nombre, ciudad o provincia                                                       | Unitario | Pendiente |

## 4. Cobertura objetivo

- Cobertura global: >= 70%
- Modulos criticos: >= 85% (validaciones de iglesias, reglas de negocio de horarios, autorizacion)

## 5. Criterios de aprobacion

- [ ] Tests unitarios criticos en verde
- [ ] Cobertura minima alcanzada
- [ ] Trazabilidad FR -> TC actualizada
