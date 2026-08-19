---
tags:
  - proyecto/fosforo
  - portal
  - srs
  - aplicación
type: app-srs
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - 0101 Portal

## 1. Ficha

- ID base: `FR-0101-PORTAL-*`, `NFR-0101-PORTAL-*`, `IR-0101-PORTAL-*`, `CA-0101-PORTAL-*`
- Plataforma: WEB
- Owner tecnico: Iván Ezequiel Iencinella
- Fecha: 2026-05-08
- Estado: vigente

## 2. Proposito y alcance tecnico

Definir los requisitos verificables del portal web que actúa como punto de entrada al ecosistema Fósforo. El alcance técnico del MVP incluye catálogo de aplicaciónes, novedades manuales en archivos versionados, formularios de contacto/feedback/contribución, persistencia de envíos, observabilidad básica y despliegue web sobre la arquitectura estándar del ecosistema.

## 3. Actores

- Visitante: navega el portal, descubre aplicaciónes, consulta novedades y envía formularios.
- Operador de producto o soporte: revisa envíos, actualiza estados de aplicaciónes y prioriza solicitudes.
- Desarrollador contribuidor: propone correcciones o integraciónes vinculadas al ecosistema.
- Sistema de plataforma: persiste datos, expone APIs y registra telemetría.

## 4. Requisitos funcionales

| ID                 | Requisito                                                                                                                                               | Criterio verificable                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| FR-0101-PORTAL-001 | El portal debe mostrar un listado de aplicaciónes del ecosistema con nombre, resumen, estado y acceso asociado.                                         | Desde la home o sección equivalente se recupera y renderiza un catálogo versionado con al menos esos campos por aplicación. |
| FR-0101-PORTAL-002 | El portal debe permitir distinguir entre apps disponibles, en construcción o planificadas.                                                              | Cada elemento del catálogo muestra un estado visible y consistente con la fuente de datos.                                  |
| FR-0101-PORTAL-003 | El portal debe mostrar novedades o noticias relaciónadas con las aplicaciónes o el ecosistema.                                                          | La sección de novedades renderiza un listado cronológico con título, resumen y referencia asociada.                         |
| FR-0101-PORTAL-004 | El portal debe ofrecer un formulario de contacto para soporte y consultas.                                                                              | Un visitante puede completar campos mínimos, enviar la consulta y recibir confirmación o error controlado.                  |
| FR-0101-PORTAL-005 | El portal debe ofrecer un formulario para ideas, sugerencias y feedback general.                                                                        | El sistema valida, persiste y clasifica el envío como feedback general.                                                     |
| FR-0101-PORTAL-006 | El portal debe ofrecer una sección específica para desarrolladores que explique el flujo de contribución técnica mediante pull requests al repositorio. | La interfaz muestra lineamientos, repositorio objetivo y CTA claro para abrir o preparar un PR.                             |
| FR-0101-PORTAL-007 | El portal debe resolver catálogo y envíos desde una fuente auditable, y las novedades desde archivos versionados del repositorio.                       | El catálogo/envíos se obtienen de contratos definidos y las novedades se renderizan desde archivos manuales del portal.     |
| FR-0101-PORTAL-008 | El portal debe registrar eventos operativos básicos de navegación crítica y creación de envíos.                                                         | La telemetría captura al menos evento de visualización del catálogo y resultado de cada submit.                             |
| FR-0101-PORTAL-009 | El portal debe contemplar estados `loading`, `empty`, `error` y `success` en vistas y formularios.                                                      | Cada pantalla y formulario maneja esos estados con patrón visual consistente y accesible.                                   |

## 5. Requisitos no funcionales

| ID                  | Requisito                  | Objetivo                                                                                               |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| NFR-0101-PORTAL-001 | Disponibilidad/Estabilidad | 99.5% mensual durante MVP para la superficie pública del portal.                                       |
| NFR-0101-PORTAL-002 | Rendimiento                | Carga inicial menor a 3 segundos y p95 de endpoints de lectura menor a 300 ms en condiciones normales. |
| NFR-0101-PORTAL-003 | Seguridad                  | Validación de entradas, protección anti abuso, manejo seguro de secretos y trazabilidad de envíos.     |
| NFR-0101-PORTAL-004 | Accesibilidad              | Cumplimiento objetivo WCAG 2.1 AA en navegación principal, catálogo y formularios.                     |
| NFR-0101-PORTAL-005 | Observabilidad             | Logs estructurados, estado de salud y métricas básicas por endpoint y formulario.                      |
| NFR-0101-PORTAL-006 | Mantenibilidad             | Reutilización de UI compartida y separación entre páginas, componentes y servicios.                    |

## 6. Integraciónes

| ID                 | Integración                              | Contrato                                                                                      | Version |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------- | ------- |
| IR-0101-PORTAL-001 | Archivos versionados del portal          | Catálogo y novedades manuales en `src/content/` o estructura equivalente dentro del workspace | v1      |
| IR-0101-PORTAL-002 | Supabase PostgreSQL                      | Persistencia de envíos y trazabilidad operativa                                               | v1      |
| IR-0101-PORTAL-003 | Vercel                                   | Despliegue web y ejecución de endpoints Astro                                                 | v1      |
| IR-0101-PORTAL-004 | Sistema de observabilidad del ecosistema | Logs y eventos mínimos compatibles con la capacidad transversal de auditoría                  | v1      |

## 7. Criterios de aceptación

| ID                 | Criterio                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| CA-0101-PORTAL-001 | Un visitante puede descubrir el catálogo de aplicaciónes y distinguir su estado sin autenticarse.                           |
| CA-0101-PORTAL-002 | Un visitante puede enviar correctamente una consulta de soporte y recibe feedback inmediato del resultado.                  |
| CA-0101-PORTAL-003 | Un visitante puede enviar feedback general y un desarrollador encuentra un camino diferenciado para contribuir mediante PR. |
| CA-0101-PORTAL-004 | Los datos enviados quedan persistidos y trazables para revisión posterior.                                                  |
| CA-0101-PORTAL-005 | El portal mantiene experiencia responsive, accesible y coherente con el design system compartido.                           |

## 8. Trazabilidad PRD -> SRS

| PRD                 | SRS                                                         |
| ------------------- | ----------------------------------------------------------- |
| PRD-0101-PORTAL-001 | FR-0101-PORTAL-001, FR-0101-PORTAL-002                      |
| PRD-0101-PORTAL-002 | FR-0101-PORTAL-003                                          |
| PRD-0101-PORTAL-003 | FR-0101-PORTAL-004                                          |
| PRD-0101-PORTAL-004 | FR-0101-PORTAL-005                                          |
| PRD-0101-PORTAL-005 | FR-0101-PORTAL-006                                          |
| PRD-0101-PORTAL-006 | FR-0101-PORTAL-007, FR-0101-PORTAL-008, NFR-0101-PORTAL-005 |
