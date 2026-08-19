---
tags:
  - proyecto/fosforo
  - portal
  - tests
  - aplicación
type: app-tests
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
---

# Tests Unitarios - 0101 Portal

## 1. Ficha

- ID base: `TC-0101-PORTAL-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-05-08

## 2. Estrategia

- Framework: Vitest para servicios, validadores, utilidades y componentes aislados; Testing Library para componentes React si la implementación lo requiere.
- Alcance unitario: carga y transformación de catálogo/novedades desde archivos versionados, validación de formularios, mapeo de estados visuales y servicios de persistencia desacoplados de la infraestructura.
- Exclusiones justificadas: navegación end-to-end, integración real con Supabase y despliegue en Vercel, que corresponden a integración o smoke tests posteriores.

## 3. Matriz de pruebas

| ID                 | Requisito trazado                       | Tipo     | Estado    |
| ------------------ | --------------------------------------- | -------- | --------- |
| TC-0101-PORTAL-001 | FR-0101-PORTAL-001, FR-0101-PORTAL-002  | Unitario | Pendiente |
| TC-0101-PORTAL-002 | FR-0101-PORTAL-003                      | Unitario | Pendiente |
| TC-0101-PORTAL-003 | FR-0101-PORTAL-004                      | Unitario | Pendiente |
| TC-0101-PORTAL-004 | FR-0101-PORTAL-005                      | Unitario | Pendiente |
| TC-0101-PORTAL-005 | FR-0101-PORTAL-006                      | Unitario | Pendiente |
| TC-0101-PORTAL-006 | FR-0101-PORTAL-007, FR-0101-PORTAL-008  | Unitario | Pendiente |
| TC-0101-PORTAL-007 | FR-0101-PORTAL-009, NFR-0101-PORTAL-004 | Unitario | Pendiente |

## 4. Cobertura objetivo

- Cobertura global: [>= 70%]
- Modulos criticos: [>= 85%]

## 5. Criterios de aprobación

- [ ] Tests unitarios criticos en verde
- [ ] Cobertura minima alcanzada
- [ ] Trazabilidad FR -> TC actualizada
- [ ] Validaciónes anti abuso y errores esperados cubiertos en formularios
