---
tags:
  - proyecto/fosforo
  - santopedia
  - erm
  - riesgos
  - web
type: app-erm
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[06-Esquema de Datos|06-Esquema de Datos]]"
  - "[[11-SLA y SLO|11-SLA y SLO]]"
---

# Santopedia — ERM (Gestión de Riesgos)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Alcance y método

Registro de riesgos operativos, técnicos y de contenido de Santopedia (fase WEB). Escala: probabilidad e impacto en 3 niveles (Bajo/Medio/Alto). Nivel de riesgo = probabilidad x impacto; P1 = crítico, P2 = alto, P3 = moderado. Continuidad objetivo: **RTO 4h** (restauración del servicio) y **RPO 24h** (pérdida de datos máxima; aplica a favoritos/reportes, el contenido vive en el CMS con sus propias copias).

## 2. Registro de riesgos

| ID            | Riesgo                                                          | Prob. | Impacto | Nivel  | Tratamiento                                           |
| ------------- | --------------------------------------------------------------- | ----- | ------- | ------ | ----------------------------------------------------- |
| ERM-SANTO-001 | Contenido erróneo publicado en el CMS                           | Media | Alto    | **P1** | Reducción y contingencia (ver 2.1)                    |
| ERM-SANTO-002 | CMS caído / API de contenido indisponible                       | Baja  | Alto    | **P2** | Mitigación con cache SSR + degradación (ver 2.2)      |
| ERM-SANTO-003 | Pico de tráfico en fiestas patronales y fechas de alta demanda  | Alta  | Medio   | **P3** | Mitigación con cache SSR por slug y por día (ver 2.3) |
| ERM-SANTO-004 | Imágenes pesadas degradando LCP                                 | Media | Medio   | **P3** | Mitigación webp responsive + lazy (ver 2.4)           |
| ERM-SANTO-005 | Exposición de PII vía RUM                                       | Baja  | Alto    | **P1** | Prevención: SDK anónimo + consentimiento (ver 2.5)    |
| ERM-SANTO-006 | Buscador con sin-resultados masivos (nombres locales/variantes) | Media | Bajo    | **P3** | Mejora continua post-MVP (ver 2.6)                    |

### 2.1 ERM-SANTO-001 — Contenido erróneo (P1)

- **Descripción:** biografía equivocada, patronazgo sin fuente o iconografía mal descripta publicada en el CMS y mostrada por Santopedia daña la credibilidad del ecosistema católico.
- **Prevención:** revisión editorial obligatoria en el CMS antes de publicar; campos con fuente obligatoria; checklist teológico mínimo por ficha.
- **Detección:** canal de reportes de error (UC-SANTO-006) + monitoreo de reportes con tipo `biografia`/`patronazgo`.
- **Respuesta:** corrección en el CMS con SLA < 48h desde el reporte (SLO-SANTO-006); propagación automática al invalidar cache del slug.
- **Runbook:** RB-SANTO-ER1 en 3.1.

### 2.2 ERM-SANTO-002 — CMS caído (P2)

- **Descripción:** la API del CMS deja de responder; las fichas nuevas no renderizan.
- **Mitigación:** SSR con cache por slug (contenido casi estático); ante falla se sirve la última versión cacheada con banner de degradación; el cache de un slug popular puede tener horas de antigüedad (aceptable por naturaleza del contenido).
- **Detección:** alerta por tasa de errores del CMS y por % de respuestas degradadas (P2 en [11-SLA y SLO](11-SLA%20y%20SLO.md)).
- **Runbook:** RB-SANTO-ER2 en 3.2.

### 2.3 ERM-SANTO-003 — Pico de tráfico en fiestas (P3)

- **Descripción:** en fiestas patronales, novenas y fechas de santos muy consultados, el tráfico puede multiplicarse.
- **Mitigación:** cache SSR por slug (el santo del día es pre-calculable una vez por fecha); cache del cálculo diario del Motor; sin N+1 hacia el CMS.
- **Runbook:** RB-SANTO-ER3 en 3.3.

### 2.4 ERM-SANTO-004 — Imágenes pesadas (P3)

- **Descripción:** imágenes del CMS sin optimizar degradan LCP y ancho de banda.
- **Mitigación:** webp responsive (`srcset` 320/640/960/1280), `loading=lazy` fuera del viewport, dimensiones explícitas (anti-CLS), placeholder si no hay imagen.
- **Detección:** LCP p75 por página en RUM (SLO-SANTO-002).

### 2.5 ERM-SANTO-005 — RUM con PII (P1)

- **Descripción:** una configuración errónea del SDK podría enviar identificadores (email, IP, user_id) a la plataforma de Log.
- **Prevención:** SDK RUM anónimo por diseño; eventos tipados con allowlist de campos; sin cookies identificativas; consentimiento previo y revocable; revisión anual del allowlist.
- **Detección:** auditoría de payload (TC-SANTO-013) + alerta si algún evento excede el esquema permitido; SLO-SANTO-007: eventos con PII = 0.

### 2.6 ERM-SANTO-006 — Búsqueda sin resultados masivos (P3)

- **Descripción:** variantes locales de nombres o patronazgos no matchean y el KPI de búsqueda exitosa (< 70%) cae.
- **Mitigación MVP:** búsqueda full-text del CMS sobre nombre y patronazgos; estado vacío con sugerencias de categorías y santo del día.
- **Post-MVP:** índice dedicado con sinónimos, aliases y normalización de variantes; analítica de términos sin resultados (evento `santo.searched` con `exito=false`).

## 3. Runbooks

### 3.1 RB-SANTO-ER1 — Corrección de contenido erróneo

1. Recibir/identificar el reporte (`reports`, tipo y `content_ref`).
2. Verificar contra fuentes hagiográficas y el calendario del Motor.
3. Corregir en el CMS (flujo editorial) y publicar.
4. Invalidar cache del slug afectado.
5. Confirmar en la ficha pública; registrar el caso para revisión editorial preventiva.
6. Cierre: SLO-SANTO-006 (corrección < 48h).

### 3.2 RB-SANTO-ER2 — CMS degradado

1. Confirmar estado del CMS (status, logs).
2. Verificar que las respuestas degradadas sirven cache y muestran banner.
3. Si el cache miss es masivo: activar página de error controlada (503 con reintento) y comunicar.
4. Al restablecerse el CMS: invalidar cache de slugs calientes (santo del día, home).
5. RTO 4h; escalar al equipo del CMS si el RTO esta comprometido.

### 3.3 RB-SANTO-ER3 — Pico de tráfico

1. Verificar hit ratio del cache SSR y del cálculo diario del Motor.
2. Confirmar que el santo del día esta pre-calculado para la fecha (no calcular on-demand por usuario).
3. Si hay saturación: elevar TTL de cache de listados temporalmente (contenido editorial cambia lento) y priorizar fichas sobre listados.
4. Post-evento: revisar LCP p75 y tasa de error del evento (SLO-SANTO-003/004).

## 4. Continuidad y backups

- **Contenido:** vive en el CMS; sus backups y RPO son responsabilidad del CMS (no de esta app). Santopedia no retiene copias de contenido.
- **Datos de usuario (`santopedia.favorites`, `santopedia.reports`):** backup diario gestionado por Supabase; RPO 24h; restauración puntual documentada en [db/README.md](../../../db/README.md).
- **RTO 4h:** ante caída total, el servicio se considera restaurado si las fichas sirven desde cache en modo degradado y la escritura de favoritos se re-habilita.
- **Revisión del registro:** trimestral o tras cualquier incidente (post-mortem actualiza este documento).
