---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - prd
type: app-prd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `PRD-MISAL-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Problema y oportunidad

- Problema: Los fieles no tienen acceso fácil y gratuito al Misal diario (lecturas del día, oraciones, ordinario de la Misa). Las soluciones existentes son apps pagas, con publicidad, o con contenido desactualizado por falta de mantenimiento editorial.
- Oportunidad: Un Misal gratuito, limpio y conectado al Motor Litúrgico del ecosistema se actualiza automáticamente con el calendario; el contenido gestionado en el CMS garantiza calidad editorial y trazabilidad.

## 3. Objetivo de negocio

Proporcionar a los fieles el acceso diario a las lecturas y oraciones de la Misa con contenido confiable, actualizado automáticamente según el calendario litúrgico, integrado al ecosistema Fósforo (SSO, RUM, notificaciones).

## 4. Segmentos y JTBD

- Segmento principal: Fieles católicos que participan de la Misa y quieren prepararse o repasar las lecturas del día.
- Segmento secundario: Sacerdotes y catequistas que necesitan consulta rápida de lecturas.
- JTBD principal: "Como fiel, quiero ver las lecturas del día en mi celular en menos de 10 segundos, para prepararme antes de la Misa."

## 5. Alcance MVP

| ID            | Requisito de producto                              | Prioridad | Justificación                                |
| ------------- | -------------------------------------------------- | --------- | -------------------------------------------- |
| PRD-MISAL-001 | Página principal con lecturas y oraciones del día  | Must      | Funcionalidad central del Misal              |
| PRD-MISAL-002 | Navegación por fecha (ayer, hoy, mañana, selector) | Must      | Usuarios consultan fechas pasadas o futuras  |
| PRD-MISAL-003 | Ordinario de la Misa (textos fijos) consultable    | Must      | Complemento de las lecturas del día          |
| PRD-MISAL-004 | Lecturas del día con texto completo desde el CMS   | Must      | Contenido central gestionado editorialmente  |
| PRD-MISAL-005 | Color litúrgico y tipo de celebración visible      | Must      | Contexto litúrgico del día                   |
| PRD-MISAL-006 | Modo lectura optimizado (tipografía, modo oscuro)  | Should    | Lectura prolongada en dispositivos móviles   |
| PRD-MISAL-007 | Autenticación para favoritos y preferencias        | Should    | Personalización vía Sistema de Logueo        |
| PRD-MISAL-008 | RUM: pageviews, Web Vitals, eventos de producto    | Must      | Medición de uso y rendimiento desde el día 1 |
| PRD-MISAL-009 | Recordatorio diario de lecturas                    | Could     | Re-engagement vía Notificaciones             |

## 6. No alcance MVP

- Misal completo impreso (todas las misas del año)
- Misas de difuntos, rituales y votivas
- Multi-idioma
- Audio de lecturas
- Modo offline completo
- Editor de contenido (eso es tarea del CMS)

## 7. KPI y criterios de exito

- KPI principal: DAU/MAU de usuarios que consultan lecturas del día (objetivo > 30%).
- KPI secundario 1: LCP < 2.5s (good) en 75% de cargas de la página principal.
- KPI secundario 2: Tasa de embudo `misal.home.viewed` → `misal.lectio.started` > 60%.

## 8. Riesgos de negocio

| Riesgo                                          | Impacto | Mitigación                                                                                  | Owner                    |
| ----------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Motor Litúrgico con celebración incorrecta      | Alto    | Validación de contenido por revisor en CMS; reportes de error en la app                     | Iván Ezequiel Iencinella |
| Contenido de lecturas incompleto en CMS         | Alto    | Flujo editorial del CMS exige revisión antes de publicar; alerta si faltan lecturas del día | Iván Ezequiel Iencinella |
| Baja adopción frente a apps existentes          | Medio   | UX superior, sin publicidad, carga rápida; promoción en portal                              | Iván Ezequiel Iencinella |
| Dependencia de APIs externas (CMS/Motor) caídas | Medio   | Cache SSR + fallback con última versión cacheada; mensajes de degradación                   | Iván Ezequiel Iencinella |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
