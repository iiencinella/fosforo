---
tags:
  - proyecto/fosforo
  - cancionero
  - tests
  - aplicación
type: doc-app-tests
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-06-07
related:
  - "[[00-README|Cancionero App]]"
---

# Tests Unitarios - 0401_cancionero

## Cobertura agregada

- Validación y parseo de acordes anglosajones y españoles (`C`, `Cm`, `DO`, `DOm`, `SIb`, bajos alterados).
- Conversión a nomenclatura anglosajona y transposición conservando la familia de nomenclatura ingresada.
- Filtrado visual de moderación por estado, nombre y etiquetas.
- Herramientas visuales de lectura y fallback de diagramas.

## 1. Ficha

- ID base: `TC-0401-CANCIONERO-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-05-28

## 2. Estrategia

- **Framework:** Vitest
- **Alcance unitario:** Servicios de búsqueda (libre, por tiempo+momento), lógica de validación de contribuciones, reglas de negocio de moderación y parseo de letras con acordes.
- **Exclusiones justificadas:** Pruebas de integración con API de Calendario Litúrgico (se cubren en tests de integración post-MVP); componentes UI visuales (se cubren con tests de componentes post-MVP).

## 3. Matriz de pruebas

| ID                     | Requisito trazados                                                                                                                                       | Tipo        | Estado       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------ |
| TC-0401-CANCIONERO-001 | FR-0401-CANCIONERO-001 / FR-0401-CANCIONERO-002 / RB-0401-CANCIONERO-006 (Motor A tokenización OR)                                                       | Unitario    | Implementado |
| TC-0401-CANCIONERO-002 | FR-0401-CANCIONERO-007 / FR-0401-CANCIONERO-008 (sin filtros devuelve catalogo aprobado)                                                                 | Unitario    | Implementado |
| TC-0401-CANCIONERO-003 | FR-0401-CANCIONERO-003 / FR-0401-CANCIONERO-004 / RB-0401-CANCIONERO-007 (Motor B tiempo + momento opcional)                                             | Unitario    | Implementado |
| TC-0401-CANCIONERO-004 | FR-0401-CANCIONERO-005 / RB-0401-CANCIONERO-008 (Motor C independiente del tiempo)                                                                       | Unitario    | Implementado |
| TC-0401-CANCIONERO-005 | FR-0401-CANCIONERO-008 / RB-0401-CANCIONERO-010 (encabezado cambia segun filtros aplicados)                                                              | Unitario    | Implementado |
| TC-0401-CANCIONERO-006 | FR-0401-CANCIONERO-006 (esqueleto de pestañas en /buscar)                                                                                                | Manual      | Pendiente    |
| TC-0401-CANCIONERO-007 | FR-0401-CANCIONERO-006 (validación de query `motor=A\|B\|C` en query string)                                                                             | Manual      | Pendiente    |
| TC-0401-CANCIONERO-008 | RB-0401-CANCIONERO-001 (publicación exige etiqueta)                                                                                                      | Unitario    | Pendiente    |
| TC-0401-CANCIONERO-009 | RB-0401-CANCIONERO-002 (solo admin modera)                                                                                                               | Unitario    | Pendiente    |
| TC-0401-CANCIONERO-010 | RB-0401-CANCIONERO-005 (auditoría)                                                                                                                       | Unitario    | Pendiente    |
| TC-0401-CANCIONERO-011 | FR-0401-CANCIONERO-009 (alineación)                                                                                                                      | Unitario    | Implementado |
| TC-0401-CANCIONERO-012 | FR-0401-CANCIONERO-009 (migración `[Acorde]` → coordenadas)                                                                                              | Unitario    | Implementado |
| TC-0401-CANCIONERO-013 | FR-0401-CANCIONERO-009 (validación de coordenadas de acordes)                                                                                            | Unitario    | Implementado |
| TC-0401-CANCIONERO-014 | FR-0401-CANCIONERO-009 (upsert/remove de acordes en el editor)                                                                                           | Unitario    | Implementado |
| TC-0401-CANCIONERO-015 | FR-0401-CANCIONERO-014, FR-0401-CANCIONERO-015, RB-0401-CANCIONERO-011 (helpers `CANCIONERO_ROLE_MAP` + `CANCIONERO_ROLE_HIERARCHY` con shape correcto)  | Unitario    | Implementado |
| TC-0401-CANCIONERO-016 | FR-0401-CANCIONERO-014, FR-0401-CANCIONERO-015, RB-0401-CANCIONERO-011 (`resolveAppRole` mapea cada slug del ecosistema al AppRole correcto)             | Unitario    | Implementado |
| TC-0401-CANCIONERO-017 | FR-0401-CANCIONERO-015, RB-0401-CANCIONERO-012 (`canContribute` true para `coordinador`/`sacerdote`/`admin`, false para `musico`/`usuario`/`invitado`)   | Unitario    | Implementado |
| TC-0401-CANCIONERO-018 | FR-0401-CANCIONERO-015, RB-0401-CANCIONERO-013 (`canModerate` true solo para `admin`, false para el resto)                                               | Unitario    | Implementado |
| TC-0401-CANCIONERO-019 | FR-0401-CANCIONERO-015, RB-0401-CANCIONERO-014 (`resolveAppRole` devuelve `invitado` para `null`, `undefined` y slug desconocido)                        | Unitario    | Implementado |
| TC-0401-CANCIONERO-020 | FR-0401-CANCIONERO-015, RB-0401-CANCIONERO-014 (la jerarquía de Cancionero permite contribuir a coordinador/sacerdote/admin y moderar a sacerdote/admin) | Unitario    | Implementado |
| TC-0401-CANCIONERO-021 | FR-0401-CANCIONERO-010, FR-0401-CANCIONERO-011 (contribución guarda observaciones opcionales y aprobación exige etiquetas litúrgicas)                    | Integración | Pendiente    |

## 4. Cobertura objetivo

- Cobertura global: >= 70%
- Modulos criticos: >= 85% (motores de búsqueda, validación de contribuciones, reglas de moderación, role-mapping y capacidad de Cancionero)

## 5. Criterios de aprobación

- [x] Tests unitarios criticos en verde (TC-0401-CANCIONERO-001 a TC-0401-CANCIONERO-005 — Motores A/B/C, comportamiento laxo sin filtros y encabezado dinamico)
- [x] Tests unitarios de auth y role-mapping en verde (TC-0401-CANCIONERO-015 a TC-0401-CANCIONERO-020 — `CANCIONERO_ROLE_MAP`, `CANCIONERO_ROLE_HIERARCHY`, `resolveAppRole`, `canContribute`, `canModerate` y fallback a `invitado`)
- [ ] Tests manuales del esqueleto de pestañas (TC-0401-CANCIONERO-006, TC-0401-CANCIONERO-007)
- [ ] Cobertura minima alcanzada (>= 70%)
- [x] Trazabilidad FR -> TC actualizada (incluye FR-007, FR-008, FR-014, FR-015, FR-016)
- [x] Tests de integración del paquete compartido `@repo/auth` (14 tests: cookies y role-mapping) corren en CI
