---
tags:
  - proyecto/fosforo
  - biblia
  - owasp
  - seguridad
  - aplicación
type: app-owasp
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-05-25
related:
  - "[[00-README|0102 Biblia]]"
---

# OWASP - 0102_biblia

## 1. Ficha

- ID base: `SEC-0102-BIBLIA-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-05-18

## 2. Baseline aplicable

- Web: OWASP Top 10 + ASVS.
- El MVP prioriza controles de acceso interno, protección de endpoints BFF y manejo seguro de contenido con restricción legal.

## 3. Checklist de controles

| ID                  | Control                                                                                         | Estado            | Evidencia                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------ |
| SEC-0102-BIBLIA-001 | La aplicación se mantiene en entorno interno y no expone contenido LPD públicamente.            | Definido para MVP | `00-README.md`, `01-PRD.md`, `08-Decisiones de Arquitectura.md`    |
| SEC-0102-BIBLIA-002 | Endpoints de lectura/búsqueda operan vía backend y no permiten acceso directo del cliente a DB. | Definido para MVP | `08-Decisiones de Arquitectura.md`, `09-Especificacion Tecnica.md` |
| SEC-0102-BIBLIA-003 | Validación y sanitización de entradas en parámetros de referencia, búsqueda y fecha.            | Definido para MVP | `03-FRD.md`, `09-Especificacion Tecnica.md`                        |
| SEC-0102-BIBLIA-004 | Protección de secretos y credenciales de Supabase sólo server-side.                             | Definido para MVP | `09-Especificacion Tecnica.md`                                     |
| SEC-0102-BIBLIA-005 | Logging y trazabilidad de corridas de ingestion y errores de consulta.                          | Definido para MVP | `06-Esquema de Datos.md`, `07-ERM.md`                              |

## 4. Riesgo aceptado

- Excepcion: no se aplica autenticación de usuario final en el MVP interno.
- Justificación: el alcance es uso interno controlado, con prioridad en validación funcional y modelo de datos.
- Aprobado por: producto y seguridad.
- Fecha: 2026-05-18

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad           | Requisito relaciónado                                       |
| ------------------- | ----------------------------------------------------------- |
| SEC-0102-BIBLIA-001 | FR-0102-BIBLIA-005, NFR-0102-BIBLIA-004                     |
| SEC-0102-BIBLIA-002 | FR-0102-BIBLIA-001, FR-0102-BIBLIA-002, NFR-0102-BIBLIA-003 |
| SEC-0102-BIBLIA-003 | FR-0102-BIBLIA-006                                          |
| SEC-0102-BIBLIA-004 | NFR-0102-BIBLIA-003                                         |
| SEC-0102-BIBLIA-005 | NFR-0102-BIBLIA-003, ERM-0102-BIBLIA-002                    |
