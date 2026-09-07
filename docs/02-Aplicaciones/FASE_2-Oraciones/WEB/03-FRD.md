---
tags:
  - proyecto/fosforo
  - aplicacion
  - oraciones
  - web
  - fase-2
  - frd
type: app-frd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS]]"
  - "[[docs/00-General/08-FRD-Maestro|FRD Maestro]]"
---

# Oraciones - Web - FRD

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Casos de uso

| ID          | Caso de uso                               | Flujo principal                                                                                                                                                                      | Excepciones                                                                                                                           |
| ----------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| UC-ORAC-001 | Ver listado de oraciones por categoría    | 1. Usuario entra a home o a `/categoria/[slug]`. 2. La app consulta el CMS por taxonomía. 3. Se renderiza listado (SSR cacheado) con título y extracto.                              | CMS caído → cache + banner; categoría vacía → estado vacío con CTA a búsqueda.                                                        |
| UC-ORAC-002 | Ver ficha de oración                      | 1. Usuario toca una oración. 2. `/oracion/[slug]` renderiza texto completo, intención, fuente y breadcrumbs. 3. Se emite RUM `oracion.viewed`.                                       | Slug inexistente → 404; texto vacío en CMS → estado vacío con CTA de reporte.                                                         |
| UC-ORAC-003 | Buscar oración                            | 1. Usuario escribe >= 2 caracteres. 2. Se ejecuta búsqueda full-text sobre el catálogo del CMS. 3. Se muestran resultados con resaltado; se emite `oracion.searched`.                | < 2 caracteres → no se busca; 0 resultados → sugerencia de categorías populares.                                                      |
| UC-ORAC-004 | Usar modo lectura                         | 1. Usuario alterna tema y/o tamaño de fuente desde la ficha. 2. El cambio se aplica inmediato. 3. Se persiste en `localStorage`.                                                     | Si localStorage falla, la preferencia no persiste y se usa el valor por defecto silenciosamente.                                      |
| UC-ORAC-005 | Marcar favorito                           | 1. Usuario autenticado toca "favorito" en la ficha o listado. 2. Se persiste en `oraciones.favorites` con RLS. 3. UI actualiza el estado optimistamente con rollback en error.       | Sin sesión → CTA "Iniciá sesión"; error de red → rollback + toast de error.                                                           |
| UC-ORAC-006 | Crear y ver colección personal            | 1. Usuario autenticado crea colección con nombre. 2. Agrega oraciones a la colección desde el favorito/ficha. 3. La vista de colección muestra las oraciones con orden.              | Nombre vacío → ORAC-001; colección con 0 oraciones → estado vacío con CTA; acceso desde otra cuenta → RLS impone que sea inaccesible. |
| UC-ORAC-007 | Reportar error de contenido               | 1. Desde la ficha, usuario abre "Reportar problema". 2. Elige motivo y escribe comentario opcional. 3. Se inserta fila en `oraciones.reports` (insert-only, `session_hash` anónimo). | Comentario omitido válido; falla de persistencia → mensaje de error con reintento.                                                    |
| UC-ORAC-008 | Consentimiento y recordatorio de devoción | 1. Usuario autenticado activa recordatorio eligiendo tipo de devoción + hora. 2. Se guarda en `oraciones.preferences`. 3. El Sistema de Notificaciones programa el envío.            | Sin sesión → CTA; hora inválida → ORAC-004; desactivar recordatorio borra la preferencia.                                             |

## Reglas de negocio

| ID          | Regla                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RB-ORAC-001 | El contenido oracional proviene SIEMPRE del CMS: prohibido hardcodear oraciones en la app o guardarlas en BD propia.                                                    |
| RB-ORAC-002 | Favoritos, colecciones y preferencias solo para usuarios con sesión y solo sobre filas propias; aplicadas por RLS (`user_id` = `auth.uid()`), nunca solo en el cliente. |
| RB-ORAC-003 | El buscador requiere >= 2 caracteres; con menos, no se ejecuta consulta y se muestra hint.                                                                              |
| RB-ORAC-004 | El modo lectura (tema, tamaño de fuente) se persiste en `localStorage`; el servidor nunca lo conoce.                                                                    |
| RB-ORAC-005 | SEO: cada ficha de oración incluye JSON-LD (`schema.org/Article`) con título, texto y breadcrumb list.                                                                  |
| RB-ORAC-006 | Los reportes son anónimos e insert-only: se guarda hash de sesión, nunca email ni user_id.                                                                              |
| RB-ORAC-007 | Cada vista define explicitamente estados de carga, error, vacío y éxito.                                                                                                |

## Validaciones y errores

| Código   | Validación                                                                         | Mensaje al usuario                                     |
| -------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ |
| ORAC-001 | Nombre de colección obligatorio, 1-50 caracteres                                   | "Poné un nombre a tu colección (hasta 50 caracteres)." |
| ORAC-002 | Búsqueda requiere >= 2 caracteres                                                  | "Escribí al menos 2 letras para buscar."               |
| ORAC-003 | `content_ref` debe existir en el catálogo del CMS al agregar a favoritos/colección | "Esta oración ya no está disponible."                  |
| ORAC-004 | Hora de recordatorio válida (HH:MM, 00:00-23:59)                                   | "Elegí una hora válida."                               |
| ORAC-005 | Motivo de reporte requerido del select                                             | "Elegí el motivo del reporte."                         |

## Matriz de trazabilidad FRD → SRS

| Caso de uso FRD | Requisito SRS                         |
| --------------- | ------------------------------------- |
| UC-ORAC-001     | FR-ORAC-001, FR-ORAC-010              |
| UC-ORAC-002     | FR-ORAC-002, FR-ORAC-007, FR-ORAC-010 |
| UC-ORAC-003     | FR-ORAC-003, FR-ORAC-007              |
| UC-ORAC-004     | FR-ORAC-004                           |
| UC-ORAC-005     | FR-ORAC-005                           |
| UC-ORAC-006     | FR-ORAC-006                           |
| UC-ORAC-007     | FR-ORAC-008                           |
| UC-ORAC-008     | FR-ORAC-009                           |
