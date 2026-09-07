---
tags:
  - proyecto/fosforo
  - aplicacion
  - visita-7-iglesias
  - web
  - fase-2
  - erm
type: app-erm
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS]]"
  - "[[08-Decisiones de Arquitectura]]"
  - "[[11-SLA y SLO]]"
---

# Gestión de Riesgos (ERM) - Visita 7 Iglesias

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto

La app tiene un patrón de tráfico fuertemente **estacional** (pico anual el Jueves Santo, temporada de Cuaresma) y un activo crítico: la **confianza en los datos de las iglesias** (direcciones, horarios, estado de apertura). Un dato errado se percibe en el peor momento posible: el día de la peregrinación. Los riesgos se priorizan con ese criterio.

## Registro de riesgos

| ID          | Riesgo                                                                              | Probabilidad | Impacto | Nivel  | Estrategia y controles                                                                                                                                                                                                                                                                                                           | Owner                    |
| ----------- | ----------------------------------------------------------------------------------- | ------------ | ------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| ERM-V7I-001 | Datos de iglesias incorrectos o desactualizados (dirección, horario, cerrada)       | Alta         | Alto    | **P1** | Contenido SIEMPRE del CMS (RB-V7I-001) + reporte de usuario (FR-V7I-008, SLO corrección < 48 h) + **revisión editorial trimestral** + **verificación intensiva obligatoria pre-Jueves Santo** (checklist de las 21 iglesias de las 3 ciudades: dirección, horario de apertura, mapa). Runbook de corrección exprés en temporada. | Iván Ezequiel Iencinella |
| ERM-V7I-002 | Pico de tráfico el Jueves Santo (múltiplos del tráfico normal)                      | Alta         | Medio   | **P2** | Cache SSR agresivo + CDN (el contenido es casi estático, ADR-V7I-007): el pico se sirve casi todo desde HIT; verificación técnica previa a la temporada (load test sobre cache hit ratio) + plan de capacidad Vercel/Supabase + modo degradado definido (banner, sin contenido local).                                           | Iván Ezequiel Iencinella |
| ERM-V7I-003 | Pérdida de progreso del peregrino (marcas no persistidas, peregrinación perdida)    | Baja         | Alto    | **P1** | Escritura idempotente con unique constraint (ADR-V7I-002) + RLS y transacciones en Supabase + **backups automáticos con RPO 24h y PITR** (RTO 4h) + auditoría de progreso (marca repetida nunca destruye estado); el progreso sobrevive entre dispositivos por diseño (auth obligatoria).                                        | Iván Ezequiel Iencinella |
| ERM-V7I-004 | CMS caído o degradado (la app quedaría sin itinerarios/oraciones)                   | Baja         | Medio   | **P3** | Cache SSR como respaldo: última cache válida + banner de degradación; nunca contenido local duplicado (RB-V7I-001); la escritura de marcas (Supabase) es independiente del CMS y sigue funcionando.                                                                                                                              | Iván Ezequiel Iencinella |
| ERM-V7I-005 | RUM con datos personales (PII): ubicación del peregrino, user_id en eventos         | Media        | Alto    | **P1** | RUM anónimo por diseño: solo `itinerary_ref`, `church_ref` y progreso x/7 (SEC-V7I-006); geolocalización opt-in, nunca se envía posición a telemetría; revisión de eventos en cada release (checklist de privacidad).                                                                                                            | Iván Ezequiel Iencinella |
| ERM-V7I-006 | Geolocalización imprecisa confunde al peregrino (lo manda a una iglesia equivocada) | Media        | Bajo    | **P3** | **Dirección textual como fuente primaria** (verificada editorialmente) + mapa embebido por iglesia; la geolocalización es opt-in (UC-V7I-007) y jamás reemplaza la dirección ni se usa para "auto-marcar" visitas.                                                                                                               | Iván Ezequiel Iencinella |

## Matriz de exposición

| Riesgo      | Nivel | Tratamiento     | Residual                                 |
| ----------- | ----- | --------------- | ---------------------------------------- |
| ERM-V7I-001 | P1    | Mitigar         | Bajo (con verificación pre-Jueves Santo) |
| ERM-V7I-002 | P2    | Mitigar         | Bajo (con cache + load test)             |
| ERM-V7I-003 | P1    | Mitigar         | Muy bajo (backups + idempotencia)        |
| ERM-V7I-004 | P3    | Aceptar/Mitigar | Bajo (cache + escritura independiente)   |
| ERM-V7I-005 | P1    | Mitigar         | Muy bajo (diseño anónimo por defecto)    |
| ERM-V7I-006 | P3    | Mitigar         | Bajo (dirección textual como primaria)   |

## Runbooks

### Runbook 1: dato de iglesia errado reportado en temporada (ERM-V7I-001)

1. Alerta: nuevo reporte en la cola (FR-V7I-008) clasificado como P1 en temporada (SLO < 48 h).
2. Verificar el dato (dirección/horario/apertura) contra fuente oficial de la diócesis o parroquia.
3. Corregir **en el CMS** (nunca en la app); la corrección se propaga desde la próxima renderización (cache invalidada por tag de itinerario).
4. Responder al usuario si dejó contacto opcional; cerrar el reporte con resolución documentada.

### Runbook 2: pico de Jueves Santo (ERM-V7I-002)

1. Pre-temporada (semana previa): load test + verificar hit ratio de CDN > 95 % en rutas de itinerarios; verificar plan de capacidad de Vercel y Supabase.
2. Día D: monitoreo activo de TTFB p95 (SLO < 800 ms), tasa de error y estado del CMS.
3. Si el CMS se degrada: verificar banner de degradación y última cache válida; no habilitar contenido local jamás.
4. Si Supabase se degrada: comunicar estado en banner; las marcas fallan visiblemente con reintento (nunca se pierden en silencio: el UI hace rollback del estado optimista).

### Runbook 3: pérdida de progreso reportada por usuario (ERM-V7I-003)

1. Identificar peregrinación por user_id (soporte con acceso verificado).
2. Verificar en `pilgrimages`/`pilgrimage_visits` el estado real; distinguir "no marcó" de "se perdió".
3. Si es falla del sistema: restaurar desde backup (RPO 24h) o compensar manualmente con constancia del usuario; documentar el caso.
4. Post-incidente: revisar logs del endpoint de marca y abrir fix con test de regresión (TC-V7I-005/006).

## Continuidad operativa

- **RTO objetivo: 4 horas** (restauración de Supabase o degradación controlada).
- **RPO objetivo: 24 horas** (backups automáticos diarios; PITR si está disponible en el plan).
- Dependencias críticas del día pico: CDN (cache), Supabase (marcas), CMS (contenido) — en ese orden de impacto para el usuario.
- Post-Jueves Santo: revisión de incidentes de temporada y actualización de este registro de riesgos.
