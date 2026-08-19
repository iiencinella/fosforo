---
tags:
  - proyecto/fosforo
  - calendario
  - arquitectura
  - flujos
  - aplicación
type: app-flujos
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-20
related:
  - "[[00-README|0103 Calendario]]"
---

# Flujos y Secuencias - 0103 Calendario

## Objetivo

Describir como interactuan visitantes y consumidores internos con las funcionalidades principales del calendario litúrgico durante el MVP.

## Flujo principal

1. El visitante abre la app y visualiza la jornada actual con celebración principal, tiempo litúrgico, color y referencias de lecturas.
2. El visitante navega la grilla del mes actual o cambia de mes para revisar otras fechas disponibles.
3. El visitante selecciona un día, abre el detalle correspondiente y, si lo desea, navega hacia apps relaciónadas para profundizar la jornada.

## Flujos secundarios

- Flujo A - Consulta por fecha: el visitante abre una fecha concreta y obtiene el detalle diario o un estado vacío controlado si no existe cobertura para ese día.
- Flujo B - Consumo interno del ecosistema: una app cliente llama al endpoint del calendario, recibe un payload normalizado y compone su experiencia sin consultar la base directamente.
- Flujo C - Recuperación ante error: la UI muestra un error recuperable y ofrece reintentar la consulta o volver al día actual.

## Secuencias clave

### Secuencia 1 - Consulta de la jornada actual

1. Usuario: abre la home del calendario.
2. Sistema: resuelve la fecha actual, consulta Supabase por medio del servicio server-side y obtiene la jornada diaria.
3. Usuario: revisa la celebración principal, el color, el tiempo litúrgico y las referencias de lecturas.
4. Sistema: muestra enlaces contextuales a otras apps del ecosistema cuando existan destinos válidos.

### Secuencia 2 - Navegación mensual

1. Usuario: cambia de mes desde la vista principal.
2. Sistema: valida `year` y `month`, consulta el endpoint mensual y construye la grilla con metadata básica por día.
3. Usuario: selecciona una fecha de la grilla.
4. Sistema: actualiza el panel de detalle y resalta el día activo o informa ausencia de datos de manera controlada.

### Secuencia 3 - Consumo desde otra app

1. Usuario o flujo interno: una app del ecosistema necesita resolver el contexto litúrgico de una fecha.
2. Sistema cliente: invoca el endpoint `day` o `month` del calendario.
3. Sistema calendario: valida parámetros, consulta Supabase y mapea la respuesta al DTO vigente.
4. Sistema cliente: compone su interfaz reutilizando el contrato del calendario sin depender del esquema de tablas.
