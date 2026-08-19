---
tags:
  - proyecto/fosforo
  - calendario
  - srs
  - aplicación
type: app-srs
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - 0103 Calendario

## 1. Ficha

- ID base: `FR-0103-CALENDARIO-*`, `NFR-0103-CALENDARIO-*`, `IR-0103-CALENDARIO-*`, `CA-0103-CALENDARIO-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-05-20
- Estado: vigente

## 2. Proposito y alcance tecnico

Definir los requisitos verificables del calendario litúrgico web de Fósforo. El alcance técnico del MVP incluye persistencia real en Supabase, reutilización de `public.liturgy_daily_readings` como base de consulta diaria, endpoints Astro para lectura por fecha y mes, y una experiencia pública responsive que permita navegar la jornada actual y el calendario mensual manteniendo consistencia con el design system del ecosistema.

## 3. Actores

- Visitante: consulta la jornada actual, navega por fecha y abre el detalle diario.
- App consumidora del ecosistema: reutiliza contratos del calendario para resolver contexto litúrgico sin consultar tablas directamente.
- Operador técnico: mantiene esquema, políticas y observabilidad del servicio.
- Sistema de plataforma: persiste datos litúrgicos, resuelve lecturas de referencia y registra eventos operativos.

## 4. Requisitos funcionales

| ID                     | Requisito                                                                                                                  | Criterio verificable                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| FR-0103-CALENDARIO-001 | La app debe mostrar la jornada actual con celebración principal, tiempo litúrgico, color y referencias de lecturas.        | La home resuelve la fecha actual y renderiza esos campos desde un contrato de lectura estable.                                   |
| FR-0103-CALENDARIO-002 | La app debe permitir consultar el detalle de una fecha concreta dentro del alcance disponible.                             | Un usuario puede indicar o seleccionar una fecha válida y obtener la jornada correspondiente o un estado vacío controlado.       |
| FR-0103-CALENDARIO-003 | La app debe ofrecer una vista mensual navegable con metadata básica por día.                                               | El sistema devuelve y renderiza un calendario mensual con al menos fecha, celebración resumida y estado seleccionable por celda. |
| FR-0103-CALENDARIO-004 | La app debe exponer contratos de lectura `day` y `month` mediante endpoints Astro.                                         | Existen endpoints documentados y consumibles que devuelven payloads normalizados y no exponen directamente el esquema SQL.       |
| FR-0103-CALENDARIO-005 | El calendario debe reutilizar `public.liturgy_daily_readings` como entidad base del MVP.                                   | Los servicios de lectura consultan esa tabla como fuente principal de la jornada, con expansión controlada si hiciera falta.     |
| FR-0103-CALENDARIO-006 | El frontend no debe consultar la base de datos directamente para resolver la jornada o el mes.                             | Toda lectura de datos del calendario se realiza a través de servicios server-side y endpoints Astro.                             |
| FR-0103-CALENDARIO-007 | La app debe publicar enlaces contextuales hacia superficies del ecosistema relacionadas con la jornada cuando existan.     | El detalle diario puede incluir enlaces configurados o derivados a Biblia, Misal, Oraciones o Santopedia.                        |
| FR-0103-CALENDARIO-008 | La app debe contemplar estados `loading`, `empty`, `error` y `success` en la UI y en las respuestas funcionales esperadas. | Las pantallas y endpoints muestran o devuelven estados consistentes ante éxito, ausencia de datos o error controlado.            |
| FR-0103-CALENDARIO-009 | El MVP debe operar explícitamente con rito romano y región AR.                                                             | Los servicios aplican ese alcance como default del contrato y no intentan resolver calendarios ajenos al dominio acordado.       |

## 5. Requisitos no funcionales

| ID                      | Requisito                  | Objetivo                                                                                                          |
| ----------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| NFR-0103-CALENDARIO-001 | Disponibilidad/Estabilidad | 99.5% mensual para la lectura pública del calendario durante MVP.                                                 |
| NFR-0103-CALENDARIO-002 | Rendimiento                | Latencia p95 menor a 300 ms en endpoints de lectura y carga inicial menor a 3 segundos en las vistas principales. |
| NFR-0103-CALENDARIO-003 | Seguridad                  | Validación estricta de fechas, acceso server-side a Supabase y políticas RLS coherentes con lectura pública.      |
| NFR-0103-CALENDARIO-004 | Accesibilidad              | Objetivo WCAG 2.1 AA en home, navegación mensual y detalle diario.                                                |
| NFR-0103-CALENDARIO-005 | Observabilidad             | Logs estructurados, endpoint de salud y métricas mínimas de consulta diaria y mensual.                            |
| NFR-0103-CALENDARIO-006 | Mantenibilidad             | Separación entre UI, DTOs, validación, mapeo y servicios de acceso a datos.                                       |

## 6. Integraciónes

| ID                     | Integración                          | Contrato                                                                                 | Version |
| ---------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------- | ------- |
| IR-0103-CALENDARIO-001 | Supabase PostgreSQL                  | Lectura principal desde `public.liturgy_daily_readings` y tablas satélite del calendario | v1      |
| IR-0103-CALENDARIO-002 | Tablas bíblicas compartidas          | Referencias compatibles con `public.biblia_versions`, `public.biblia_books` y derivados  | v1      |
| IR-0103-CALENDARIO-003 | Apps consumidoras del ecosistema     | Endpoints Astro `day` y `month` como contratos HTTP de lectura                           | v1      |
| IR-0103-CALENDARIO-004 | `@repo/ui` y `@repo/tailwind-config` | Reutilización de primitives visuales, tokens y estilos compartidos                       | v1      |
| IR-0103-CALENDARIO-005 | Vercel o runtime web equivalente     | Despliegue compatible con Astro endpoints y variables de entorno server-side             | v1      |

## 7. Criterios de aceptación

| ID                     | Criterio                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| CA-0103-CALENDARIO-001 | Un visitante puede abrir la app y entender rapidamente que se celebra hoy sin autenticarse.                                 |
| CA-0103-CALENDARIO-002 | Un visitante puede navegar por mes y abrir una fecha válida sin romper la experiencia ni recibir errores no controlados.    |
| CA-0103-CALENDARIO-003 | Los contratos `day` y `month` pueden ser reutilizados por otras apps del ecosistema sin acceso directo a la base.           |
| CA-0103-CALENDARIO-004 | La app mantiene consistencia visual con el ecosistema y contempla mobile, tema claro/oscuro y estados accesibles.           |
| CA-0103-CALENDARIO-005 | La persistencia real del MVP queda documentada y alineada con el esquema de Supabase y la estrategia de seguridad definida. |

## 8. Trazabilidad PRD -> SRS

| PRD                     | SRS                                                                      |
| ----------------------- | ------------------------------------------------------------------------ |
| PRD-0103-CALENDARIO-001 | FR-0103-CALENDARIO-001                                                   |
| PRD-0103-CALENDARIO-002 | FR-0103-CALENDARIO-002, FR-0103-CALENDARIO-003                           |
| PRD-0103-CALENDARIO-003 | FR-0103-CALENDARIO-005, NFR-0103-CALENDARIO-003                          |
| PRD-0103-CALENDARIO-004 | FR-0103-CALENDARIO-004, FR-0103-CALENDARIO-006                           |
| PRD-0103-CALENDARIO-005 | FR-0103-CALENDARIO-007                                                   |
| PRD-0103-CALENDARIO-006 | FR-0103-CALENDARIO-009                                                   |
| PRD-0103-CALENDARIO-007 | FR-0103-CALENDARIO-008, NFR-0103-CALENDARIO-004, NFR-0103-CALENDARIO-006 |
