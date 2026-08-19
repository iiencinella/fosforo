---
tags:
  - proyecto/fosforo
  - cancionero
  - arquitectura
  - esquema-datos
  - aplicación
type: doc-app-esquema-datos
area: aplicaciónes
status: vigente
created: 2026-05-28
updated: 2026-05-28
related:
  - "[[00-README|Cancionero App]]"
---

# Esquema de Datos - 0401_cancionero

## Resumen

Esquema de base de datos en Supabase PostgreSQL para el MVP de 0401_cancionero.

## Entidades principales

| Entidad                              | Proposito                                                       | Campos clave                                                                                                                                                                               |
| ------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `canciones`                          | Almacena cada canción con su letra, acordes y metadatos         | id, titulo, letra, acordes (jsonb), pdf_url, youtube_url, observaciones_contribucion, estado, contribuyente_id, moderador_id, fecha_contribucion, fecha_moderacion, created_at, updated_at |
| `etiquetas_cancion`                  | Relación N:N entre canciones y combinaciones tiempo+momento     | id, cancion_id, tiempo_liturgico, momento_misa                                                                                                                                             |
| `tiempos_liturgicos`                 | Catálogo de tiempos litúrgicos con sus momentos de misa válidos | id, nombre, momentos_misa (jsonb)                                                                                                                                                          |
| `auditoria_moderacion`               | Registro de auditoría del flujo de moderación                   | id, cancion_id, usuario_id, accion, etiquetas_originales, etiquetas_finales, created_at                                                                                                    |
| `usuarios` (existente en ecosistema) | Perfiles de usuario con rol para la app                         | id, email, rol (invitado/musico/coordinador/admin)                                                                                                                                         |

## Relaciónes

- `canciones` 1:N `etiquetas_cancion` (una canción puede tener múltiples etiquetas tiempo+momento)
- `tiempos_liturgicos` 1:N `etiquetas_cancion` (un tiempo+momento puede estar en múltiples canciones)
- `canciones` 1:N `auditoria_moderacion` (una canción puede tener múltiples eventos de auditoría)
- `usuarios` 1:N `canciones` (como contribuyente)
- `usuarios` 1:N `canciones` (como moderador)

## Reglas de integridad

- Una canción debe tener al menos una etiqueta tiempo+momento para ser publicada.
- `letra` es texto limpio multilinea. `acordes` es un `jsonb` array de objetos `{linea:int, posicion:int, nombre:string(1-12)}`; la posición se interpreta dentro de la línea correspondiente (0-based, valor igual al largo de la línea permitido para acordes al final).
- La constraint `canciones_acordes_shape_check` valida a nivel DB la forma de cada objeto en `acordes`.
- El estado de una canción solo puede ser: "pendiente", "publicado" o "rechazado".
- Ninguna canción puede eliminarse físicamente; solo cambiar su estado (soft delete mediante estado "rechazado").
- Cada modificación de etiquetas en moderación debe generar un registro en `auditoria_moderacion`.
- Un usuario con rol "invitado" no puede contribuir ni moderar.
- Un usuario con rol "musico" no contribuye canciones ni modera.
- Un usuario con rol "coordinador" puede gestionar grupos y compartir listas.
- Un usuario con rol "admin" puede moderar y publicar.
