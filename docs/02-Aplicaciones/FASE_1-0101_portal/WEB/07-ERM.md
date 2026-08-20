---
tags:
  - proyecto/fosforo
  - portal
  - erm
  - aplicación
type: app-erm
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
---

# ERM - 0101 Portal

## 1. Ficha

- ID base: `ERM-0101-PORTAL-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-05-08

## 2. Registro de riesgos y errores

| ID                  | Riesgo/Error                                                                  | Tipo   | Severidad | Mitigación                                                                                  | Owner                    |
| ------------------- | ----------------------------------------------------------------------------- | ------ | --------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| ERM-0101-PORTAL-001 | Catálogo desactualizado o inconsistente respecto del estado real de las apps. | Riesgo | P2        | Definir ownership de actualización y visibilidad de `updated_at` por registro.              | Iván Ezequiel Iencinella |
| ERM-0101-PORTAL-002 | Spam o abuso en formularios públicos.                                         | Riesgo | P1        | Validaciónes server-side, rate limiting, honeypot/captcha y revisión manual.                | Iván Ezequiel Iencinella |
| ERM-0101-PORTAL-003 | Falla de persistencia en formularios y pérdida de solicitudes.                | Error  | P1        | Reintentos controlados, logging con correlación y monitoreo del ratio de submit fallido.    | Iván Ezequiel Iencinella |
| ERM-0101-PORTAL-004 | Enlaces rotos hacia aplicaciónes o recursos externos.                         | Error  | P2        | Validación periódica de links y fallback visual cuando la app aún no está disponible.       | Iván Ezequiel Iencinella |
| ERM-0101-PORTAL-005 | Acumulación de backlog sin respuesta para soporte o aportes.                  | Riesgo | P2        | Definir estados de atención, priorización semanal y métricas de tiempo de primera revisión. | Iván Ezequiel Iencinella |

## 3. Runbooks

- P1: en preparación; debe cubrir caída de Supabase, caída de formularios o abuso masivo.
- P2: pendiente de crear runbook para catálogo/novedades desactualizados o enlaces rotos.
- P3: pendiente de crear runbook para backlog operativo de soporte y contribuciones.

## 4. Continuidad operativa

- RTO objetivo: menor a 4 horas para restaurar la capacidad de lectura pública o recepción de formularios.
- RPO objetivo: menor a 1 hora para datos críticos de envíos y catálogo.
- Estrategia de rollback: redeploy de la última versión estable, deshabilitación temporal de endpoints de escritura si hay abuso o corrupción, y recuperación desde respaldo de Supabase si fuera necesario.
