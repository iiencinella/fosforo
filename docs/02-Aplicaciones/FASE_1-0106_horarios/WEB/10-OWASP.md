---
tags:
  - proyecto/fosforo
  - horarios
  - owasp
  - seguridad
  - aplicación
type: app-owasp
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
---

# OWASP - 0106_horarios

## 1. Ficha

- ID base: `SEC-0106-HORARIOS-*`
- Plataforma: WEB
- Owner seguridad: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. Baseline aplicable

- Web: OWASP Top 10 + ASVS.
- El MVP prioriza controles en endpoints publicos de consulta, telemetria de busquedas y proteccion de datos operativos.

## 3. Checklist de controles

| ID                    | Control                                                                                    | Estado            | Evidencia                                                          |
| --------------------- | ------------------------------------------------------------------------------------------ | ----------------- | ------------------------------------------------------------------ |
| SEC-0106-HORARIOS-001 | El flujo de consulta publica no requiere autenticacion de usuario final en MVP.            | Aceptado para MVP | `00-README.md`, `02-SRS.md`, `08-Decisiones de Arquitectura.md`    |
| SEC-0106-HORARIOS-002 | Validacion y sanitizacion de parametros en endpoints de busqueda y detalle.                | Definido para MVP | `03-FRD.md`, `09-Especificacion Tecnica.md`                        |
| SEC-0106-HORARIOS-003 | Proteccion anti abuso en endpoints de lectura/eventos (rate limiting y controles basicos). | Definido para MVP | `02-SRS.md`, `07-ERM.md`                                           |
| SEC-0106-HORARIOS-004 | Minimizacion de datos en telemetria y ausencia de PII directa en eventos publicos.         | Definido para MVP | `06-Esquema de Datos.md`, `09-Especificacion Tecnica.md`           |
| SEC-0106-HORARIOS-005 | Manejo seguro de secretos server-side para integracion con Supabase.                       | Definido para MVP | `08-Decisiones de Arquitectura.md`, `09-Especificacion Tecnica.md` |
| SEC-0106-HORARIOS-006 | Logging estructurado de errores y consultas fallidas para auditoria operativa.             | Definido para MVP | `02-SRS.md`, `07-ERM.md`                                           |

## 4. Riesgo aceptado

- Excepcion: no se exige login para busqueda publica de celebraciones ni acceso a contenido complementario.
- Justificación: minimizar friccion de uso en un servicio de consulta publica de alto acceso.
- Aprobado por: producto.
- Fecha: 2026-05-26

## 5. Trazabilidad Seguridad -> Requisitos

| Seguridad             | Requisito relaciónado                                            |
| --------------------- | ---------------------------------------------------------------- |
| SEC-0106-HORARIOS-001 | NFR-0106-HORARIOS-003                                            |
| SEC-0106-HORARIOS-002 | FR-0106-HORARIOS-001, FR-0106-HORARIOS-002, FR-0106-HORARIOS-003 |
| SEC-0106-HORARIOS-003 | NFR-0106-HORARIOS-003, ERM-0106-HORARIOS-002                     |
| SEC-0106-HORARIOS-004 | NFR-0106-HORARIOS-003, FR-0106-HORARIOS-008                      |
| SEC-0106-HORARIOS-006 | NFR-0106-HORARIOS-005                                            |
