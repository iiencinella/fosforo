---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - arquitectura
  - decisiones
type: app-arquitectura
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
---

# Decisiones de Arquitectura - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## Contexto

- Plataforma objetivo: WEB
- Alcance: MVP de la app Misal como consumidor de CMS (contenido), Motor Litúrgico (calendario), Sistema de Logueo (auth), Log (RUM + logs) y Notificaciones (recordatorios).

## Funcionalidades generales obligatorias

- Layout responsivo con menú hamburguesa en mobile (estándar del ecosistema).
- Tema claro/oscuro con toggle y persistencia (estándar del ecosistema).
- View Transitions de Astro entre fechas.
- Skeletons durante la carga.
- Accesibilidad base: foco visible, ARIA, navegación por teclado (WCAG 2.2 AA).

## Decisiones clave

| ID            | Decision                                                           | Motivo                                                                       | Impacto                                                      |
| ------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| ADR-MISAL-001 | La app NO implementa cálculo litúrgico; consume el Motor Litúrgico | Fuente única de verdad calendárica; evita duplicación y divergencias         | Dependencia en runtime del Motor con cache 24h               |
| ADR-MISAL-002 | La app NO duplica contenido litúrgico; consume el CMS              | Fuente única de verdad editorial; actualización centralizada                 | Dependencia en runtime del CMS con cache 1h                  |
| ADR-MISAL-003 | Astro SSR con cache por día (edge)                                 | Las lecturas del día son iguales para todos; SSR cacheado es óptimo y barato | Invalidación por webhook al cambiar contenido en CMS         |
| ADR-MISAL-004 | Página principal redirige a fecha actual (no ruta estática)        | Simplifica rutas: `/` = hoy; `/dia/{fecha}` = cualquier fecha                | SEO por ruta de fecha con sitemap generado                   |
| ADR-MISAL-005 | Solo esquema `misal` en Supabase para datos de usuario             | La app no es dueña de contenido ni calendario; solo personalización          | Schema pequeño y RLS simple                                  |
| ADR-MISAL-006 | Modo lectura y tema en localStorage (sin sesión)                   | Preferencias básicas no requieren cuenta; menor fricción                     | Si el usuario quiere sincronizar, se añade post-MVP con Auth |
| ADR-MISAL-007 | SDK `@repo/analytics` integrado desde el día 1                     | Medición de uso y Web Vitals desde el primer despliegue (RUM)                | Consentimiento y DNT gestionados por el SDK                  |
| ADR-MISAL-008 | Fallback de degradación con cache y banner                         | La app debe ser usable aunque CMS/Motor caigan                               | Banner visible; evento en Log para monitoreo                 |

## Alternativas consideradas

- Alternativa A: App con contenido estático generado a mano (sin CMS). Descartado: actualización manual, errores y sin trazabilidad editorial.
- Alternativa B: Cálculo litúrgico en cliente. Descartado: duplica la lógica del Motor y diverge con el tiempo.
- Alternativa C: SPA (React puro). Descartado: SSR es mejor para SEO y LCP del contenido del día.

## Riesgos y mitigaciónes

- Riesgo 1: Motor con celebración incorrecta → runbook de corrección + reportes de usuarios.
- Riesgo 2: CMS sin lecturas del día → alerta preventiva diaria a editores (Notificaciones).
- Riesgo 3: Pico de tráfico en domingos → cache SSR + CDN; el HTML del día es idéntico para todos.
- Riesgo 4: Degradación de Web Vitals → monitoreo continuo RUM + presupuesto en CI.
