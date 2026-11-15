# @repo/ui

## 0.2.0

### Minor Changes

- 1a836d6: Nueva app CMS base del ecosistema (Fase 1, paso 3): scaffold Astro SSR con middleware de secure headers, autenticacion delegada en la app logueo (redirect con return_to via PUBLIC_LOGUEO_URL y guard requireAppPermission(cms)), RUM integrado dia 1 con banner de consentimiento, panel con secciones Entradas/Tipos/Taxonomias y endpoint /api/health. En @repo/ui se agregan las primitivas reutilizables DataTable.astro (tabla accesible con estado vacio) y FormField.astro (campo de formulario con ayuda y error). Dependencias de Markdown al catalogo (marked, sanitize-html + types) para el render sanitizado del paso siguiente.

## 0.1.0

### Minor Changes

- 1434aae: Compartir citas bíblicas con deep links: /compartir soporta vista de cita única (?ref=&version=) cuyo enlace social lleva a /?modo=busqueda&q=<cita>&version=<code>; modo Lectura suma botón de compartir (panel y modal); búsqueda por palabra clave permite compartir cada resultado con su cita exacta; liturgia comparte la cita específica del slot. Fix: @repo/ui agrega script build para que turbo genere dist antes de las apps consumidoras.
