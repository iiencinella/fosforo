---
tags:
  - proyecto/fosforo
  - biblia
  - tests
  - aplicación
type: app-tests
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-05-25
related:
  - "[[00-README|0102 Biblia]]"
---

# Tests Unitarios - 0102_biblia

## 1. Ficha

- ID base: `TC-0102-BIBLIA-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-05-18

## 2. Estrategia

- Framework: Vitest para servicios de lectura/búsqueda/liturgia y utilidades de mapeo; Testing Library en componentes interactivos cuando aplique.
- Alcance unitario: validación de referencias, transformación de resultados, servicios de búsqueda, resolución de lecturas litúrgicas, manejo de estados y errores esperados.
- Exclusiones justificadas: pruebas end-to-end UI completa, performance de base de datos a gran escala y validación legal/licenciamiento de contenido.

## 3. Matriz de pruebas

| ID                 | Requisito trazado                       | Tipo     | Estado    |
| ------------------ | --------------------------------------- | -------- | --------- |
| TC-0102-BIBLIA-001 | FR-0102-BIBLIA-001                      | Unitario | Pendiente |
| TC-0102-BIBLIA-002 | FR-0102-BIBLIA-002                      | Unitario | Pendiente |
| TC-0102-BIBLIA-003 | FR-0102-BIBLIA-003                      | Unitario | Pendiente |
| TC-0102-BIBLIA-004 | FR-0102-BIBLIA-004, NFR-0102-BIBLIA-005 | Unitario | Pendiente |
| TC-0102-BIBLIA-005 | FR-0102-BIBLIA-005, NFR-0102-BIBLIA-004 | Unitario | Pendiente |
| TC-0102-BIBLIA-006 | FR-0102-BIBLIA-006                      | Unitario | Pendiente |

## 4. Cobertura objetivo

- Cobertura global: [>= 70%]
- Modulos criticos: [>= 85%]
- Módulos críticos priorizados: validación de referencia, servicio de búsqueda y resolución de lecturas litúrgicas.

## 5. Criterios de aprobación

- [ ] Tests unitarios criticos en verde
- [ ] Cobertura minima alcanzada
- [ ] Trazabilidad FR -> TC actualizada
- [ ] Errores esperados (`BIBLIA_*`) cubiertos por tests de comportamiento.
