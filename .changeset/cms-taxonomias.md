---
"cms": minor
---

Taxonomias y terminos del CMS (FR-CMS-003, UC-CMS-010): endpoint /api/admin/taxonomies (GET roles del cms, POST solo admin) y /api/admin/taxonomies/terms (POST admin) con slugs inmutables (RB-CMS-008), unicidad por taxonomia (slug y nombre) y auditoria; asignacion N:M entrada-terminos via POST /api/admin/entries/[id]/terms (editor/admin, set completo con reemplazo y auditoria entry_terms_updated); filtro de listado de entradas por slug de termino (panel y API admin); panel /admin/taxonomies con creacion de taxonomias y terminos, y seccion de checkboxes agrupados por taxonomia en el editor de entradas. Errores: CMS_TAXONOMY_SLUG_DUPLICADO (409), CMS_TERM_DUPLICADO (409), CMS_TAXONOMY_NOT_FOUND (404).
