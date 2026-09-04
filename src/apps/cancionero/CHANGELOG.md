# cancionero

## 0.1.0

### Minor Changes

- 87592b5: Mejora la experiencia de contribución, moderación y lectura de canciones: agrega filtros por estado, nombre y etiquetas; valida acordes en nomenclatura anglosajona y española; destaca el envío de nuevas versiones; e incorpora controles de tamaño, transposición y diagramas de acordes.
- a92840a: Detección de título duplicado al contribuir canciones: el POST de contribuciones responde 409 con `CANCION_TITULO_DUPLICADO` cuando el título normalizado (sin acentos, sin mayúsculas, espacios colapsados) ya existe, y la UI de `/contribuir` ofrece enviar la canción como nueva versión. Se agrega la columna `version` a `canciones` (única por título normalizado) y los listados muestran el sufijo `(vN)` cuando la versión es mayor a 1. Además, el editor de acordes de `/contribuir` vuelve a funcionar tras navegaciones con View Transitions (listeners delegados al documento en lugar de elementos cacheados).

### Patch Changes

- 23b5dac: Fix: el mensaje de resultado del formulario de contribución ya no desaparece con el "refresco automático". El ClientRouter de Astro interceptaba el submit de `/contribuir` (form GET delegado en `document`) y navegaba con View Transitions justo después de enviar la contribución, reemplazando el DOM y borrando el aviso de título duplicado / éxito. El listener de submit ahora se registra en fase de captura y llama `preventDefault()` antes que el router, que desiste al ver el evento ya prevenido. No es necesario un popup: el mensaje persiste hasta la próxima interacción.

## 0.0.2

### Patch Changes

- Updated dependencies [1434aae]
  - @repo/ui@0.1.0
