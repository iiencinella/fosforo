---
tags:
  - proyecto/fosforo
  - biblia
  - novedades
  - compartir
  - deep-links
type: app-changelog
area: aplicaciónes
status: vigente
created: 2026-08-25
related:
  - "[[00-README|0102 Biblia]]"
---

# Novedades - 2026-08-25 - Compartir citas con deep links

## Que se implemento

La pagina `/compartir` ahora soporta compartir citas bíblicas puntuales y todos los modos del hub permiten compartir lo que se esta leyendo. Motivacion: los enlaces compartidos en redes apuntaban a la propia pagina `/compartir` en lugar de llevar al texto dentro de la app, y el modo Lectura no tenia forma de compartir.

### Comportamiento nuevo

- `/compartir?ref=<cita>&version=<code>`: vista de cita unica con versiculos resueltos server-side y bloque social. El enlace compartido en redes lleva a `/?modo=busqueda&q=<cita>&version=<code>`.
- Soporte de citas entre capitulos (`1 Co 12,31-13,13`): el parser ahora expone `chapterEndVerse` y el filtrado usa `filterVersesByReference`, con soporte de rangos multiples sin huecos (salmos).
- Palabras clave compartibles: si la consulta no es referencia, la vista lo indica y el enlace abre el modo busqueda con esa `q`.
- Vista dia liturgico (`?date=`): cada seccion (Primera, Salmo, Segunda, Evangelio) tiene su boton Compartir hacia su cita.
- Hub (`PortalBibleHub` en `@repo/ui`):
  - Modo Lectura: ShareButton en panel y modal de capitulo.
  - Modo Busqueda por referencia: comparte la referencia normalizada.
  - Modo Busqueda por palabra clave: cada resultado tiene su propio ShareButton con SU cita exacta.
  - Modal Liturgia: envia la cita especifica del slot ademas de la fecha.
- La version del enlace es dinamica (version activa del usuario), validada contra el catalogo con fallback a `pd`.

### Archivos modificados

- `src/apps/biblia/src/pages/compartir.astro`: refactor a vistas dia / cita unica.
- `src/apps/biblia/src/lib/data.ts`: `filterVersesByReference`, `buildSearchDeepLink`, `chapterEndVerse` en parser.
- `src/apps/biblia/src/lib/data.test.ts`: tests nuevos (rangos, entre capitulos, deep link).
- `src/packages/ui/src/portal-bible-hub.tsx`: ShareButtons en Lectura/Busqueda/Liturgia.
- `src/apps/biblia/src/styles/share.css` y `src/apps/biblia/src/styles/biblia-hub.css`: estilos nuevos con tokens del tema.
- `src/packages/ui/package.json`: agregado script `build` (styles + components).

### Fix estructural detectado

- `@repo/ui` no tenia script `build` y su `dist/` no esta versionado: en checkouts limpios (CI/Vercel) las apps no podian resolver `@repo/ui`. Con el script `build`, turbo lo construye automaticamente via dependencia `^build` antes de las apps consumidoras.

### Validaciones ejecutadas

- `pnpm --filter @repo/ui check-types` / `lint` / `build`: ok.
- `pnpm --filter biblia check-types` (astro check): 0 errores.
- `pnpm --filter biblia test:unit`: 25 tests pasando.
- `pnpm --filter biblia build`: ok.

### Documentacion de soporte

- `docs/02-Aplicaciones/FASE_1-0102_biblia/WEB/09-Especificacion Tecnica.md`: modelo de params de `/compartir` y comportamiento de ShareButton por modo.
