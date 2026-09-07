---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - erm
type: app-erm
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
---

# ERM - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `ERM-CMS-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Registro de riesgos y errores

| ID          | Riesgo/Error                                                 | Tipo   | Severidad | Mitigación                                                          | Owner                    |
| ----------- | ------------------------------------------------------------ | ------ | --------- | ------------------------------------------------------------------- | ------------------------ |
| ERM-CMS-001 | Pérdida de contenido por edición concurrente                 | Riesgo | P2        | Revisiones inmutables + optimistic locking en `content_entries`     | Iván Ezequiel Iencinella |
| ERM-CMS-002 | Publicación accidental de contenido en borrador              | Riesgo | P2        | Flujo editorial obliga revisión; RLS bloquea publicación a editores | Iván Ezequiel Iencinella |
| ERM-CMS-003 | Contenido stale en apps consumidoras por cache no invalidado | Riesgo | P3        | Webhook de publicación + TTL de cache (5 min max)                   | Iván Ezequiel Iencinella |
| ERM-CMS-004 | Degradación de API por volumen de medios                     | Riesgo | P3        | Optimización a webp, max 2MB, Storage separado de base relacional   | Iván Ezequiel Iencinella |
| ERM-CMS-005 | API key comprometida por app consumidora                     | Riesgo | P2        | Rotación de keys, rate limiting, monitoreo de uso anómalo via Log   | Iván Ezequiel Iencinella |
| ERM-CMS-006 | Slug duplicado por race condition                            | Error  | P3        | Constraint único en DB + validación en API                          | Iván Ezequiel Iencinella |
| ERM-CMS-007 | Fallo de Supabase Storage al subir medio                     | Error  | P3        | Reintentos con backoff; mensaje de error claro al editor            | Iván Ezequiel Iencinella |

## 3. Runbooks

- P2 (publicación accidental): Revertir estado de entrada via panel admin; registrar en `content_audit_log`; notificar al editor.
- P2 (API key comprometida): Rotar key en Supabase; actualizar apps consumidoras; revisar logs de acceso anómalo.
- P3 (cache stale): Forzar invalidación manual del content type afectado; revisar webhook de publicación.

## 4. Continuidad operativa

- RTO objetivo: 4 horas (CMS es no-crítico para runtime de apps; estas tienen cache local).
- RPO objetivo: 1 hora (respaldos de PostgreSQL cada hora).
- Estrategia de rollback: Migración reversiva en Supabase; revisiones inmutables permiten restaurar versión publicada anterior.
