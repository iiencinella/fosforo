---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - esquema-datos
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
---

# Esquema de Datos - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Resumen

El Misal es un consumidor de APIs (CMS, Motor Litúrgico) y no es dueño del contenido litúrgico. Solo persiste datos de personalización de usuario en Supabase (esquema `misal`).

## Entidades principales

| Entidad             | Proposito                                  | Campos clave                                                                                                                                                                                 |
| ------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `misal.favorites`   | Lecturas guardadas por usuario autenticado | `id (uuid pk)`, `user_id (fk auth.users)`, `content_ref (text: content_type+slug CMS)`, `fecha (date)`, `created_at`                                                                         |
| `misal.preferences` | Preferencias de lectura por usuario        | `user_id (pk, fk auth.users)`, `modo_lectura (bool)`, `tema (enum light/dark/system)`, `font_size (int)`, `recordatorio_activo (bool)`, `recordatorio_canal (enum push/email)`, `updated_at` |
| `misal.reports`     | Reportes de problema de contenido          | `id (uuid pk)`, `content_ref (text)`, `fecha (date)`, `tipo (enum texto/lectura/oracion)`, `comentario (text)`, `session_hash (varchar 64, anónimo)`, `created_at`                           |

## Relaciónes

- `auth.users` 1:N `misal.favorites`
- `auth.users` 1:1 `misal.preferences`
- `misal.reports` no requiere usuario (anónimo con session hash)

## Reglas de integridad

- RLS: `misal.favorites` y `misal.preferences` accesibles solo por el `user_id` dueño.
- `misal.reports` es insert-only (RLS: insert para cualquiera, select para roles dev/ops).
- `content_ref` referencia contenido del CMS por `content_type:slug` (no FK directa entre proyectos).
- El contenido litúrgico NO se duplica: vive en el CMS y se consume por API con cache.
- Los datos de calendario NO se duplican: vive en el Motor Litúrgico y se consume por API con cache.
