---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - arquitectura
  - flujos
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
---

# Flujos y Secuencias - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Objetivo

Describir como interactuan las apps consumidoras y los editores con las funcionalidades principales del Motor Liturgico, incluyendo los flujos de consulta, resolucion de lecturas y gestion de celebraciones excepcionales.

## Flujo principal

1. La app consumidora (Misal, Visita 7 Iglesias, Lectio Divina) necesita la informacion liturgica para una fecha.
2. La app envia `GET /api/liturgia/{fecha}` al Motor.
3. El Motor consulta el cache precalculado en PostgreSQL (`liturgical_celebrations`).
4. Si hay cache hit, el Motor retorna el JSON con ciclo, celebracion, tipo, color y referencias a lecturas (`cms_entry_id`).
5. Si hay cache miss, el Motor recalcula para el ano correspondiente, persiste en PostgreSQL y retorna la respuesta.
6. La app consumidora usa las referencias `cms_entry_id` para obtener los textos de lecturas desde el CMS.

## Flujos secundarios

- **Flujo A (consultar rango mensual):** La app envia `GET /api/liturgia/rango?desde=YYYY-MM-01&hasta=YYYY-MM-30` para obtener todas las celebraciones de un mes en una sola llamada. El Motor valida que el rango no exceda 31 dias y retorna un array de celebraciones.
- **Flujo B (calcular Pascua):** La app envia `GET /api/liturgia/pascua/{año}`. El Motor calcula la fecha de Pascua con el algoritmo de Gauss y retorna Pascua y las fiestas moviles derivadas (Miercoles de Ceniza, Ascension, Pentecostes, Santisima Trinidad, Corpus Christi).
- **Flujo C (gestion de celebracion excepcional):** El editor de calendario accede al panel admin, autentica con Supabase Auth, crea o edita una celebracion excepcional. El Motor recalcula el ano afectado e invalida el cache correspondiente. Las apps consumidoras obtienen la version actualizada en la proxima consulta.

## Secuencias clave

### Secuencia 1 - Resolver fecha liturgica

1. App consumidora: envia `GET /api/liturgia/2026-12-25` con header de autenticacion si es endpoint admin.
2. Motor: valida formato de fecha (ISO 8601) y rango (2000-2100).
3. Motor: consulta `liturgical_celebrations` en PostgreSQL por fecha `2026-12-25`.
4. Motor: encuentra Navidad (solemnidad, blanco, ciclo A) con referencias a lecturas.
5. Motor: registra evento RUM (pageview, latencia) en app Log.
6. Motor: responde 200 con JSON `{ fecha, ciclo, celebracion, tipo, color, lecturas: [{ cms_entry_id, orden }] }`.

### Secuencia 2 - Obtener lecturas del dia (Motor + CMS)

1. App consumidora: obtiene la respuesta del Motor con `lecturas: [{ cms_entry_id: "abc-123", orden: 1 }]`.
2. App consumidora: consulta el CMS con `cms_entry_id` para resolver el texto de cada lectura.
3. CMS: retorna el contenido textual (primera lectura, salmo, segunda lectura, evangelio).
4. App consumidora: combina la metadata del Motor (ciclo, tipo, color) con el contenido del CMS y renderiza.
5. Si el CMS no encuentra el `cms_entry_id`, la app muestra un mensaje de "lectura no disponible" sin fallar.

### Secuencia 3 - Listar celebraciones del mes

1. App consumidora: envia `GET /api/liturgia/rango?desde=2026-03-01&hasta=2026-03-31`.
2. Motor: valida formato de fechas y que el rango no exceda 31 dias.
3. Motor: consulta `liturgical_celebrations` para todas las fechas en el rango.
4. Motor: retorna 200 con array de celebraciones `[{ fecha, ciclo, celebracion, tipo, color }, ...]`.
5. Motor: registra evento RUM con la cantidad de resultados y latencia total.

### Secuencia 4 - Gestion de celebracion excepcional (admin)

1. Editor: accede al panel admin del Motor (autenticacion Supabase Auth, rol `editor`).
2. Editor: selecciona una fecha y crea/edita una celebracion excepcional (nombre, tipo, color, prioridad).
3. Motor: valida que no haya conflicto en la fecha (409 si ya existe con misma prioridad).
4. Motor: persiste la celebracion en `liturgical_celebrations`.
5. Motor: invalida el cache del ano liturgico afectado.
6. Motor: envia notificacion al Sistema de Notificaciones si la solemnidad es destacada.
7. Apps consumidoras: en la proxima consulta, reciben la celebracion actualizada.
