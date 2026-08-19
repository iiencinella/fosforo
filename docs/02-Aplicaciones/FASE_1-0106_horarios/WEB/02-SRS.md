---
tags:
  - proyecto/fosforo
  - horarios
  - srs
  - aplicación
type: app-srs
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - 0106_horarios

## 1. Ficha

- ID base: `FR-0106-HORARIOS-*`, `NFR-0106-HORARIOS-*`, `IR-0106-HORARIOS-*`, `CA-0106-HORARIOS-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-05-26
- Estado: vigente

## 2. Proposito y alcance tecnico

Definir requisitos verificables para la app web de consulta de celebraciones liturgicas. El MVP cubre busqueda por templo/ciudad/cercania, filtros por tipo y horario, detalle de templo, estado de actualizacion de datos, contenido liturgico complementario y telemetria operativa basica.

## 3. Actores

- Visitante web: busca y consulta horarios de celebraciones.
- Operador de contenido: carga o corrige datos de templos y horarios.
- Sistema de plataforma: persiste catalogo, aplica filtros y registra eventos.

## 4. Requisitos funcionales

| ID                   | Requisito                                                                                                                | Criterio verificable                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| FR-0106-HORARIOS-001 | La app debe permitir buscar celebraciones por nombre de templo y ciudad.                                                 | El usuario ingresa texto y obtiene lista de resultados relevantes con paginacion o carga incremental.             |
| FR-0106-HORARIOS-002 | La app debe permitir filtrar resultados por tipo de celebracion.                                                         | Al seleccionar filtro, los resultados se actualizan y solo muestran tipos compatibles.                            |
| FR-0106-HORARIOS-003 | La app debe permitir filtrar por franja horaria y fecha de celebracion.                                                  | Con filtros aplicados, cada resultado cumple fecha y rango horario solicitado.                                    |
| FR-0106-HORARIOS-004 | La app debe mostrar una ficha de templo con datos minimos para accion (direccion, mapa/enlace y proximas celebraciones). | Al abrir detalle, se visualiza la informacion minima definida y un listado de proximas celebraciones.             |
| FR-0106-HORARIOS-005 | La app debe mostrar estado de actualizacion de horarios por templo.                                                      | Cada ficha/listado incluye indicador visible de estado (actualizado, en revision o sin confirmar).                |
| FR-0106-HORARIOS-006 | La app debe incluir enlaces a santoral y evangelio del dia como contenido complementario.                                | Desde home o cabecera se puede navegar a ambos recorridos sin autenticacion.                                      |
| FR-0106-HORARIOS-007 | La app debe soportar geolocalizacion opcional para priorizar templos cercanos.                                           | Si el usuario autoriza ubicacion, los resultados se ordenan por cercania geodesica y muestran distancia estimada. |
| FR-0106-HORARIOS-008 | La app debe registrar eventos basicos de consulta y resultados.                                                          | Se registra al menos evento de busqueda, filtros usados y resultado vacio/sin vacio por sesion.                   |
| FR-0106-HORARIOS-009 | La app debe contemplar estados `loading`, `empty`, `error` y `success` en vistas principales.                            | Cada pantalla clave muestra estos estados con comportamiento consistente y accesible.                             |

## 5. Requisitos no funcionales

| ID                    | Requisito                  | Objetivo                                                                                               |
| --------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| NFR-0106-HORARIOS-001 | Disponibilidad/Estabilidad | 99.5% mensual de disponibilidad para la experiencia publica web.                                       |
| NFR-0106-HORARIOS-002 | Rendimiento                | Carga inicial menor a 3 segundos y p95 de endpoints de lectura menor a 300 ms en condiciones normales. |
| NFR-0106-HORARIOS-003 | Seguridad                  | Validacion server-side de entradas, proteccion anti abuso y minimizacion de datos sensibles.           |
| NFR-0106-HORARIOS-004 | Accesibilidad              | Objetivo WCAG 2.1 AA en busqueda, listado, filtros y detalle de templo.                                |
| NFR-0106-HORARIOS-005 | Observabilidad             | Logs estructurados y metricas minimas por endpoint y flujo de busqueda.                                |
| NFR-0106-HORARIOS-006 | Mantenibilidad             | Reuso de paquetes compartidos de UI/tokens y separacion clara entre UI, servicios y acceso a datos.    |

## 6. Integraciónes

| ID                   | Integración                                       | Contrato                                                                 | Version |
| -------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ | ------- |
| IR-0106-HORARIOS-001 | Supabase PostgreSQL                               | Tablas de templos, celebraciones y horarios con consultas de lectura web | v1      |
| IR-0106-HORARIOS-002 | Servicios de geocodificacion/ruteo (MVP opcional) | API HTTP para resolver coordenadas o distancias entre punto y templo     | v1      |
| IR-0106-HORARIOS-003 | Vercel                                            | Deploy y ejecucion de endpoints Astro                                    | v1      |
| IR-0106-HORARIOS-004 | Capacidad transversal de observabilidad           | Logs/eventos compatibles con stack de auditoria del ecosistema           | v1      |

## 7. Criterios de aceptación

| ID                   | Criterio                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| CA-0106-HORARIOS-001 | Un visitante puede encontrar celebraciones por texto y aplicar filtros sin autenticarse.                    |
| CA-0106-HORARIOS-002 | Un visitante puede abrir detalle de templo y disponer de informacion suficiente para asistir a celebracion. |
| CA-0106-HORARIOS-003 | La app indica de forma visible el estado de actualizacion de datos del templo consultado.                   |
| CA-0106-HORARIOS-004 | La app mantiene experiencia responsive y accesible en mobile y desktop.                                     |
| CA-0106-HORARIOS-005 | La telemetria operativa permite medir consultas, filtros y casos sin resultados.                            |

## 8. Trazabilidad PRD -> SRS

| PRD                   | SRS                                                               |
| --------------------- | ----------------------------------------------------------------- |
| PRD-0106-HORARIOS-001 | FR-0106-HORARIOS-001, FR-0106-HORARIOS-007                        |
| PRD-0106-HORARIOS-002 | FR-0106-HORARIOS-002, FR-0106-HORARIOS-003                        |
| PRD-0106-HORARIOS-003 | FR-0106-HORARIOS-004                                              |
| PRD-0106-HORARIOS-004 | FR-0106-HORARIOS-005                                              |
| PRD-0106-HORARIOS-005 | FR-0106-HORARIOS-006                                              |
| PRD-0106-HORARIOS-006 | FR-0106-HORARIOS-008, FR-0106-HORARIOS-009, NFR-0106-HORARIOS-005 |
