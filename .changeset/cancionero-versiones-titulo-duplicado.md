---
"cancionero": minor
---

Detección de título duplicado al contribuir canciones: el POST de contribuciones responde 409 con `CANCION_TITULO_DUPLICADO` cuando el título normalizado (sin acentos, sin mayúsculas, espacios colapsados) ya existe, y la UI de `/contribuir` ofrece enviar la canción como nueva versión. Se agrega la columna `version` a `canciones` (única por título normalizado) y los listados muestran el sufijo `(vN)` cuando la versión es mayor a 1. Además, el editor de acordes de `/contribuir` vuelve a funcionar tras navegaciones con View Transitions (listeners delegados al documento en lugar de elementos cacheados).
