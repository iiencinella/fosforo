---
tags:
  - proyecto/fosforo
  - administracion
  - frd
  - aplicacion
type: app-frd
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - 0107_administracion

## 1. Ficha

- ID base: `RB-0107-ADMINISTRACION-*`, `UC-0107-ADMINISTRACION-*`
- Plataforma: WEB
- Owner funcional: Ivan Ezequiel Iencinella
- Fecha: 2026-05-27

## 2. Casos de uso

| ID                         | Caso de uso                   | Flujo principal                                                                                                                                                                                                                              | Excepciones                                                                                                       |
| -------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| UC-0107-ADMINISTRACION-001 | Crear iglesia                 | 1. Admin/Editor accede al modulo Iglesias 2. Hace clic en "Nueva iglesia" 3. Completa formulario (nombre, direccion, ciudad, provincia, pais, coordenadas, contacto) 4. Guarda 5. Sistema valida y persiste 6. Redirige a detalle de iglesia | Nombre duplicado en misma ciudad: alerta y bloqueo de guardado. Campos obligatorios vacios: validacion en cliente |
| UC-0107-ADMINISTRACION-002 | Gestionar horarios de iglesia | 1. Admin/Editor accede al detalle de una iglesia 2. Ve lista de horarios existentes y formulario para agregar nuevo 3. Agrega/edita/elimina horario 4. Guarda cambios                                                                        | Fecha de vigencia vencida: alerta visual. Horario superpuesto con otro existente: validacion y advertencia        |
| UC-0107-ADMINISTRACION-003 | Consultar dashboard           | 1. Usuario autenticado ingresa al panel 2. Ve dashboard con metricas generales 3. Puede filtrar por periodo o modulo 4. Los datos se actualizan automaticamente                                                                              | Sin datos: estados vacios con mensaje informativo. Error de conexion: reintento y notificacion                    |
| UC-0107-ADMINISTRACION-004 | Buscar iglesias               | 1. Usuario autenticado ingresa al modulo Iglesias 2. Escribe en el campo de busqueda 3. Sistema filtra resultados en tiempo real 4. Selecciona una iglesia para ver detalle                                                                  | Sin resultados: mensaje "No se encontraron iglesias" con sugerencia de crear una nueva                            |

## 3. Reglas de negocio

| ID                         | Regla                                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RB-0107-ADMINISTRACION-001 | Una iglesia no puede eliminarse fisicamente; solo puede desactivarse (cambio de estado a inactivo) para mantener integridad referencial con horarios y otras entidades |
| RB-0107-ADMINISTRACION-002 | Un horario debe estar asociado a una iglesia activa y a un tipo de celebracion valido                                                                                  |
| RB-0107-ADMINISTRACION-003 | Solo usuarios con rol admin pueden desactivar iglesias y gestionar operadores                                                                                          |
| RB-0107-ADMINISTRACION-004 | El campo "nombre" + "ciudad" debe ser unico para evitar iglesias duplicadas                                                                                            |

## 4. Validaciones y errores esperados

| Contexto                    | Validacion                                                | Error                                                     |
| --------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Crear iglesia - nombre      | No vacio, max 200 caracteres                              | "El nombre de la iglesia es obligatorio"                  |
| Crear iglesia - coordenadas | Latitud entre -90 y 90, longitud entre -180 y 180         | "Las coordenadas ingresadas no son validas"               |
| Crear iglesia - duplicado   | Busqueda por nombre + ciudad                              | "Ya existe una iglesia con ese nombre en la misma ciudad" |
| Horario - hora              | Formato HH:MM valido                                      | "La hora ingresada no es valida"                          |
| Horario - superposicion     | Validar cruce con horarios existentes de la misma iglesia | "El horario se superpone con otro existente"              |

## 5. Estados funcionales

- Estado `loading`: indicador de carga mientras se procesan datos de iglesias, horarios o dashboard (server-rendered, sin skeleton client-side en MVP).
- Estado `empty`: mensaje amigable "Aun no hay iglesias registradas" con llamado a accion "Crear primera iglesia".
- Estado `error`: notificacion toast con descripcion del error y opcion de reintentar.
- Estado `success`: notificacion toast de confirmacion "Iglesia creada correctamente" o "Horario actualizado".

## 6. Trazabilidad FRD -> SRS

| FRD                        | SRS                        |
| -------------------------- | -------------------------- |
| UC-0107-ADMINISTRACION-001 | FR-0107-ADMINISTRACION-001 |
| UC-0107-ADMINISTRACION-002 | FR-0107-ADMINISTRACION-002 |
| UC-0107-ADMINISTRACION-003 | FR-0107-ADMINISTRACION-003 |
| UC-0107-ADMINISTRACION-004 | FR-0107-ADMINISTRACION-007 |
| RB-0107-ADMINISTRACION-001 | FR-0107-ADMINISTRACION-001 |
| RB-0107-ADMINISTRACION-003 | FR-0107-ADMINISTRACION-004 |
