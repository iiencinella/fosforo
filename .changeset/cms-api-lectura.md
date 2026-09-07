---
"cms": minor
---

API de lectura publica del CMS (FR-CMS-005/006/007, UC-CMS-008): GET /api/content/{content_type} con auth por API key (tabla content_api_keys con hash SHA-256, migracion incluida + RPC de rate limit 100 req/min por ventana fija), solo entradas published, filtros por slug y por termino de taxonomia, paginacion y contrato de respuesta { ok, data, total, page, limit }. Entradas servidas con title derivado, data cruda, rendered de campos markdown sanitizado (marked + sanitize-html) y terminos asociados (CA-CMS-003). Cache doble capa: en memoria por instancia con TTL configurable (CMS_CACHE_TTL_SECONDS, tope 5 min) e invalidacion por content type para el webhook, y cache de borde via Cache-Control s-maxage=300 stale-while-revalidate=600 con header x-cache HIT/MISS. Errores: CMS_005 (401), CMS_006 (429 con retry-after), CMS_CONTENT_TYPE_NOT_FOUND (404).
