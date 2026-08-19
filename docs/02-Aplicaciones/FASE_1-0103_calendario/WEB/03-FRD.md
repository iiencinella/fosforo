---
tags:
  - proyecto/fosforo
  - calendario
  - frd
  - aplicación
type: app-frd
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - 0103 Calendario

## 1. Ficha

- ID base: `RB-0103-CALENDARIO-*`, `UC-0103-CALENDARIO-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-05-20

## 2. Casos de uso

| ID                     | Caso de uso                                                | Flujo principal                                                                                                    | Excepciones                                                                               |
| ---------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| UC-0103-CALENDARIO-001 | Consultar la jornada actual.                               | El visitante abre la home y visualiza la celebración principal, tiempo litúrgico, color y referencias del día.     | No existe registro para la fecha actual, falla el servicio o hay inconsistencia de datos. |
| UC-0103-CALENDARIO-002 | Navegar por el calendario mensual.                         | El visitante cambia de mes, recorre la grilla y selecciona un día para ver más detalle.                            | El mes solicitado está fuera del rango disponible o la respuesta llega vacía.             |
| UC-0103-CALENDARIO-003 | Consultar el detalle de una fecha específica.              | El visitante elige una fecha válida y el sistema devuelve la jornada correspondiente con sus referencias.          | La fecha es inválida, no existe registro o la validación rechaza el parámetro.            |
| UC-0103-CALENDARIO-004 | Abrir recursos del ecosistema relacionados con la jornada. | El visitante revisa enlaces sugeridos desde la jornada y navega a la app adecuada para profundizar.                | No hay enlaces configurados para esa jornada o el destino aún no está publicado.          |
| UC-0103-CALENDARIO-005 | Consumir el calendario desde otra app del ecosistema.      | Una app cliente invoca el endpoint de lectura y recibe un payload normalizado sin depender del esquema de la base. | El contrato cambia sin versionado o la app cliente solicita parámetros inválidos.         |

## 3. Reglas de negocio

| ID                     | Regla                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| RB-0103-CALENDARIO-001 | El MVP resuelve únicamente rito romano y región AR; cualquier expansión fuera de ese alcance queda fuera del contrato vigente.              |
| RB-0103-CALENDARIO-002 | `public.liturgy_daily_readings` es la entidad base de la jornada diaria en el MVP y no debe duplicarse con otra tabla paralela equivalente. |
| RB-0103-CALENDARIO-003 | La UI y las apps consumidoras no deben depender directamente del shape SQL; deben consumir DTOs o endpoints del calendario.                 |
| RB-0103-CALENDARIO-004 | Cuando no exista texto completo de lecturas en la experiencia del calendario, se mostrarán referencias y enlaces a superficies adecuadas.   |
| RB-0103-CALENDARIO-005 | La jornada debe presentar al menos una celebración visible o un estado vacío controlado; nunca una pantalla silenciosamente incompleta.     |
| RB-0103-CALENDARIO-006 | Los enlaces a otras apps solo se muestran cuando exista destino válido o estado claramente indicado para evitar falsas promesas.            |

## 4. Validaciónes y errores esperados

| Contexto               | Validación                                                                                 | Error                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Consulta diaria        | `date` debe ser una fecha ISO válida o resolverse al día actual si se omite.               | `CALENDAR_INVALID_DATE` - La fecha solicitada no tiene formato válido.               |
| Consulta mensual       | `year` y `month` deben representar un mes calendario válido.                               | `CALENDAR_INVALID_MONTH` - El mes solicitado no es válido.                           |
| Cobertura de datos     | Debe existir un registro compatible para la fecha consultada dentro del alcance del MVP.   | `CALENDAR_DAY_NOT_FOUND` - No hay jornada cargada para la fecha solicitada.          |
| Links ecosistema       | Solo se deben publicar destinos que existan o cuyo estado esté explícitamente documentado. | `CALENDAR_LINK_UNAVAILABLE` - El recurso relacionado no está disponible actualmente. |
| Respuesta a consumidor | El payload debe salir mapeado al DTO vigente y no filtrar columnas internas irrelevantes.  | `CALENDAR_CONTRACT_ERROR` - No se pudo construir una respuesta compatible.           |

## 5. Estados funcionales

- Estado `loading`: skeleton para hero, grilla mensual y panel de detalle mientras se resuelven servicios.
- Estado `empty`: mensaje claro cuando una fecha o un mes no tienen datos disponibles dentro del rango cargado.
- Estado `error`: mensaje recuperable con opción de reintentar o volver al día actual cuando falle la consulta.
- Estado `success`: jornada o mes renderizados correctamente con foco visible en el día activo y metadata litúrgica disponible.

## 6. Trazabilidad FRD -> SRS

| FRD                                                                      | SRS                                                                    |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| UC-0103-CALENDARIO-001 / RB-0103-CALENDARIO-005                          | FR-0103-CALENDARIO-001, FR-0103-CALENDARIO-008                         |
| UC-0103-CALENDARIO-002 / RB-0103-CALENDARIO-001                          | FR-0103-CALENDARIO-002, FR-0103-CALENDARIO-003, FR-0103-CALENDARIO-009 |
| UC-0103-CALENDARIO-003 / RB-0103-CALENDARIO-004                          | FR-0103-CALENDARIO-002, FR-0103-CALENDARIO-008                         |
| UC-0103-CALENDARIO-004 / RB-0103-CALENDARIO-006                          | FR-0103-CALENDARIO-007                                                 |
| UC-0103-CALENDARIO-005 / RB-0103-CALENDARIO-002 / RB-0103-CALENDARIO-003 | FR-0103-CALENDARIO-004, FR-0103-CALENDARIO-005, FR-0103-CALENDARIO-006 |
