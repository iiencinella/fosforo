---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
  - web
  - fase-2
  - erm
  - riesgos
type: app-erm
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[11-SLA y SLO]]"
  - "[[10-OWASP]]"
---

# Oraciones - Web - ERM (Gestión de Riesgos)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Metodología

Riesgos identificados con clasificación por severidad (P1 = crítico, P2 = mayor, P3 = menor), con plan de mitigación, respuesta (runbook) y owner definido. RTO objetivo general: **4 horas**; RPO objetivo: **24 horas** (respaldado por backups de Supabase).

## Registro de riesgos

### ERM-ORAC-001 — Contenido oracional erróneo (P1)

- **Riesgo**: una oración con texto errado o dudoso publicada en el CMS daña la confianza en la colección, que es el activo principal de la app.
- **Mitigación preventiva**: contenido SIEMPRE del CMS con revisión editorial antes de publicar; fuente visible en la ficha.
- **Detección**: reportes de usuarios (`oraciones.reports`), revisión editorial continua.
- **Respuesta (runbook)**:
  1. Registrar reporte/ingreso (< 24 h de SLA de toma).
  2. Publicación de corrección en el CMS en < 48 h (SLO-ORAC-006).
  3. Si es grave: despublicar en CMS → la app deja de mostrar la oración (la referencia desaparece del catálogo).
  4. Comunicar corrección si el error fue público.
- **Owner**: Iván Ezequiel Iencinella.

### ERM-ORAC-002 — CMS caído (P2)

- **Riesgo**: si el CMS no responde, la app sin cache queda sin contenido y sin producto.
- **Mitigación**: SSR cacheado por categoría y slug en CDN con revalidación; sirve **última cache válida** junto con banner informativo; jamas se sirve contenido local.
- **Detección**: healthcheck del CMS + alertas de tasa de errores (SLO-ORAC-004).
- **Respuesta (runbook)**:
  1. Confirmar caída con healthcheck.
  2. Activar banner de degradación y validar que las pages cacheadas continúan disponibles.
  3. Escalar a owner del CMS; restaurar servicio (RTO 4 h).
  4. Post-mortem: revisar TTL de cache si la degradación superó 1 h.
- **Owner**: Iván Ezequiel Iencinella.

### ERM-ORAC-003 — Pico de tráfico (P3)

- **Riesgo**: un pico viral de búsquedas de una oración satura el origen (CMS o SSR), degradando el LCP y, en extremo, la disponibilidad.
- **Mitigación**: SSR cacheado por categoría y slug, estático en CDN; límites de rate en endpoints dinámicos; healthcheck de origen y autoscaling Vercel.
- **Detección**: alertas de latencia p95 y error rate; monitores de tráfico inusual.
- **Respuesta (runbook)**:
  1. Confirmar pico con métricas RUM/log.
  2. aumentar TTL de cache en páginas de alta demanda si hace falta (decisión on-call).
  3. Si el origen es el CMS: activar modo cache-only temporal (sin revalidación).
  4. Post-mortem y ajuste de TTL/limite de rate.
- **Owner**: Iván Ezequiel Iencinella.

### ERM-ORAC-004 — Fuga de PII vía RUM (P1)

- **Riesgo**: que el RUM capte texto de búsqueda, identificadores o datos personales violaría la confianza y la ley local de protección de datos.
- **Mitigación**: RUM diseñado por defecto anónimo: `oracion.viewed` solo slug/categoría; `oracion.searched` solo longitud de la consulta y contexto de resultados — nunca el texto completo de la consulta; reportes con `session_hash` y no user_id.
- **Detección**: revisión de payloads de eventos en cada release (checklist de privacidad en PR).
- **Respuesta (runbook)**:
  1. Detectar payload con PII → revertir la release.
  2. Descartar/purgar los eventos afectados del Sistema de Log si el proveedor permite retención.
  3. Corregir el evento y volver a desplegar con verificación de payload.
  4. Documentar incidente y actualizar el checklist.
- **Owner**: Iván Ezequiel Iencinella.

### ERM-ORAC-005 — Colecciones/favoritos perdidos (P2)

- **Riesgo**: bug o error operativo en Supabase borra datos personales de los usuarios, lo que rompe la confianza en la capa personal.
- **Mitigación**: backups diarios de Supabase (RPO 24 h), sin operaciones destructivas ad hoc en producción; migraciones revisadas por PR; soft-delete de colecciones en lugar de hard-delete.
- **Detección**: alertas de integridad; reporte directo del usuario.
- **Respuesta (runbook)**:
  1. Identificar alcance (usuario/s/tabla/s) y ventana temporal.
  2. Restaurar el backup de Supabase más reciente que contenga los datos (RPO <= 24 h), idealmente en un ambiente de restauración para verificación previa.
  3. Merge selectivo de los datos perdidos.
  4. Post-mortem y refuerzo de políticas si la falla fue humana.
- **Owner**: Iván Ezequiel Iencinella.

### ERM-ORAC-006 — Recordatorios fallidos (P3)

- **Riesgo**: los recordatorios de devoción no llegan o llegan duplicados, afectando el hábito de oración que se apoya en ellos.
- **Mitigación**: el envío se delega en el Sistema de Notificaciones (contrato IR-ORAC-003) con idempotencia en la preferencia programada; la app solo escribe la preferencia, no envía.
- **Detección**: telemetría de Notificaciones; reporte de usuarios.
- **Respuesta (runbook)**:
  1. Verificar el estado de la preferencia en `oraciones.preferences`.
  2. Consultar logs de Notificaciones; reprogramar si falla.
  3. Si el fallo es sistemático del proveedor, desactivar el feature temporalmente con banner.
- **Owner**: Iván Ezequiel Iencinella.

## Objetivos de recuperación

| Métrica                | Objetivo                          |
| ---------------------- | --------------------------------- |
| RTO                    | 4 h                               |
| RPO                    | 24 h (backup diario Supabase)     |
| Prueba de restauración | trimestral (runbook ERM-ORAC-005) |
