---
tags:
  - proyecto/fosforo
  - administracion
  - prd
  - aplicacion
type: app-prd
area: aplicaciones
status: draft
created: 2026-05-27
updated: 2026-05-27
related:
  - "[[00-README|0107 Administracion]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - 0107_administracion

## 1. Ficha

- ID base: `PRD-0107-ADMINISTRACION-*`
- Plataforma: WEB
- Owner producto: Ivan Ezequiel Iencinella
- Fecha: 2026-05-27
- Estado: draft

## 2. Problema y oportunidad

- Problema: el ecosistema Fosforo carece de un punto central para gestionar los datos maestros que consumen sus aplicaciones. Actualmente no hay una interfaz unificada para administrar iglesias, horarios, usuarios o contenido, lo que obliga a operar directamente sobre la base de datos o a depender de desarrolladores para tareas administrativas basicas.
- Oportunidad: un panel de administracion central permite que operadores no tecnicos gestionen el contenido critico del ecosistema, reduce la carga del equipo de desarrollo, acelera la actualizacion de datos y mejora la calidad de la informacion que llega a las apps.

## 3. Objetivo de negocio

Construir el panel de administracion central del ecosistema Fosforo que permita a operadores y administradores gestionar los datos maestros (iglesias, horarios, metricas) sin intervencion tecnica, sentando las bases para incorporar progresivamente nuevos modulos de gestion a medida que el ecosistema crece.

## 4. Segmentos y JTBD

- Segmento principal: administradores y operadores del ecosistema que necesitan mantener actualizada la informacion que consumen las aplicaciones.
- Segmento secundario: desarrolladores que necesitan una interfaz para prototipar, probar y depurar datos del ecosistema sin acceso directo a base de datos.
- JTBD principal: "Cuando necesito actualizar los datos del ecosistema, quiero hacerlo desde una interfaz simple sin depender de desarrolladores ni tocar la base de datos".

## 5. Alcance MVP

| ID                          | Requisito de producto                                                                                                                            | Prioridad | Justificacion                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------- |
| PRD-0107-ADMINISTRACION-001 | CRUD completo de iglesias/templos: nombre, direccion, ciudad, provincia, pais, coordenadas, telefono, email, sitio web, estado (activo/inactivo) | Must      | Base del catalogo de iglesias que consumen las apps de Horarios y otras del ecosistema         |
| PRD-0107-ADMINISTRACION-002 | Gestion de horarios de celebraciones por iglesia: tipo de celebracion, dia, hora, periodo de vigencia                                            | Must      | Los horarios son el dato operativo mas critico para los usuarios del ecosistema                |
| PRD-0107-ADMINISTRACION-003 | Dashboard general con metricas: total de iglesias activas, horarios registrados, actividad reciente, distribucion geografica basica              | Should    | Proporciona visibilidad del estado del ecosistema sin ser bloqueante para las operaciones CRUD |
| PRD-0107-ADMINISTRACION-004 | Autenticacion y control de acceso basado en roles (admin, editor, viewer)                                                                        | Must      | El panel maneja datos sensibles del ecosistema; solo personal autorizado debe acceder          |
| PRD-0107-ADMINISTRACION-005 | Registro de auditoria basico (quien creo/modifico cada registro y cuando)                                                                        | Should    | Trazabilidad minima necesaria para operaciones administrativas                                 |

## 6. No alcance MVP

- Gestion avanzada de usuarios y roles (se integrara con Gestion de Usuarios en fases posteriores)
- Gestion de contenido liturgico (calendario, lecturas, celebraciones)
- Automatizacion de notificaciones basadas en cambios de datos
- Reportes avanzados, exportacion a PDF/Excel o graficos complejos
- Panel de administracion mobile
- Integracion con sistemas externos de gestion parroquial

## 7. KPI y criterios de exito

- KPI principal: porcentaje de iglesias del ecosistema con horarios completeados desde el panel en los primeros 30 dias de operacion.
- KPI secundario 1: tiempo medio entre la creacion de una iglesia y la asignacion de su primer horario.
- KPI secundario 2: reduccion de consultas al equipo tecnico para actualizacion de datos de iglesias y horarios.

## 8. Riesgos de negocio

| Riesgo                                                                                      | Impacto | Mitigacion                                                                                 | Owner            |
| ------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ | ---------------- |
| Duplicacion de iglesias por falta de validacion contra el catalogo existente                | Alto    | Busqueda y validacion por nombre, ciudad y direccion antes de crear                        | Producto         |
| Datos incorrectos ingresados por operadores sin formacion tecnica                           | Alto    | Formularios con validacion, campos obligatorios, coordenadas asistidas por geocodificacion | Producto         |
| Baja adopcion del panel si los operadores prefieren metodos actuales (planilla, DB directa) | Medio   | Diseno centrado en tareas frecuentes, feedback inmediato, curva de aprendizaje minima      | Producto         |
| Falta de definicion de alcance por crecimiento paralelo con otras apps                      | Medio   | Revision por fase, backlog priorizado por dependencias de otras apps                       | Producto/Tecnico |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
