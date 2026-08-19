---
tags:
  - proyecto/fosforo
  - calendario
  - erm
  - aplicación
type: app-erm
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
---

# ERM - 0103 Calendario

## 1. Ficha

- ID base: `ERM-0103-CALENDARIO-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-05-20

## 2. Registro de riesgos y errores

| ID                      | Riesgo/Error                                                                   | Tipo   | Severidad | Mitigación                                                                                         | Owner                    |
| ----------------------- | ------------------------------------------------------------------------------ | ------ | --------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| ERM-0103-CALENDARIO-001 | Cobertura incompleta o inconsistente en `liturgy_daily_readings`.              | Riesgo | P1        | Auditar rango de fechas, huecos y unicidad antes de cerrar la implementación del MVP.              | Iván Ezequiel Iencinella |
| ERM-0103-CALENDARIO-002 | Error de validación en fechas solicitadas por usuario o app consumidora.       | Error  | P2        | Validar parámetros en capa server-side y responder errores controlados y tipificados.              | Iván Ezequiel Iencinella |
| ERM-0103-CALENDARIO-003 | Contrato inestable entre calendario y apps consumidoras.                       | Riesgo | P1        | Versionar DTOs y mantener capa de mapeo desacoplada del esquema SQL.                               | Iván Ezequiel Iencinella |
| ERM-0103-CALENDARIO-004 | Lecturas o links relaciónados apuntan a recursos inexistentes o no publicados. | Error  | P2        | Validar referencias, revisar links activos y mostrar fallback visible cuando un recurso no exista. | Iván Ezequiel Iencinella |
| ERM-0103-CALENDARIO-005 | Lectura pública bloqueada o mal abierta por políticas RLS incorrectas.         | Riesgo | P1        | Diseñar y verificar políticas explícitas para lectura pública y escritura restringida.             | Iván Ezequiel Iencinella |

## 3. Runbooks

- P1: pendiente de crear runbook para caída de lectura diaria, error de contrato o mala configuración RLS.
- P2: pendiente de crear runbook para fechas inválidas, links rotos o huecos de calendario detectados en producción.
- P3: pendiente de crear runbook para inconsistencias editoriales o degradación no crítica del servicio mensual.

## 4. Continuidad operativa

- RTO objetivo: menor a 4 horas para restaurar lectura diaria y mensual del calendario.
- RPO objetivo: menor a 1 hora para datos litúrgicos y metadatos complementarios del MVP.
- Estrategia de rollback: revertir la última versión estable de la app y, si el incidente es de esquema o política, restaurar la versión previa validada de migraciones/políticas en Supabase.
