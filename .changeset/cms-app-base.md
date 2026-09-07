---
"@repo/ui": minor
"cms": minor
---

Nueva app CMS base del ecosistema (Fase 1, paso 3): scaffold Astro SSR con middleware de secure headers, autenticacion delegada en la app logueo (redirect con return_to via PUBLIC_LOGUEO_URL y guard requireAppPermission(cms)), RUM integrado dia 1 con banner de consentimiento, panel con secciones Entradas/Tipos/Taxonomias y endpoint /api/health. En @repo/ui se agregan las primitivas reutilizables DataTable.astro (tabla accesible con estado vacio) y FormField.astro (campo de formulario con ayuda y error). Dependencias de Markdown al catalogo (marked, sanitize-html + types) para el render sanitizado del paso siguiente.
