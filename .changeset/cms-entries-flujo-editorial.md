---
"cms": minor
---

Entradas y flujo editorial del CMS (FR-CMS-002/004), el corazon del panel: CRUD de entradas con revisiones inmutables (snapshot por guardado), maquina de estados draft->review->published->archived con rechazo con motivo obligatorio y restore de archivadas (solo admin), doble enforcement de transiciones (workflow en la app + RLS del paso 2), locking optimista por updated_at (ERM-CMS-001), auditoria completa en content_audit_log con registro de la version publicada reemplazada (RB-CMS-003), render Markdown sanitizado con marked + sanitize-html y vista previa via POST /api/admin/preview, y panel con listado paginado filtrable, editor JSON de campos, acciones de flujo segun rol y estado, historial de revisiones y vista previa.
