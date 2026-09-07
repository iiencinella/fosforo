---
"cms": minor
---

Webhooks de publicacion del CMS (FR-CMS-010, CA-CMS-005), ultimo bloque del MVP: suscripciones por app consumidora con URL https obligatoria y secreto HMAC-SHA256 por suscripcion (migracion incluida, gestion solo admin con panel /admin/webhooks); al aprobar una entrada se dispara fire-and-forget la secuencia completa: invalidacion del cache del content type (RB-CMS-010, paso 7), emision del webhook firmado con header x-cms-signature y reintentos con backoff (3 intentos), y evento de producto cms.entry.published al RUM (CA-CMS-006). La transicion nunca se bloquea ni falla por el despacho. Pendiente documentado: notificacion a revisores/editores (IR-CMS-004) queda ligada a la app Sistema de Notificaciones; el audit_log ya deja la trazabilidad.
