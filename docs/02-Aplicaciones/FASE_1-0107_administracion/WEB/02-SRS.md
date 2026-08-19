---
tags:
  - proyecto/fosforo
  - administracion
  - srs
  - aplicacion
type: app-srs
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[../../00-General/07-SRS-Maestro|SRS Maestro]]"
---

# SRS - 0107_administracion

## 1. Ficha

- ID base: `FR-0107-ADMINISTRACION-*`, `NFR-0107-ADMINISTRACION-*`, `IR-0107-ADMINISTRACION-*`, `CA-0107-ADMINISTRACION-*`
- Plataforma: WEB
- Owner tecnico: Ivan Ezequiel Iencinella
- Fecha: 2026-05-27
- Estado: draft

## 2. Proposito y alcance tecnico

Sistema web de administracion central para el ecosistema Fosforo. Provee una interfaz segura para que operadores y administradores gestionen datos maestros (iglesias, horarios) y consulten metricas del ecosistema. Se integra con Supabase para persistencia y autenticacion (Supabase Auth + cookies de sesion personalizadas), y consume datos compartidos con otras apps del ecosistema.

## 3. Actores

- Administrador: acceso completo a todos los modulos, puede crear/editar/eliminar registros y gestionar operadores.
- Editor: puede crear y modificar iglesias y horarios, no puede eliminar ni gestionar operadores.
- Viewer: solo lectura del dashboard y datos existentes.

## 4. Requisitos funcionales

| ID                         | Requisito                                                                                                                                                            | Criterio verificable                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| FR-0107-ADMINISTRACION-001 | El sistema debe permitir listar, crear, editar y desactivar iglesias con todos sus datos (nombre, direccion, ciudad, provincia, pais, coordenadas, contacto, estado) | CRUD funcional para iglesias con validacion de campos obligatorios              |
| FR-0107-ADMINISTRACION-002 | El sistema debe permitir asignar horarios de celebraciones a una iglesia, incluyendo tipo, dia de semana, hora y periodo de vigencia                                 | CRUD funcional de horarios asociados a una iglesia                              |
| FR-0107-ADMINISTRACION-003 | El sistema debe mostrar un dashboard con metricas: total de iglesias activas, horarios registrados, actividad reciente y distribucion geografica                     | Dashboard renderiza datos agregados desde la base de datos                      |
| FR-0107-ADMINISTRACION-004 | El sistema debe autenticar usuarios mediante Supabase Auth con sesion via cookie httpOnly y restringir acceso segun rol (admin, editor, viewer)                      | Usuario sin autenticacion redirigido al login; acciones restringidas por rol    |
| FR-0107-ADMINISTRACION-005 | El sistema debe registrar en un log de auditoria las operaciones de creacion, modificacion y desactivacion de registros                                              | Cada operacion CRUD genera un registro con usuario, accion, recurso y timestamp |
| FR-0107-ADMINISTRACION-006 | El sistema debe validar que no existan iglesias duplicadas por nombre y ciudad antes de crear una nueva                                                              | Alerta visual si ya existe una iglesia con el mismo nombre en la misma ciudad   |
| FR-0107-ADMINISTRACION-007 | El sistema debe permitir buscar iglesias por nombre, ciudad o provincia                                                                                              | Resultados de busqueda visibles en menos de 2 segundos                          |

## 5. Requisitos no funcionales

| ID                          | Requisito                  | Objetivo                                                                                      |
| --------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| NFR-0107-ADMINISTRACION-001 | Disponibilidad/Estabilidad | 99.5% uptime en horario diurno (08:00-22:00 ART)                                              |
| NFR-0107-ADMINISTRACION-002 | Rendimiento                | Paginas del panel cargan en menos de 3 segundos en conexion promedio                          |
| NFR-0107-ADMINISTRACION-003 | Seguridad                  | Solo usuarios autenticados con rol admin o editor pueden modificar datos; viewer solo lectura |
| NFR-0107-ADMINISTRACION-004 | Mantenibilidad             | Codigo organizado en modulos por funcionalidad (iglesias, horarios, dashboard)                |
| NFR-0107-ADMINISTRACION-005 | Accesibilidad              | Cumplimiento basico WCAG 2.1 nivel AA en formularios y navegacion del panel                   |

## 6. Integraciones

| ID                         | Integracion                    | Contrato                                          | Version |
| -------------------------- | ------------------------------ | ------------------------------------------------- | ------- |
| IR-0107-ADMINISTRACION-001 | Supabase Auth - Autenticacion  | SDK supabase-js + cookies httpOnly personalizadas | v2      |
| IR-0107-ADMINISTRACION-002 | Supabase - Base de datos y API | API REST / SDK supabase-js                        | v2      |
| IR-0107-ADMINISTRACION-003 | Log - Registro de auditoria    | API interna via fetch                             | v1      |

## 7. Criterios de aceptacion

| ID                         | Criterio                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| CA-0107-ADMINISTRACION-001 | Un administrador puede crear una iglesia, asignarle horarios y verla reflejada en el dashboard |
| CA-0107-ADMINISTRACION-002 | Un editor puede modificar horarios de una iglesia existente pero no eliminar la iglesia        |
| CA-0107-ADMINISTRACION-003 | Un viewer solo puede ver datos sin opciones de edicion                                         |
| CA-0107-ADMINISTRACION-004 | La busqueda de iglesias devuelve resultados relevantes en menos de 2 segundos                  |

## 8. Trazabilidad PRD -> SRS

| PRD                         | SRS                        |
| --------------------------- | -------------------------- |
| PRD-0107-ADMINISTRACION-001 | FR-0107-ADMINISTRACION-001 |
| PRD-0107-ADMINISTRACION-002 | FR-0107-ADMINISTRACION-002 |
| PRD-0107-ADMINISTRACION-003 | FR-0107-ADMINISTRACION-003 |
| PRD-0107-ADMINISTRACION-004 | FR-0107-ADMINISTRACION-004 |
| PRD-0107-ADMINISTRACION-005 | FR-0107-ADMINISTRACION-005 |
