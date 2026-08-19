---
tags:
  - proyecto/fosforo
  - biblia
  - srs
  - aplicación
type: app-srs
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-05-25
related:
  - "[[00-README|0102 Biblia]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - 0102_biblia

## 1. Ficha

- ID base: `FR-0102-BIBLIA-*`, `NFR-0102-BIBLIA-*`, `IR-0102-BIBLIA-*`, `CA-0102-BIBLIA-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-05-18
- Estado: vigente

## 2. Proposito y alcance tecnico

Definir los requisitos verificables de la app web Biblia para un MVP interno privado. El alcance incluye lectura por referencia, búsqueda textual simple, lecturas del día desde calendario litúrgico católico y modelo de datos en Supabase con catálogo abierto de versiones y una versión habilitada. Se excluye autenticación y toda publicación pública del contenido mientras no exista licencia explícita.

## 3. Actores

- Usuario interno: consulta pasajes, busca texto y revisa lecturas del día.
- Operador de contenido: carga o corrige datos bíblicos/litúrgicos en Supabase.
- Sistema de plataforma: resuelve consultas, aplica validación y registra eventos operativos.

## 4. Requisitos funcionales

| ID                 | Requisito                                                                                                            | Criterio verificable                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| FR-0102-BIBLIA-001 | El sistema debe permitir seleccionar versión activa y navegar por libro, capítulo y versículo.                       | Dada una referencia válida, la app devuelve el pasaje correspondiente con estructura ordenada por versículo.         |
| FR-0102-BIBLIA-002 | El sistema debe ofrecer búsqueda textual simple por palabras clave sobre la versión activa.                          | Dada una consulta válida, se devuelven resultados paginados con referencia bíblica y fragmento coincidente.          |
| FR-0102-BIBLIA-003 | El sistema debe mostrar lecturas del día por fecha, rito y tipo de lectura, usando Rito Romano (Argentina) en MVP.   | Dada una fecha con datos cargados, la app muestra al menos evangelio y lecturas asociadas con referencias válidas.   |
| FR-0102-BIBLIA-004 | El sistema debe mantener catálogo de versiones en Supabase con estado de habilitación.                               | La API lista versiones con bandera `is_enabled`; en MVP sólo una aparece habilitada para consulta.                   |
| FR-0102-BIBLIA-005 | El sistema debe ejecutar ingestión y actualización de contenido bíblico y litúrgico sólo para uso interno.           | Los endpoints/superficies públicas de contenido permanecen restringidos a entorno interno mientras no haya licencia. |
| FR-0102-BIBLIA-006 | El sistema debe exponer estados de interfaz `loading`, `empty`, `error` y `success` en lectura, búsqueda y liturgia. | Cada vista maneja estados sin bloqueo del usuario y con mensajes claros de recuperación.                             |

## 5. Requisitos no funcionales

| ID                  | Requisito                       | Objetivo                                                                                   |
| ------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| NFR-0102-BIBLIA-001 | Disponibilidad/Estabilidad      | 99.5% mensual en entorno interno del MVP.                                                  |
| NFR-0102-BIBLIA-002 | Rendimiento                     | p95 de lectura < 300 ms y p95 de búsqueda < 600 ms con dataset MVP.                        |
| NFR-0102-BIBLIA-003 | Seguridad                       | Acceso interno, manejo seguro de secretos, validación de entrada y trazabilidad operativa. |
| NFR-0102-BIBLIA-004 | Cumplimiento legal de contenido | Bloquear exposición pública de texto bíblico sin licencia formal.                          |
| NFR-0102-BIBLIA-005 | Mantenibilidad                  | Diseño de datos preparado para múltiples versiones sin migraciones disruptivas.            |

## 6. Integraciónes

| ID                 | Integración                          | Contrato                                                                     | Version |
| ------------------ | ------------------------------------ | ---------------------------------------------------------------------------- | ------- |
| IR-0102-BIBLIA-001 | Supabase PostgreSQL                  | Tablas de versiones, libros, capítulos, versículos y lecturas litúrgicas     | v1      |
| IR-0102-BIBLIA-002 | Astro API Endpoints                  | Contratos HTTP internos para lectura, búsqueda y liturgia                    | v1      |
| IR-0102-BIBLIA-003 | Vercel                               | Runtime de app web y endpoints                                               | v1      |
| IR-0102-BIBLIA-004 | App de calendario litúrgico (futuro) | Fuente de lecturas del día para reemplazar carga manual en fases posteriores | vNext   |

## 7. Criterios de aceptación

| ID                 | Criterio                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------- |
| CA-0102-BIBLIA-001 | Un usuario interno puede leer un pasaje por referencia completa (versión/libro/capítulo).    |
| CA-0102-BIBLIA-002 | Un usuario interno puede buscar una palabra clave y obtener resultados navegables.           |
| CA-0102-BIBLIA-003 | Un usuario interno puede consultar lecturas del día para una fecha dada.                     |
| CA-0102-BIBLIA-004 | El sistema permite administrar catálogo de versiones con una sola versión habilitada en MVP. |
| CA-0102-BIBLIA-005 | La app permanece en modalidad interna privada mientras no se resuelva licencia de contenido. |

## 8. Trazabilidad PRD -> SRS

| PRD                 | SRS                                     |
| ------------------- | --------------------------------------- |
| PRD-0102-BIBLIA-001 | FR-0102-BIBLIA-001                      |
| PRD-0102-BIBLIA-002 | FR-0102-BIBLIA-002                      |
| PRD-0102-BIBLIA-003 | FR-0102-BIBLIA-003                      |
| PRD-0102-BIBLIA-004 | FR-0102-BIBLIA-004, NFR-0102-BIBLIA-005 |
| PRD-0102-BIBLIA-005 | FR-0102-BIBLIA-005, NFR-0102-BIBLIA-004 |
