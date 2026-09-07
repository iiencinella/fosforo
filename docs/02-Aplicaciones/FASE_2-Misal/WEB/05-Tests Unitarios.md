---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - tests
type: app-tests
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
---

# Tests Unitarios - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `TC-MISAL-*`
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Estrategia

- Framework: Vitest + React Testing Library.
- Alcance unitario: composición de la página del día, transformación de payloads de Motor/CMS, estados de degradación, favoritos, preferencias de lectura.
- Integración: endpoints proxy internos (favoritos, reportes) con Supabase local; SDK RUM mockeado.
- Exclusiones: E2E de navegador (fase posterior); tests visuales de View Transitions.

## 3. Matriz de pruebas

| ID           | Requisito trazado | Tipo                                                     | Estado    |
| ------------ | ----------------- | -------------------------------------------------------- | --------- |
| TC-MISAL-001 | FR-MISAL-001      | Unitario - Página del día compone lecturas correctamente | Pendiente |
| TC-MISAL-002 | FR-MISAL-002      | Unitario - Navegación por fecha calcula ruta correcta    | Pendiente |
| TC-MISAL-003 | FR-MISAL-003      | Unitario - Página ordinario renderiza textos fijos       | Pendiente |
| TC-MISAL-004 | FR-MISAL-004      | Unitario - Transformación de payload CMS a vista         | Pendiente |
| TC-MISAL-005 | FR-MISAL-005      | Unitario - Transformación de payload Motor a vista       | Pendiente |
| TC-MISAL-006 | FR-MISAL-006      | Unitario - Badge de color litúrgico según tipo           | Pendiente |
| TC-MISAL-007 | FR-MISAL-007      | Unitario - Toggle modo lectura persiste preferencia      | Pendiente |
| TC-MISAL-008 | FR-MISAL-008      | Integration - Favorito se guarda con sesión (RLS)        | Pendiente |
| TC-MISAL-009 | FR-MISAL-009      | Unitario - Eventos RUM `misal.*` con payload correcto    | Pendiente |
| TC-MISAL-010 | FR-MISAL-010      | Integration - Reporte registra evento en Log             | Pendiente |
| TC-MISAL-011 | FR-MISAL-011      | Unitario - Opt-in recordatorio registra preferencia      | Pendiente |
| TC-MISAL-012 | RB-MISAL-004      | Unitario - Degradación: CMS caído sirve cache + banner   | Pendiente |
| TC-MISAL-013 | RB-MISAL-005      | Unitario - Favorito sin sesión muestra CTA de login      | Pendiente |
| TC-MISAL-014 | RB-MISAL-006      | Unitario - Preferencias en localStorage sin sesión       | Pendiente |
| TC-MISAL-015 | RB-MISAL-007      | Unitario - SEO: título con celebración y fecha           | Pendiente |

## 4. Cobertura objetivo

- Cobertura global: >= 80%
- Módulos críticos: >= 90% (composición del día, degradación, transformación de payloads)

## 5. Criterios de aprobación

- [ ] Tests unitarios críticos en verde
- [ ] Cobertura mínima alcanzada
- [ ] Trazabilidad FR → TC actualizada
- [ ] Tests de degradación (CMS/Motor caídos) en verde
