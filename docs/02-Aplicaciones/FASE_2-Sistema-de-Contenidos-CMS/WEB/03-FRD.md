---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - frd
type: app-frd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `RB-CMS-*`, `UC-CMS-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Casos de uso

| ID         | Caso de uso             | Flujo principal                                                                               | Excepciones                                                                              |
| ---------- | ----------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| UC-CMS-001 | Crear content type      | Admin navega a /admin/content-types, define nombre, slug y campos, guarda                     | Validación de slug duplicado; permisos insuficientes                                     |
| UC-CMS-002 | Crear entrada           | Editor selecciona content type, completa campos, guarda como borrador                         | Validación de campos requeridos; content type no existe                                  |
| UC-CMS-003 | Editar entrada          | Editor abre entrada existente, modifica campos, guarda nueva revisión                         | Entrada bloqueada por otro editor; cambios en entrada publicada requieren nueva revisión |
| UC-CMS-004 | Enviar a revisión       | Editor cambia estado de borrador a revisión; notificación al revisor                          | Entrada incompleta; permisos insuficientes                                               |
| UC-CMS-005 | Publicar entrada        | Revisor aprueba entrada en revisión; estado cambia a publicado; webhook disparado             | Revisor rechaza con motivo; entrada vuelve a borrador                                    |
| UC-CMS-006 | Archivar entrada        | Admin cambia estado de publicado a archivado; entrada deja de ser visible via API             | Entrada referenciada por apps; advertencia                                               |
| UC-CMS-007 | Buscar contenido        | Editor escribe término de búsqueda, filtra por taxonomía y content type                       | Sin resultados; estado vacío                                                             |
| UC-CMS-008 | Consumir API de lectura | App consumidora hace `GET /api/content/{type}` con API key; recibe JSON                       | API key inválida; content type no existe; rate limiting                                  |
| UC-CMS-009 | Subir medio             | Editor sube imagen desde panel; se almacena en Supabase Storage; se referencia en campo media | Archivo demasiado grande; formato no soportado                                           |
| UC-CMS-010 | Gestionar taxonomías    | Admin crea taxonomía (ej. "liturgia"), añade términos (ej. "adviento", "cuaresma")            | Término duplicado; slug conflictivo                                                      |

## 3. Reglas de negocio

| ID         | Regla                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| RB-CMS-001 | Toda entrada tiene un content type obligatorio y un slug único por content type.                        |
| RB-CMS-002 | Solo se pueden publicar entradas que hayan pasado por el estado revisión.                               |
| RB-CMS-003 | Al publicar una entrada, la versión publicada anterior pasa a archivada automáticamente.                |
| RB-CMS-004 | Un editor no puede publicar ni archivar; un revisor no puede crear content types ni archivar.           |
| RB-CMS-005 | La API de lectura solo devuelve entradas en estado publicado.                                           |
| RB-CMS-006 | Las entradas archivadas no aparecen en la API ni en el panel por defecto, pero son recuperables.        |
| RB-CMS-007 | Todo cambio de estado (borrador → revisión → publicado → archivado) queda registrado en auditoria.      |
| RB-CMS-008 | Los slugs de content types y términos de taxonomía son inmutables tras la creación.                     |
| RB-CMS-009 | Las imágenes subidas se optimizan a webp con máximo 2MB antes de almacenarse.                           |
| RB-CMS-010 | El cache de la API de lectura se invalida al publicar o archivar una entrada del content type afectado. |

## 4. Validaciónes y errores esperados

| Contexto           | Validación                       | Error                                            |
| ------------------ | -------------------------------- | ------------------------------------------------ |
| Crear content type | Slug único                       | `CMS-001: Slug de content type duplicado`        |
| Crear entrada      | Campos requeridos validados      | `CMS-002: Faltan campos requeridos: {campos}`    |
| Publicar entrada   | Estado previo debe ser revisión  | `CMS-003: La entrada no está en estado revisión` |
| Subir medio        | Formato permitido y tamaño < 2MB | `CMS-004: Formato no soportado o excede 2MB`     |
| API de lectura     | API key válida                   | `CMS-005: API key inválida o no autorizada`      |
| API de lectura     | Rate limiting                    | `CMS-006: Rate limit excedido (100 req/min)`     |
| Buscar contenido   | Término mínimo 3 caracteres      | `CMS-007: Término de búsqueda demasiado corto`   |

## 5. Estados funcionales

- Estado `draft` (borrador): entrada creada, editable por editor, no visible via API.
- Estado `review` (revisión): entrada enviada a revisión, no editable por editor, visible para revisores.
- Estado `published` (publicado): entrada visible via API y en apps consumidoras.
- Estado `archived` (archivado): entrada no visible via API ni en panel por defecto, recuperable.
- Estado `loading`: cargando lista de entradas o formulario de edición.
- Estado `empty`: sin entradas para el content type o sin resultados de búsqueda.
- Estado `error`: error de validación, de API o de permisos.

## 6. Trazabilidad FRD -> SRS

| FRD        | SRS                    |
| ---------- | ---------------------- |
| RB-CMS-001 | FR-CMS-001, FR-CMS-002 |
| RB-CMS-002 | FR-CMS-004             |
| RB-CMS-003 | FR-CMS-002, FR-CMS-004 |
| RB-CMS-004 | FR-CMS-005             |
| RB-CMS-005 | FR-CMS-006             |
| RB-CMS-010 | FR-CMS-007, FR-CMS-010 |
| UC-CMS-001 | FR-CMS-001             |
| UC-CMS-002 | FR-CMS-002             |
| UC-CMS-003 | FR-CMS-002             |
| UC-CMS-004 | FR-CMS-004             |
| UC-CMS-005 | FR-CMS-004, FR-CMS-010 |
| UC-CMS-008 | FR-CMS-006, FR-CMS-007 |
| UC-CMS-009 | FR-CMS-008             |
| UC-CMS-010 | FR-CMS-003             |
