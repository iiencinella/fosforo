---
tags:
  - proyecto/fosforo
  - aplicacion
  - cms
  - arquitectura
  - flujos
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Sistema de Contenidos CMS]]"
---

# Flujos y Secuencias - Sistema de Contenidos (CMS)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Objetivo

Describir como interactua el usuario (editor, revisor, administrador) y las apps consumidoras con las funcionalidades principales del CMS.

## Flujo principal - Crear y publicar contenido

1. El editor inicia sesión en el panel del CMS (Supabase Auth).
2. Selecciona un content type existente (ej. "oración") o crea uno nuevo (si es admin).
3. Completa los campos del content type (título, cuerpo markdown, autor, taxonomías, media).
4. Guarda la entrada en estado `draft`.
5. Cuando está listo, cambia el estado a `review`; el sistema notifica al revisor (Sistema de Notificaciones).
6. El revisor abre la entrada, revisa el contenido y:
   - a) Aprueba → estado `published` → se emite webhook → cache invalidado → apps consumidoras reciben contenido.
   - b) Rechaza con motivo → estado vuelve a `draft` → se notifica al editor.
7. El administrador puede archivar entradas publicadas (estado `archived`).

## Flujos secundarios

- Flujo A - Gestionar taxonomías: El admin crea taxonomías (ej. "liturgia", "tema") y términos (ej. "adviento", "cuaresma"). Las entradas se asocian a términos al editar.
- Flujo B - Subir medios: El editor sube una imagen desde el formulario de entrada; el sistema la optimiza a webp (max 2MB), la almacena en Supabase Storage y devuelve una URL referenciable.
- Flujo C - Buscar contenido: El editor escribe un término, filtra por content type y taxonomía; el sistema devuelve entradas coincidentes en título o cuerpo.
- Flujo D - Consumir API: Una app consumidora hace `GET /api/content/oracion?slug=padre-nuestro` con API key; el CMS responde con JSON desde cache o base.

## Secuencias clave

### Secuencia 1 - Publicar entrada

1. Revisor: Abre entrada en estado `review`.
2. Sistema: Muestra contenido completo y diff con versión publicada anterior (si existe).
3. Revisor: Confirma aprobación.
4. Sistema: Cambia estado a `published`, archiva versión anterior si existía, registra en auditoría.
5. Sistema: Emite webhook `cms.entry.published` con payload `{ content_type, slug, timestamp }`.
6. Sistema: Invalida cache del content type afectado.
7. Sistema: Registra evento `cms.entry.published` en RUM (app Log).
8. Apps consumidoras: Reciben webhook o detectan cache miss en próxima petición y actualizan contenido.

### Secuencia 2 - Consumir API de lectura

1. App consumidora: `GET /api/content/oracion?slug=padre-nuestro` con header `Authorization: Bearer {api_key}`.
2. Sistema: Valida API key.
3. Sistema: Verifica cache por `{content_type}:{slug}`.
4. Sistema (cache hit): Devuelve JSON desde cache (p95 < 50ms).
5. Sistema (cache miss): Consulta Supabase con RLS, renderiza markdown, devuelve JSON y cachea (TTL 5 min).
6. App consumidora: Renderiza contenido en su UI.

### Secuencia 3 - Crear content type

1. Admin: Navega a `/admin/content-types`.
2. Sistema: Muestra lista de content types existentes.
3. Admin: Crea nuevo content type con nombre, slug y campos (tipo, requerido, opciones).
4. Sistema: Valida slug único, persista en `content_types`, registra en auditoría.
5. Admin: El content type queda disponible para que los editors creen entradas.
