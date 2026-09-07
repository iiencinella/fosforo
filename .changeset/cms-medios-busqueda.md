---
"cms": minor
---

Medios y busqueda del CMS (FR-CMS-008/009). Medios: bucket publico cms-media en Supabase Storage con policies de escritura solo para admin/editor (migracion incluida), subida validando webp/jpeg hasta 2MB (RB-CMS-009, CMS_004) asociada a una entrada con registro en content_media y URL publica; listado y borrado desde el editor de entradas (override _method=delete para forms HTML). Busqueda: RPC search_content_entries security-invoker (la RLS filtra estados por rol en el panel; la API publica pasa statuses published), endpoints GET /api/admin/search y GET /api/content/search con API key y rate limit, minimo 3 caracteres sin comodines (CMS_007, 422).
