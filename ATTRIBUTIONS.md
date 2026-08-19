# Atribuciones de Contenido

Este archivo registra la atribución y procedencia del contenido de terceros o de origen externo incluido en el repositorio, especialmente materiales no relacionados con codigo como imagenes, texto, audio y video.

## Como usar este archivo

Para cada recurso externo o material adaptado, agrega una entrada con:

- `path`: ruta en el repositorio del recurso o contenido
- `title`: titulo descriptivo breve
- `author`: autor original o titular de derechos
- `source`: URL original o fuente de publicación
- `license`: nombre y versión de la licencia
- `notes`: detalles de adaptación, requisitos de credito o restricciones

Cualquier contenido textual o multimedia nuevo agregado al repositorio debe quedar cubierto antes del merge por una de estas opciones:

- una entrada especifica en este archivo usando la plantilla obligatoria de abajo; o
- una entrada comodin ya existente que cubra de forma clara y precisa el material nuevo.

El contenido original creado para el proyecto tambien debe registrarse para preservar al autor original en los registros de atribución del repositorio.

## Plantillas obligatorias

### Contenido original creado para el proyecto

```text
- path: src/path/to/file
  title: Titulo del contenido
  author: Nombre completo del autor original
  source: Contenido interno del repositorio
  license: CC BY-NC 4.0
  notes: Contenido original del proyecto. El credito debe preservar al autor indicado.
```

### Contenido adaptado o importado

```text
- path: src/path/to/file
  title: Titulo del recurso
  author: Autor original o titular de derechos
  source: https://example.com/original-source
  license: Nombre y versión de licencia compatible
  notes: Contenido adaptado o importado. Describe los cambios y preserva la atribución exigida.
```

## Entradas actualmente registradas

- path: src/apps/portal/src/content/novedades/fundamentos-proyecto-fosforo.md
  title: Fundamentos del proyecto Fósforo
  author: Iván Ezequiel Iencinella
  source: Contenido interno del repositorio
  license: CC BY-NC 4.0
  notes: Texto original creado para el proyecto.

- path: src/apps/portal/src/content/paginas/sobre-nosotros.md
  title: Sobre nosotros
  author: Iván Ezequiel Iencinella
  source: Contenido interno del repositorio
  license: CC BY-NC 4.0
  notes: Incluye un enlace de referencia a Horarios de Misas; no se infiere licencia de contenido de terceros solo por enlazar ese sitio externo.

- path: src/apps/portal/src/assets/apps/\*.png
  title: Ilustraciones de portada del catálogo de apps del portal
  author: Fósforo contributors
  source: Recursos internos del repositorio
  license: CC BY-NC 4.0
  notes: Conjunto visual usado como portada de apps del ecosistema. Registrar atribución individual si en el futuro alguna pieza incorpora material externo.

- path: src/apps/portal/src/assets/blog_post_default.png
  title: Imagen base para novedades del portal
  author: Fósforo contributors
  source: Recursos internos del repositorio
  license: CC BY-NC 4.0
  notes: Pieza gráfica propia del portal.

- path: src/apps/portal/src/assets/blog_post_default.webp
  title: Imagen base optimizada para novedades del portal
  author: Fósforo contributors
  source: Derivado de `src/apps/portal/src/assets/blog_post_default.png`
  license: CC BY-NC 4.0
  notes: Versión optimizada para web del asset original del proyecto.

- path: src/apps/portal/src/assets/video/video_fosforo.mp4
  title: Video principal del hero del portal
  author: Fósforo contributors
  source: Recursos internos del repositorio
  license: CC BY-NC 4.0
  notes: Video promocional del portal. Si incorpora material de terceros, debe documentarse cada fuente adicional en esta sección.

- path: src/apps/portal/src/assets/icons/\*.svg
  title: Set de iconos SVG del portal
  author: Autores originales segun se indique en la fuente ascendente de los iconos
  source: SVG Repo (`www.svgrepo.com`), importado y adaptado dentro del repositorio
  license: Pendiente de verificación por icono segun el autor/licencia original ascendente
  notes: Los archivos conservan referencias a SVG Repo en el propio SVG. Antes de redistribuir estos iconos fuera del proyecto o relicenciarlos, verificar y completar autor y licencia de cada icono individual.

## Checklist de revision para mantenedores

- Confirmar que cada recurso de terceros tenga una licencia no comercial compatible.
- Confirmar que el texto de atribución se preserve donde corresponda.
- Confirmar que los recursos adaptados indiquen que cambio.
- Confirmar que las URLs de origen sigan siendo accesibles cuando sea posible.
