---
tags:
  - proyecto/fosforo
  - administracion
  - flujos
  - aplicacion
type: app-flujos
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[03-FRD|FRD Administracion]]"
---

# Flujos y Secuencias - 0107_administracion

## Objetivo

Describir como interactua el usuario con las funcionalidades principales del panel de administracion.

## Flujo principal

1. Usuario se autentica en el panel mediante Supabase Auth (cookie de sesion `admin_session`).
2. Sistema redirige al dashboard general con metricas del ecosistema.
3. Usuario navega a modulo Iglesias o Horarios segun necesidad.
4. Usuario realiza operaciones CRUD sobre los datos.
5. Sistema persiste cambios y registra auditoria.
6. Usuario cierra sesion.

## Flujos secundarios

- Flujo A - Creacion de iglesia desde cero: ingreso de datos manual, geocodificacion asistida, asignacion de horarios iniciales.
- Flujo B - Mantenimiento de horarios: consulta de grilla semanal, alta/baja/modificacion de horarios por celebracion, control de vigencia.
- Flujo C - Consulta de dashboard: visualizacion de metricas, filtro por periodo, exportacion visual de datos agregados.

## Secuencias clave

### Secuencia 1 - Creacion de iglesia con horarios

1. Usuario: Ingresa al modulo Iglesias y hace clic en "Nueva iglesia".
2. Sistema: Muestra formulario de creacion con campos: nombre, direccion, ciudad, provincia, pais, coordenadas, telefono, email.
3. Usuario: Completa los datos y hace clic en "Guardar".
4. Sistema: Valida datos, verifica unicidad (nombre + ciudad), persiste en Supabase, muestra notificacion de exito y redirige al detalle de la iglesia.
5. Usuario: En la pestana "Horarios", hace clic en "Agregar horario".
6. Sistema: Muestra formulario de horario: tipo de celebracion, dia de semana, hora, fecha de inicio de vigencia.
7. Usuario: Completa y guarda.
8. Sistema: Valida superposicion, persiste, muestra confirmacion.

### Secuencia 2 - Consulta de dashboard

1. Usuario: Ingresa al panel y aterriza en el dashboard.
2. Sistema: Consulta datos agregados de iglesias activas, horarios registrados, distribucion geografica y actividad reciente.
3. Sistema: Renderiza dashboard con graficos y metricas.
4. Usuario: Aplica filtro por provincia o periodo.
5. Sistema: Actualiza visualizacion con datos filtrados.

### Secuencia 3 - Busqueda y edicion de iglesia

1. Usuario: En modulo Iglesias, escribe nombre de iglesia en el buscador.
2. Sistema: Filtra resultados en tiempo real mientras el usuario escribe.
3. Usuario: Selecciona la iglesia de la lista.
4. Sistema: Muestra detalle completo de la iglesia con pestanas (informacion, horarios, actividad).
5. Usuario: Edita datos y guarda.
6. Sistema: Valida campos, persiste cambios, registra auditoria, muestra confirmacion.
