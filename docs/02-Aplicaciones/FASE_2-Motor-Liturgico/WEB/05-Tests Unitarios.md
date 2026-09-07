---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - tests
type: app-tests
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
---

# Tests Unitarios - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `TC-MOTOR-LIT-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Estrategia

- Framework: Vitest
- Alcance unitario: funciones puras de calculo liturgico (`compute.ts`, `pascua.ts`, `cache.ts`), validacion de fechas, asignacion de colores y tipos de fiesta, API routes con mocks de Supabase.
- Exclusiones justificadas: integracion con CMS real (se mockea `cms_entry_id`), RUM (se mockea app Log), E2E (se cubre en otra fase).

## 3. Matriz de pruebas

| ID               | Requisito trazado | Tipo     | Descripcion                                                                          | Estado    |
| ---------------- | ----------------- | -------- | ------------------------------------------------------------------------------------ | --------- |
| TC-MOTOR-LIT-001 | FR-MOTOR-LIT-001  | Unitario | Dada fecha 2026-12-25, retorna Navidad con ciclo, nombre, tipo y color correctos     | Pendiente |
| TC-MOTOR-LIT-002 | FR-MOTOR-LIT-002  | Unitario | Dada fecha en Adviento, retorna color morado; Navidad retorna blanco                 | Pendiente |
| TC-MOTOR-LIT-003 | FR-MOTOR-LIT-003  | Unitario | Dada solemnidad, retorna tipo "solemnidad"; dada feria, retorna "feria"              | Pendiente |
| TC-MOTOR-LIT-004 | FR-MOTOR-LIT-004  | Unitario | GET /api/liturgia/{fecha} responde 200 con JSON para fecha valida; 400 para invalida | Pendiente |
| TC-MOTOR-LIT-005 | FR-MOTOR-LIT-005  | Unitario | Calculo de Pascua con algoritmo de Gauss para 2026 retorna 2026-04-05                | Pendiente |
| TC-MOTOR-LIT-006 | FR-MOTOR-LIT-006  | Unitario | Cada celebracion incluye liturgical_readings con cms_entry_id resolvible             | Pendiente |
| TC-MOTOR-LIT-007 | FR-MOTOR-LIT-007  | Unitario | Cache precalculado por ano: segunda consulta lee de PostgreSQL, no recalcula         | Pendiente |
| TC-MOTOR-LIT-008 | FR-MOTOR-LIT-008  | Unitario | Cada llamada a la API registra evento RUM sin PII                                    | Pendiente |
| TC-MOTOR-LIT-009 | NFR-MOTOR-LIT-003 | Unitario | Misma fecha produce siempre el mismo resultado (determinismo) en 100 ejecuciones     | Pendiente |
| TC-MOTOR-LIT-010 | NFR-MOTOR-LIT-004 | Unitario | Fecha 1999-01-01 responde 400 "fuera de rango"; 2099-12-31 responde 200              | Pendiente |

## 4. Cobertura objetivo

- Cobertura global: >= 85%
- Modulos criticos (compute, pascua, cache): >= 95%
- Justificacion: el calculo liturgico es determinista y central para todo el ecosistema; cualquier bug se propaga a todas las apps consumidoras.

## 5. Criterios de aprobacion

- [ ] Tests unitarios criticos (TC-001 a TC-010) en verde.
- [ ] Cobertura minima global >= 85% alcanzada.
- [ ] Cobertura de modulos criticos >= 95% alcanzada.
- [ ] Trazabilidad FR -> TC actualizada y completa.
- [ ] Tests de determinismo (TC-009) pasan en CI sin flakiness.
