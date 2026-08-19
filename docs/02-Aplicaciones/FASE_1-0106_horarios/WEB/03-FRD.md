---
tags:
  - proyecto/fosforo
  - horarios
  - frd
  - aplicación
type: app-frd
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - 0106_horarios

## 1. Ficha

- ID base: `RB-0106-HORARIOS-*`, `UC-0106-HORARIOS-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. Casos de uso

| ID                   | Caso de uso                                | Flujo principal                                                                                                                                                                                     | Excepciones                                                                                        |
| -------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| UC-0106-HORARIOS-001 | Buscar celebraciones                       | 1. Usuario ingresa texto (templo/ciudad). 2. Sistema consulta catalogo y horarios vigentes. 3. Sistema devuelve resultados ordenados por relevancia. 4. Usuario abre un resultado para ver detalle. | Sin coincidencias: estado vacio con sugerencias. Error backend: mensaje recuperable y reintento.   |
| UC-0106-HORARIOS-002 | Filtrar por tipo, fecha y franja horaria   | 1. Usuario aplica filtros desde listado. 2. Sistema valida y ejecuta consulta filtrada. 3. Se actualiza el listado con resultados compatibles.                                                      | Filtro invalido: se descarta y se informa. Sin resultados: estado vacio.                           |
| UC-0106-HORARIOS-003 | Priorizar templos cercanos                 | 1. Usuario habilita geolocalizacion opcional. 2. Sistema calcula distancia entre usuario y templos. 3. Resultados se ordenan por cercania.                                                          | Permiso denegado: fallback a orden por relevancia textual/ciudad.                                  |
| UC-0106-HORARIOS-004 | Consultar ficha de templo                  | 1. Usuario abre detalle de templo. 2. Sistema muestra direccion, mapa/enlace, estado de actualizacion y proximas celebraciones. 3. Usuario decide ruta o templo alternativo.                        | Templo no encontrado: 404 amigable. Datos incompletos: vista con placeholders y aviso de revision. |
| UC-0106-HORARIOS-005 | Navegar contenido liturgico complementario | 1. Usuario utiliza accesos a santoral o evangelio del dia. 2. Sistema redirige al recorrido correspondiente sin perder retorno a buscador.                                                          | Contenido temporal no disponible: mensaje de continuidad y opcion de volver al inicio.             |

## 3. Reglas de negocio

| ID                   | Regla                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| RB-0106-HORARIOS-001 | Toda celebracion publicada debe estar asociada a un templo activo.                                         |
| RB-0106-HORARIOS-002 | El horario de celebracion debe estar expresado en zona horaria local del templo.                           |
| RB-0106-HORARIOS-003 | El estado de actualizacion del templo se muestra siempre que exista al menos un horario visible.           |
| RB-0106-HORARIOS-004 | La geolocalizacion es opt-in: nunca se usa sin consentimiento explicito del usuario.                       |
| RB-0106-HORARIOS-005 | Si un templo esta en revision, debe conservarse visible con aviso, salvo que el operador lo marque oculto. |
| RB-0106-HORARIOS-006 | Los filtros se aplican en forma combinada (AND logico) para evitar resultados ambiguos.                    |

## 4. Validaciónes y errores esperados

| Contexto                 | Validación                                                | Error                                                                |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------- |
| GET `/api/celebraciones` | Query `q` debe respetar longitud minima configurada       | 400 Bad Request - "Parametro de busqueda invalido"                   |
| GET `/api/celebraciones` | `tipo` debe pertenecer al catalogo de tipos habilitados   | 422 Unprocessable - "Tipo de celebracion no valido"                  |
| GET `/api/celebraciones` | Rango horario debe ser consistente (`desde` <= `hasta`)   | 422 Unprocessable - "Franja horaria invalida"                        |
| GET `/api/templos/{id}`  | `id` debe existir y corresponder a templo visible         | 404 Not Found - "Templo no encontrado"                               |
| Modo geolocalizacion     | Coordenadas deben estar completas para calcular distancia | 400 Bad Request - "Ubicacion insuficiente para ordenar por cercania" |
| Frontend                 | Estado de red no disponible o timeout                     | UI error state + CTA "Reintentar"                                    |

## 5. Estados funcionales

- Estado `loading`: skeletons de buscador, listado y ficha de templo.
- Estado `empty`: mensaje "No encontramos celebraciones con esos filtros" + accion para limpiar filtros.
- Estado `error`: alerta recuperable con detalle minimo tecnico y boton de reintento.
- Estado `success`: resultados visibles, filtros activos identificables y acciones de navegacion claras.

## 6. Trazabilidad FRD -> SRS

| FRD                  | SRS                                        |
| -------------------- | ------------------------------------------ |
| UC-0106-HORARIOS-001 | FR-0106-HORARIOS-001                       |
| UC-0106-HORARIOS-002 | FR-0106-HORARIOS-002, FR-0106-HORARIOS-003 |
| UC-0106-HORARIOS-003 | FR-0106-HORARIOS-007                       |
| UC-0106-HORARIOS-004 | FR-0106-HORARIOS-004, FR-0106-HORARIOS-005 |
| UC-0106-HORARIOS-005 | FR-0106-HORARIOS-006                       |
| RB-0106-HORARIOS-004 | NFR-0106-HORARIOS-003                      |
