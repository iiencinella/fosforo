---
tags:
  - proyecto/fosforo
  - horarios
  - aplicación
type: app-readme
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[../00-README|Indice de aplicaciónes]]"
---

# 0106_horarios

## Metadatos

- Plataforma: WEB
- Estado: vigente
- Owner producto: Iván Ezequiel Iencinella
- Owner tecnico: Iván Ezequiel Iencinella
- QA owner: Iván Ezequiel Iencinella
- Seguridad owner: Iván Ezequiel Iencinella
- Fecha ultima actualización: 2026-05-26

## Descripcion

0106 Horarios es la aplicacion web publica para consultar horarios de Misa y otras celebraciones liturgicas por templo, ciudad, dia y cercania. Es una de las puertas de entrada mas visibles del ecosistema Fosforo porque resuelve una necesidad concreta: saber rapido donde y cuando participar de una celebracion.

La experiencia actual en produccion prioriza uso sin autenticacion, consulta veloz, navegacion simple y contenido pastoral complementario (santoral y evangelio del dia), con foco en utilidad practica para el dia a dia y para personas que estan fuera de su parroquia habitual.

## Validación de la idea

- Existe problema real y recurrente: usuarios no encuentran horarios confiables de forma centralizada.
- La web productiva valida traccion con contenido vivo, comunidad colaboradora y uso continuado.
- El valor de negocio es claro: mayor participacion liturgica al reducir friccion para encontrar celebraciones.

## Arquitectura

- **Frontend:** Astro + React islands selectivas + Tailwind CSS + estilos compartidos de ecosistema.
- **Backend:** Astro API routes para busqueda, filtros, salud y servicios de soporte operativo.
- **Datos:** Supabase PostgreSQL con catalogo de templos, celebraciones, horarios y auditoria.
- **Integración:** Supabase (DB/Auth opcional para backoffice), Vercel deploy, capacidad compartida de logs.

## Estado de implementación

- **Completado:** implementacion funcional completa del MVP:
  - Busqueda de celebraciones por texto, ciudad y filtros (tipo, fecha, franja horaria)
  - Orden por cercania geografica con calculo de distancia (haversine)
  - Detalle de templo con direccion, proximas celebraciones y estado de actualizacion
  - Paginacion con navegacion anterior/siguiente
  - API REST: `GET /api/celebraciones`, `GET /api/templos/[id]`, `GET /api/health`, `POST /api/events/search`
  - Telemetria de busquedas (POST `/api/events/search` con datos minimos no PII)
  - Fallback dataset con 12 templos y 60+ celebraciones para funcionamiento sin Supabase
  - Cliente Supabase con soporte anon + service role
  - Estados UI: loading/empty/error/success
  - Integracion con `@repo/ui` (PortalHeader, EcosystemFooter, SectionIntro, ActionLinkList, InfoPanel)
  - Tema claro/oscuro con persistencia en localStorage
  - View transitions via ClientRouter de Astro
- **En curso:** validacion de cobertura de datos reales, ampliacion de catalogo de templos
- **Pendiente:** tests unitarios automatizados (matriz definida en 05-Tests Unitarios.md)

## Ubicación del codigo

- App: `src/apps/horarios/`
- Componentes: `src/apps/horarios/src/components/`
- Estilos: `src/packages/ui/`, `src/packages/tailwind-config/shared-styles.css`, `src/apps/horarios/src/styles/`
- Contenido: `src/apps/horarios/src/content/` (si aplica para contenido editorial)
- API: `src/apps/horarios/src/pages/api/`

## Alcance MVP

- Buscar celebraciones por templo, ciudad y fecha.
- Filtrar por tipo de celebracion y franja horaria.
- Ver detalle de templo con direccion, geolocalizacion y proximas celebraciones.
- Exponer estados claros de datos actualizados/no actualizados para cada templo.
- Incluir enlaces a santoral y evangelio del dia como recorrido complementario.

## No alcance MVP

- Reserva de intenciones, turnos sacramentales y pagos online.
- Moderacion comunitaria avanzada en tiempo real.
- Motor de recomendaciones personalizadas por usuario autenticado.

## KPI principal

- KPI principal: porcentaje de sesiones que encuentran al menos un horario util en menos de 3 interacciones.
- KPI secundario 1: tasa de consultas exitosas sin error tecnico.
- KPI secundario 2: porcentaje de templos activos con horarios actualizados en ventana objetivo.

## Secuencia documental de la app

| Documento                                                               | Se basa en                                                            | Genera                                                                | Estado  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------- |
| [01-PRD](01-PRD.md)                                                     | Idea                                                                  | [02-SRS](02-SRS.md)                                                   | vigente |
| [02-SRS](02-SRS.md)                                                     | [01-PRD](01-PRD.md)                                                   | [03-FRD](03-FRD.md)                                                   | vigente |
| [03-FRD](03-FRD.md)                                                     | [02-SRS](02-SRS.md)                                                   | [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)               | vigente |
| [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md)                 | [03-FRD](03-FRD.md)                                                   | [05-Tests Unitarios](05-Tests%20Unitarios.md)                         | vigente |
| [06-Esquema de Datos](06-Esquema%20de%20Datos.md) / [07-ERM](07-ERM.md) | [02-SRS](02-SRS.md)                                                   | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | vigente |
| [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md)   | [02-SRS](02-SRS.md) + [03-FRD](03-FRD.md)                             | [09-Especificación Tecnica](09-Especificacion%20Tecnica.md)           | vigente |
| [10-OWASP](10-OWASP.md)                                                 | [08-Decisiones de Arquitectura](08-Decisiones%20de%20Arquitectura.md) | Tecnica                                                               | vigente |
| [11-SLA y SLO](11-SLA%20y%20SLO.md)                                     | [01-PRD](01-PRD.md)                                                   | Tecnica                                                               | vigente |

## Documentos complementarios

| Documento                                                   | Descripcion                                                                           | Estado  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------- |
| [05-Tests Unitarios](05-Tests%20Unitarios.md)               | Estrategia de pruebas para busqueda, filtros, validaciones y contratos API de la app. | vigente |
| [09-Especificación Tecnica](09-Especificacion%20Tecnica.md) | Definicion de stack, modulos, endpoints y estructura de implementacion del workspace. | vigente |

Notas:

- `07-ERM.md` se conserva como documento obligatorio del ecosistema y complementa el tramo de datos/arquitectura con riesgos, runbooks y continuidad operativa.
- El prefijo numerico define el orden de lectura, elaboración y mantenimiento de la documentación de la app.
- La implementacion actual en `src/apps/horarios/` es funcional completa del MVP. Esta documentacion refleja el estado real del codigo a junio 2026.
