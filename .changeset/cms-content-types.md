---
"cms": minor
---

Gestion de content types del CMS (FR-CMS-001, UC-CMS-001): endpoint /api/admin/content-types con GET (roles del cms) y POST (solo admin, JSON y form-data para el panel); schema de campos personalizados con seis tipos (text, number, date, markdown, reference, media) y opciones tipadas (ref_content_type, multiple, max_length, help_text); validacion Zod dinamica del jsonb data de las entradas via buildEntryDataSchema (strict, rechaza claves no declaradas); deteccion de slug duplicado con el codigo del catalogo CMS-001 (409); auditoria content_type_created en content_audit_log; panel /admin/content-types con formulario y DataTable, visible solo para admin (RB-CMS-004); helper slugify.
