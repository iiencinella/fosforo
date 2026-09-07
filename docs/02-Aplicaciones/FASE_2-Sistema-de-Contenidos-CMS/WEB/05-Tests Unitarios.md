---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - tests
type: app-tests
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
---

# Tests Unitarios - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `TC-CMS-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Estrategia

- Framework: Vitest + React Testing Library para componentes; Supabase local para tests de integración.
- Alcance unitario: validación de content types, transiciones de estado, serialización de API, cache, permisos RLS.
- Exclusiones justificadas: tests E2E de navegador (post-MVP); tests de carga de API (post-MVP).

## 3. Matriz de pruebas

| ID         | Requisito trazado | Tipo        | Estado    |
| ---------- | ----------------- | ----------- | --------- |
| TC-CMS-001 | FR-CMS-001        | Unitario    | Pendiente |
| TC-CMS-002 | FR-CMS-002        | Unitario    | Pendiente |
| TC-CMS-003 | FR-CMS-003        | Unitario    | Pendiente |
| TC-CMS-004 | FR-CMS-004        | Unitario    | Pendiente |
| TC-CMS-005 | FR-CMS-005        | Integración | Pendiente |
| TC-CMS-006 | FR-CMS-006        | Integración | Pendiente |
| TC-CMS-007 | FR-CMS-007        | Unitario    | Pendiente |
| TC-CMS-008 | FR-CMS-008        | Integración | Pendiente |
| TC-CMS-009 | FR-CMS-009        | Unitario    | Pendiente |
| TC-CMS-010 | FR-CMS-010        | Integración | Pendiente |
| TC-CMS-011 | FR-CMS-011        | Integración | Pendiente |
| TC-CMS-012 | RB-CMS-001        | Unitario    | Pendiente |
| TC-CMS-013 | RB-CMS-002        | Unitario    | Pendiente |
| TC-CMS-014 | RB-CMS-003        | Unitario    | Pendiente |
| TC-CMS-015 | RB-CMS-004        | Integración | Pendiente |
| TC-CMS-016 | RB-CMS-005        | Integración | Pendiente |
| TC-CMS-017 | RB-CMS-009        | Unitario    | Pendiente |
| TC-CMS-018 | RB-CMS-010        | Integración | Pendiente |

## 4. Cobertura objetivo

- Cobertura global: >= 80%
- Modulos criticos: >= 90% (API de lectura, permisos RLS, transiciones de estado, cache)

## 5. Criterios de aprobación

- [ ] Tests unitarios criticos en verde
- [ ] Cobertura minima alcanzada
- [ ] Trazabilidad FR -> TC actualizada
- [ ] Tests de permisos RLS con roles editor, revisor y admin en verde
