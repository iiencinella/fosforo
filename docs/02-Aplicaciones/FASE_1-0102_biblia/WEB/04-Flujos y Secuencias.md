---
tags:
  - proyecto/fosforo
  - biblia
  - arquitectura
  - flujos
  - aplicación
type: app-flujos
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-08-08
related:
  - "[[00-README|0102 Biblia]]"
---

# Flujos y Secuencias - 0102_biblia

## Objetivo

Describir como interactua el usuario con las funcionalidades principales de la app.

## Flujo principal

1. El usuario interno abre la app, selecciona libro/capítulo y visualiza el texto bíblico de la versión habilitada.
2. El usuario busca términos clave y navega a resultados por referencia.
3. El usuario consulta lecturas litúrgicas del día para la fecha actual o una fecha seleccionada del Rito Romano (Argentina).

## Flujos secundarios

- Flujo A - Selección de versión: el usuario cambia versión en el selector y el sistema carga sólo versiones habilitadas.
- Flujo B - Lectura por referencia directa: el usuario abre una referencia específica y el sistema posiciona el capítulo/versículo.
- Flujo C - Consulta litúrgica por fecha: el usuario selecciona fecha y recibe lecturas asociadas de Rito Romano (Argentina) o estado vacío.

## Secuencias clave

### Secuencia 1 - Lectura por libro/capítulo

1. Usuario: selecciona versión activa, libro y capítulo.
2. Sistema: valida parámetros y recupera versículos ordenados desde Supabase.
3. Usuario: navega por versículos o cambia de capítulo.
4. Sistema: actualiza vista manteniendo estado de carga/error/success.

### Secuencia 2 - Búsqueda textual

1. Usuario: escribe una palabra clave en el buscador.
2. Sistema: valida longitud mínima, consulta índice textual y devuelve resultados.
3. Sistema: abre un modal con los resultados, usando el mismo formato de versículos numerados que el modal de lectura.
   - Si la búsqueda resolvió una referencia con rango de versículos (ej. Juan 3,16-18), muestra todos los versículos en un único bloque y ofrece "Abrir capítulo completo en lectura".
   - Si son múltiples referencias, muestra cada versículo con su referencia bíblica y paginación; al seleccionar un versículo el sistema navega al capítulo completo en modo lectura.
4. Usuario: cierra el modal o selecciona un resultado.
5. Sistema: navega al libro/capítulo correspondiente en modo lectura.

### Secuencia 3 - Lecturas litúrgicas del día

1. Usuario: abre la sección de lecturas del día.
2. Sistema: consulta lecturas por fecha y rito en Supabase.
3. Usuario: revisa cada lectura y navega al pasaje completo.
4. Sistema: muestra detalle o estado vacío si no hay carga para esa fecha.
