---
tags:
  - proyecto/fosforo
  - calendario
  - owasp
  - seguridad
  - aplicación
type: app-owasp
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
---

# OWASP - 0103 Calendario

## 1. Ficha

- ID base: `SEC-0103-CALENDARIO-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-05-20

## 2. Baseline aplicable

- Web: OWASP Top 10 + ASVS.
- El MVP del calendario prioriza controles sobre lectura pública, validación de parámetros de fecha, manejo seguro de secretos y políticas RLS en Supabase.

## 3. Checklist de controles

| ID                      | Control                                                                                    | Estado            | Evidencia                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------- |
| SEC-0103-CALENDARIO-001 | La lectura pública del calendario se resuelve mediante endpoints server-side controlados.  | Definido para MVP | `02-SRS.md`, `08-Decisiones de Arquitectura.md`, `09-Especificacion Tecnica.md` |
| SEC-0103-CALENDARIO-002 | La UI no expone secretos ni utiliza `service_role` en cliente.                             | Definido para MVP | `08-Decisiones de Arquitectura.md`, `09-Especificacion Tecnica.md`              |
| SEC-0103-CALENDARIO-003 | Los parámetros `date`, `year` y `month` se validan y sanitizan antes de consultar datos.   | Definido para MVP | `03-FRD.md`, `05-Tests Unitarios.md`                                            |
| SEC-0103-CALENDARIO-004 | Las tablas expuestas en `public` mantienen RLS habilitado con políticas compatibles.       | Definido para MVP | `06-Esquema de Datos.md`, `07-ERM.md`                                           |
| SEC-0103-CALENDARIO-005 | Los errores técnicos no filtran detalles internos de esquema o infraestructura.            | Definido para MVP | `03-FRD.md`, `09-Especificacion Tecnica.md`                                     |
| SEC-0103-CALENDARIO-006 | Se registran eventos operativos mínimos para fallos de lectura y degradación del servicio. | Definido para MVP | `02-SRS.md`, `07-ERM.md`, `11-SLA y SLO.md`                                     |

## 4. Riesgo aceptado

- Excepcion: el MVP expone lectura pública del calendario sin autenticación de usuario final.
- Justificación: la app cumple un rol fundacional y de consulta abierta; el riesgo se compensa con acceso server-side, validación estricta y RLS coherente.
- Aprobado por: producto.
- Fecha: 2026-05-20

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad               | Requisito relaciónado                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| SEC-0103-CALENDARIO-001 | FR-0103-CALENDARIO-004, FR-0103-CALENDARIO-006                         |
| SEC-0103-CALENDARIO-002 | NFR-0103-CALENDARIO-003                                                |
| SEC-0103-CALENDARIO-003 | FR-0103-CALENDARIO-002, FR-0103-CALENDARIO-003, FR-0103-CALENDARIO-008 |
| SEC-0103-CALENDARIO-004 | FR-0103-CALENDARIO-005, NFR-0103-CALENDARIO-003                        |
| SEC-0103-CALENDARIO-006 | NFR-0103-CALENDARIO-005, ERM-0103-CALENDARIO-005                       |
