---
tags:
  - proyecto/fosforo
  - biblia
  - frd
  - aplicación
type: app-frd
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-05-25
related:
  - "[[00-README|0102 Biblia]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - 0102_biblia

## 1. Ficha

- ID base: `RB-0102-BIBLIA-*`, `UC-0102-BIBLIA-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-05-18

## 2. Casos de uso

| ID                 | Caso de uso                                   | Flujo principal                                                                                     | Excepciones                                                          |
| ------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| UC-0102-BIBLIA-001 | Leer un pasaje bíblico por referencia.        | El usuario selecciona versión activa, libro y capítulo; el sistema muestra versículos ordenados.    | Referencia inválida, capítulo sin contenido o versión deshabilitada. |
| UC-0102-BIBLIA-002 | Buscar pasajes por texto.                     | El usuario ingresa término de búsqueda y el sistema devuelve resultados con referencia y fragmento. | Consulta vacía, sin resultados o error de búsqueda.                  |
| UC-0102-BIBLIA-003 | Consultar lecturas litúrgicas del día.        | El usuario abre la vista litúrgica y el sistema muestra lecturas asociadas a la fecha.              | Fecha sin carga, rito no disponible o error de datos.                |
| UC-0102-BIBLIA-004 | Operar catálogo de versiones en modo interno. | Operador marca versión habilitada para lectura y el sistema mantiene una activa en MVP.             | Intento de habilitar múltiples versiones en conflicto operativo.     |

## 3. Reglas de negocio

| ID                 | Regla                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| RB-0102-BIBLIA-001 | En MVP solo una versión bíblica puede estar habilitada para experiencia de lectura pública interna.         |
| RB-0102-BIBLIA-002 | Toda referencia debe resolverse como `versión -> libro -> capítulo -> versículo` y mantener orden canónico. |
| RB-0102-BIBLIA-003 | La búsqueda textual opera sobre la versión activa y debe devolver referencias navegables.                   |
| RB-0102-BIBLIA-004 | Las lecturas litúrgicas deben estar asociadas a fecha, rito y tipo de lectura con referencia verificable.   |
| RB-0102-BIBLIA-005 | El contenido LPD se mantiene en uso interno; no se habilita distribución pública sin licencia formal.       |

## 4. Validaciónes y errores esperados

| Contexto               | Validación                                                                         | Error                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Lectura por referencia | `version_slug`, `book_slug` y `chapter_number` obligatorios; `chapter_number > 0`. | `BIBLIA_INVALID_REFERENCE` - Referencia incompleta o inválida.            |
| Búsqueda textual       | `query` obligatorio y longitud mínima de 2 caracteres.                             | `BIBLIA_SEARCH_INVALID_QUERY` - Consulta demasiado corta o vacía.         |
| Resultado de búsqueda  | Si no hay coincidencias, no es error técnico y se retorna estado vacío.            | `BIBLIA_SEARCH_EMPTY` - No se encontraron resultados para la búsqueda.    |
| Lecturas litúrgicas    | `date` en formato ISO válido y rito reconocido.                                    | `BIBLIA_LITURGY_NOT_FOUND` - No hay lecturas cargadas para la fecha/rito. |
| Versiones              | Lectura solo en versión con `is_enabled = true` en MVP.                            | `BIBLIA_VERSION_DISABLED` - Versión no habilitada para lectura.           |

## 5. Estados funcionales

- Estado `loading`: skeleton de capítulos, resultados de búsqueda y panel de lecturas del día.
- Estado `empty`: mensaje claro cuando no hay resultados de búsqueda o lecturas para la fecha.
- Estado `error`: error recuperable con opción de reintentar o cambiar referencia/fecha.
- Estado `success`: render completo de pasaje, resultados o lecturas litúrgicas válidas.

## 6. Trazabilidad FRD -> SRS

| FRD                                     | SRS                                     |
| --------------------------------------- | --------------------------------------- |
| UC-0102-BIBLIA-001 / RB-0102-BIBLIA-002 | FR-0102-BIBLIA-001                      |
| UC-0102-BIBLIA-002 / RB-0102-BIBLIA-003 | FR-0102-BIBLIA-002                      |
| UC-0102-BIBLIA-003 / RB-0102-BIBLIA-004 | FR-0102-BIBLIA-003                      |
| UC-0102-BIBLIA-004 / RB-0102-BIBLIA-001 | FR-0102-BIBLIA-004, NFR-0102-BIBLIA-005 |
| RB-0102-BIBLIA-005                      | FR-0102-BIBLIA-005, NFR-0102-BIBLIA-004 |
