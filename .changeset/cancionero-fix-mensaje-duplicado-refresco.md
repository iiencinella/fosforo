---
"cancionero": patch
---

Fix: el mensaje de resultado del formulario de contribución ya no desaparece con el "refresco automático". El ClientRouter de Astro interceptaba el submit de `/contribuir` (form GET delegado en `document`) y navegaba con View Transitions justo después de enviar la contribución, reemplazando el DOM y borrando el aviso de título duplicado / éxito. El listener de submit ahora se registra en fase de captura y llama `preventDefault()` antes que el router, que desiste al ver el evento ya prevenido. No es necesario un popup: el mensaje persiste hasta la próxima interacción.
