---
tags:
  - proyecto/fosforo
  - portal
  - frd
  - aplicación
type: app-frd
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - 0101 Portal

## 1. Ficha

- ID base: `RB-0101-PORTAL-*`, `UC-0101-PORTAL-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-05-08

## 2. Casos de uso

| ID                 | Caso de uso                                    | Flujo principal                                                                                                       | Excepciones                                                                                   |
| ------------------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| UC-0101-PORTAL-001 | Descubrir aplicaciónes del ecosistema.         | El visitante entra al portal, revisa el catálogo y navega a una app o a su detalle/estado.                            | No hay apps publicadas, falla la lectura o existe una app sin enlace activo.                  |
| UC-0101-PORTAL-002 | Consultar novedades del ecosistema.            | El visitante abre la sección de noticias, revisa novedades y sigue enlaces relaciónados.                              | No hay novedades publicadas o la fuente editorial falla.                                      |
| UC-0101-PORTAL-003 | Enviar una consulta de soporte o contacto.     | El visitante completa el formulario, valida campos y recibe confirmación de envío.                                    | Campos inválidos, abuso detectado o error de persistencia.                                    |
| UC-0101-PORTAL-004 | Enviar feedback o ideas sobre aplicaciónes.    | El visitante selecciona la categoría de feedback, escribe el mensaje y lo envía.                                      | Falta contexto mínimo, envío duplicado o error de backend.                                    |
| UC-0101-PORTAL-005 | Proponer una corrección o integración técnica. | El desarrollador accede a la sección técnica, revisa lineamientos y navega al repositorio para abrir un pull request. | Faltan lineamientos claros, el enlace al repositorio no funciona o no queda claro el proceso. |

## 3. Reglas de negocio

| ID                 | Regla                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| RB-0101-PORTAL-001 | Toda aplicación publicada en el portal debe exhibir un estado explícito y un texto breve que explique disponibilidad o siguiente acción. |
| RB-0101-PORTAL-002 | Una novedad sólo puede publicarse si está asociada al ecosistema o a una aplicación concreta y tiene fecha visible.                      |
| RB-0101-PORTAL-006 | La grilla de novedades sólo debe mostrar posteos cuya `fecha_creación` sea igual o anterior a la fecha local del usuario.                |
| RB-0101-PORTAL-003 | Los formularios públicos deben solicitar únicamente la información mínima necesaria para responder o clasificar el envío.                |
| RB-0101-PORTAL-004 | Las sugerencias técnicas del MVP no se registran por formulario propio: deben canalizarse mediante pull requests al repositorio.         |
| RB-0101-PORTAL-005 | Ningún error de envío debe dejar al usuario sin feedback; siempre debe mostrarse estado de éxito o fallo recuperable.                    |

## 4. Validaciónes y errores esperados

| Contexto                     | Validación                                                                                       | Error                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Catálogo de apps             | Cada app debe incluir `slug`, `name`, `resume`, `category` y `status` en frontmatter versionado. | `PORTAL_APPS_INVALID_DATA` - El catálogo no pudo renderizarse por datos incompletos.  |
| Novedades                    | Sólo se renderizan posteos con `fecha_creación` <= fecha local del dispositivo del visitante.    | `PORTAL_NEWS_NOT_PUBLISHED_YET` - La novedad aún no está publicada para tu fecha.     |
| Formulario de contacto       | `nombre`, `email` o medio de respuesta, `motivo` y `mensaje` son obligatorios.                   | `PORTAL_CONTACT_INVALID_INPUT` - Revisá los campos obligatorios e intentá nuevamente. |
| Feedback general             | `categoria` y `mensaje` deben existir; el mensaje debe superar un mínimo de contenido útil.      | `PORTAL_FEEDBACK_INVALID_INPUT` - Falta contexto para registrar el aporte.            |
| Sección para desarrolladores | Debe exponer repositorio, expectativas mínimas de contribución y referencia al flujo de PR.      | `PORTAL_DEV_GUIDE_UNAVAILABLE` - No se pudo cargar la guía de contribución técnica.   |
| Envíos públicos              | Se valida rate limiting y anti spam antes de persistir.                                          | `PORTAL_RATE_LIMITED` - Esperá unos instantes antes de volver a enviar.               |

## 5. Estados funcionales

- Estado `loading`: skeleton para catálogo, novedades y formularios en procesamiento.
- Estado `empty`: mensaje claro cuando todavía no existen apps publicadas, novedades o resultados para una sección.
- Estado `error`: mensaje de fallo con opción de reintentar o canal alternativo cuando la carga o persistencia no responde.
- Estado `success`: confirmación breve con identificación contextual del tipo de envío realizado.

## 6. Trazabilidad FRD -> SRS

| FRD                                     | SRS                                    |
| --------------------------------------- | -------------------------------------- |
| UC-0101-PORTAL-001 / RB-0101-PORTAL-001 | FR-0101-PORTAL-001, FR-0101-PORTAL-002 |
| UC-0101-PORTAL-002 / RB-0101-PORTAL-002 | FR-0101-PORTAL-003                     |
| UC-0101-PORTAL-003 / RB-0101-PORTAL-003 | FR-0101-PORTAL-004                     |
| UC-0101-PORTAL-004 / RB-0101-PORTAL-004 | FR-0101-PORTAL-005                     |
| UC-0101-PORTAL-005 / RB-0101-PORTAL-005 | FR-0101-PORTAL-006, FR-0101-PORTAL-009 |
