---
tags:
  - proyecto/fosforo
  - portal
  - arquitectura
  - flujos
  - aplicación
type: app-flujos
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-05-08
related:
  - "[[00-README|0101 Portal]]"
---

# Flujos y Secuencias - 0101 Portal

## Objetivo

Describir como interactua el usuario con las funcionalidades principales de la app.

## Flujo principal

1. El visitante ingresa al portal y visualiza hero, catálogo de aplicaciónes, novedades y accesos a contacto/colaboración.
2. El visitante revisa el estado de una o más aplicaciónes y elige navegar a una app disponible o profundizar en su estado.
3. Si necesita soporte o quiere colaborar, selecciona el formulario adecuado, completa el envío y recibe confirmación.

## Flujos secundarios

- Flujo A - Consulta de soporte: el visitante abre el formulario de contacto, completa datos mínimos, envía la consulta y el sistema registra el ticket de entrada.
- Flujo B - Feedback general: el visitante selecciona categoría de sugerencia, envía su propuesta y el sistema la clasifica para priorización.
- Flujo C - Contribución técnica: el desarrollador revisa lineamientos, navega al repositorio y propone la corrección mediante pull request.

## Secuencias clave

### Secuencia 1 - Descubrimiento de aplicaciónes

1. Usuario: abre la home del portal.
2. Sistema: recupera y renderiza catálogo de aplicaciónes y su estado actual.
3. Usuario: selecciona una aplicación o revisa su disponibilidad.
4. Sistema: redirige al destino correspondiente o informa que la app aún no está publicada.

### Secuencia 2 - Envío de consulta o feedback

1. Usuario: elige un formulario del portal y completa los campos requeridos.
2. Sistema: valida datos, controles anti abuso y disponibilidad del endpoint.
3. Usuario: confirma el envío.
4. Sistema: persiste la información, registra telemetría y muestra confirmación o error recuperable.

### Secuencia 3 - Derivación a pull request técnico

1. Usuario: abre la sección para desarrolladores del portal.
2. Sistema: muestra lineamientos de contribución y acceso al repositorio del ecosistema.
3. Usuario: revisa la documentación y prepara la contribución técnica.
4. Sistema: deriva al flujo externo de pull request como canal oficial de aporte.
