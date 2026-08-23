---
tags:
  - proyecto/fosforo
  - portal
  - owasp
  - seguridad
  - aplicación
type: app-owasp
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
---

# OWASP - 0101 Portal

## 1. Ficha

- ID base: `SEC-0101-PORTAL-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-05-08

## 2. Baseline aplicable

- Web: OWASP Top 10 + ASVS.
- El MVP del portal prioriza controles sobre formularios públicos, manejo de datos de contacto, secretos e integraciónes server-side.

## 3. Checklist de controles

| ID                  | Control                                                                                      | Estado                      | Evidencia                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------ |
| SEC-0101-PORTAL-001 | Los formularios del MVP permanecen publicos y no dependen de autenticación de usuario final. | Aceptado para MVP           | `00-README.md`, `02-SRS.md`, `08-Decisiones de Arquitectura.md`                                  |
| SEC-0101-PORTAL-002 | Autorización por rol/recurso para operaciónes administrativas o de backoffice.               | Definido a nivel documental | `docs/01-Arquitectura/Capacidades Compartidas/SRS-Identidad-y-Acceso.md`                         |
| SEC-0101-PORTAL-003 | Validación y sanitización de entradas en todos los formularios.                              | Definido para MVP           | `03-FRD.md`, `09-Especificación Tecnica.md`                                                      |
| SEC-0101-PORTAL-004 | Proteccion contra abuso, rate limiting y minimización de datos de contacto.                  | Definido para MVP           | `02-SRS.md`, `07-ERM.md`                                                                         |
| SEC-0101-PORTAL-005 | Logging y auditoria de eventos sensibles de submit y fallo.                                  | En implementación           | `02-SRS.md`, `07-ERM.md`, migración `202608190001_create_portal_submissions.sql`                 |
| SEC-0101-PORTAL-006 | Manejo seguro de secretos y acceso server-side a Supabase.                                   | Implementado en código      | `08-Decisiones de Arquitectura.md`, `09-Especificación Tecnica.md`, `src/lib/supabase-server.ts` |

## 4. Riesgo aceptado

- Excepcion: no se exige autenticación de usuario final para consultar catalogo y enviar formularios durante el MVP.
- Justificación: se prioriza baja friccion de descubrimiento y colaboración temprana; se compensa con anti abuso y moderación.
- Aprobado por: producto.
- Fecha: 2026-05-08

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad           | Requisito relaciónado                                      |
| ------------------- | ---------------------------------------------------------- |
| SEC-0101-PORTAL-001 | NFR-0101-PORTAL-003                                        |
| SEC-0101-PORTAL-003 | FR-0101-PORTAL-004, FR-0101-PORTAL-005, FR-0101-PORTAL-006 |
| SEC-0101-PORTAL-004 | NFR-0101-PORTAL-003, ERM-0101-PORTAL-002                   |
| SEC-0101-PORTAL-005 | FR-0101-PORTAL-008, NFR-0101-PORTAL-005                    |
