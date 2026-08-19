---
tags:
  - proyecto/fosforo
  - biblia
  - erm
  - aplicación
type: app-erm
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-05-25
related:
  - "[[00-README|0102 Biblia]]"
---

# ERM - 0102_biblia

## 1. Ficha

- ID base: `ERM-0102-BIBLIA-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-05-18

## 2. Registro de riesgos y errores

| ID                  | Riesgo/Error                                                                     | Tipo   | Severidad | Mitigación                                                                              | Owner                    |
| ------------------- | -------------------------------------------------------------------------------- | ------ | --------- | --------------------------------------------------------------------------------------- | ------------------------ |
| ERM-0102-BIBLIA-001 | Exposición pública accidental de contenido LPD sin licencia.                     | Riesgo | P1        | Restringir app y endpoints a entorno interno; checklist legal previo a release público. | Iván Ezequiel Iencinella |
| ERM-0102-BIBLIA-002 | Carga incompleta o inconsistente de texto bíblico (libros/capítulos/versículos). | Error  | P1        | Pipeline de ingestion con validación de conteos y trazabilidad por corrida.             | Iván Ezequiel Iencinella |
| ERM-0102-BIBLIA-003 | Baja performance en búsqueda por falta de indexación.                            | Riesgo | P2        | Índices full-text, límites de consulta y revisión periódica de planes SQL.              | Iván Ezequiel Iencinella |
| ERM-0102-BIBLIA-004 | Lecturas litúrgicas incompletas para una fecha operativa.                        | Error  | P2        | Carga anticipada por ventana y alerta de huecos de calendario.                          | Iván Ezequiel Iencinella |
| ERM-0102-BIBLIA-005 | Desalineación entre versión habilitada y datos consumidos por UI.                | Error  | P2        | Regla de una versión activa en MVP y validaciones server-side de consistencia.          | Iván Ezequiel Iencinella |

## 3. Runbooks

- P1: pendiente de crear runbook para incidente de exposición de contenido restringido.
- P2: pendiente de crear runbook para fallas de ingestion/consistencia de capítulos y versículos.
- P3: pendiente de crear runbook para degradación de búsqueda y datos litúrgicos incompletos.

## 4. Continuidad operativa

- RTO objetivo: menor a 4 horas para restablecer lectura interna de pasajes y consulta litúrgica.
- RPO objetivo: menor a 24 horas para contenido bíblico/litúrgico ante fallas de carga.
- Estrategia de rollback: restaurar snapshot consistente de Supabase, deshabilitar versión afectada y volver a última corrida de ingestion validada.
