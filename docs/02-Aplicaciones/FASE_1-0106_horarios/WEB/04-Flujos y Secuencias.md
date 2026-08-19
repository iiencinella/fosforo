---
tags:
  - proyecto/fosforo
  - horarios
  - flujos
  - aplicación
type: app-flujos
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
  - "[[03-FRD|FRD Horarios]]"
---

# Flujos y Secuencias - 0106_horarios

## Objetivo

Describir como interactuan visitantes y sistema para resolver la busqueda de celebraciones liturgicas en la app Horarios.

## Flujo principal

1. Usuario ingresa a la home y visualiza buscador principal.
2. Usuario escribe templo/ciudad o habilita cercania.
3. Sistema devuelve resultados con estado de actualizacion.
4. Usuario aplica filtros de tipo, fecha y franja horaria.
5. Sistema recalcula resultados y muestra coincidencias.
6. Usuario abre detalle de templo y valida proxima celebracion.

## Flujos secundarios

- Flujo A - Sin resultados: el usuario recibe estado vacio con sugerencias para ampliar busqueda o limpiar filtros.
- Flujo B - Geolocalizacion denegada: el sistema vuelve a orden por relevancia textual/ciudad sin bloquear la consulta.
- Flujo C - Datos en revision: el templo se muestra con aviso de actualizacion para reducir riesgo de desinformacion.

## Secuencias clave

### Secuencia 1 - Busqueda y filtros

1. Usuario: ingresa texto de busqueda en home/listado.
2. Sistema: valida query y consulta `GET /api/celebraciones`.
3. Usuario: selecciona filtros de tipo y franja horaria.
4. Sistema: actualiza resultados y persiste filtros en URL.

### Secuencia 2 - Detalle de templo

1. Usuario: hace clic en un resultado del listado.
2. Sistema: solicita `GET /api/templos/{id}` y renderiza ficha.
3. Usuario: revisa direccion, mapa y proximas celebraciones.
4. Sistema: registra evento de consulta de detalle y permite volver al listado con filtros activos.

### Secuencia 3 - Geolocalizacion opcional

1. Usuario: habilita "templos cercanos" en el buscador.
2. Cliente: solicita permiso de ubicacion en navegador.
3. Sistema: recibe coordenadas y recalcula orden por distancia.
4. Usuario: visualiza templos cercanos con distancia estimada.
