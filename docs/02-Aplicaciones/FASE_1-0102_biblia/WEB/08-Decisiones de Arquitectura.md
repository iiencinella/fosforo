---
tags:
  - proyecto/fosforo
  - biblia
  - arquitectura
  - decisiones
  - aplicación
type: app-adr
area: aplicaciónes
status: vigente
created: 2026-05-18
updated: 2026-05-25
related:
  - "[[00-README|0102 Biblia]]"
---

# Decisiones de Arquitectura - 0102_biblia

## Contexto

- Plataforma objetivo: WEB
- Alcance de esta decision: definir arquitectura base de la app Biblia para MVP interno, incluyendo lectura, búsqueda, lecturas litúrgicas y almacenamiento en Supabase con restricción de licencia.
- Decisiónes documentadas hasta implementación Fase 1 del MVP (2026-05-25).

## Funcionalidades generales obligatorias

- Lectura por referencia bíblica (libro/capítulo/versículo).
- Búsqueda textual simple sobre la versión activa.
- Lecturas del día según calendario de Rito Romano (Argentina) cargado manualmente.

## Decisiones clave

| ID                  | Decision                                                                                                                                                           | Motivo                                                                                                                                                   | Impacto                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-0102-BIBLIA-001 | Implementar Biblia como app Astro en `src/apps/biblia/` con API endpoints internos.                                                                                | Alinea la app con estándar web del monorepo y facilita SSR/SSG híbrido.                                                                                  | Mantiene consistencia de estructura y despliegue con el ecosistema.                                                                                                         |
| ADR-0102-BIBLIA-002 | Persistir contenido bíblico y litúrgico en Supabase PostgreSQL.                                                                                                    | Permite modelo relacional trazable y escalable para múltiples versiones.                                                                                 | Requiere diseño de índices y proceso de ingestion controlado.                                                                                                               |
| ADR-0102-BIBLIA-003 | Modelar catálogo abierto de versiones con una sola versión habilitada en MVP.                                                                                      | Prepara crecimiento por fases evitando rediseño de esquema.                                                                                              | Simplifica UX inicial y reduce complejidad de validación.                                                                                                                   |
| ADR-0102-BIBLIA-004 | Mantener MVP en entorno interno privado por restricción de licencia LPD.                                                                                           | No existe autorización de distribución pública del contenido actualmente.                                                                                | Release público queda bloqueado hasta resolver licencia o cambiar texto fuente.                                                                                             |
| ADR-0102-BIBLIA-005 | Resolver lectura y búsqueda vía backend server-side (BFF) y no desde cliente directo a DB.                                                                         | Centraliza validaciones, seguridad, límites y observabilidad.                                                                                            | Menor exposición de datos y mejor control de errores operativos.                                                                                                            |
| ADR-0102-BIBLIA-006 | Usar Rito Romano (Argentina) como único calendario litúrgico en MVP e integrar app de calendario en fase posterior.                                                | Permite cerrar alcance inicial sin bloquear evolución del ecosistema.                                                                                    | Minimiza complejidad inicial y deja contrato claro para integración futura.                                                                                                 |
| ADR-0102-BIBLIA-007 | Centralizar consulta del catálogo de versiones en un servicio server-side (`lib/server/bible-versions.ts`) con fallback automático a datos locales.                | Aísla lógica de disponibilidad de Supabase, evita repetir queries directas desde páginas y endpoints, y garantía continuidad operativa ante caída de DB. | Todo consumo de versiones pasa por un único punto con manejo de error y degradación controlada (health endpoint retorna 503 si Supabase no responde).                       |
| ADR-0102-BIBLIA-008 | Proteger el endpoint POST `/api/internal/ingestion/run` con validación de clave compartida vía header (`x-biblia-ingestion-key`) o Bearer token (`Authorization`). | El script local de ingestion se eliminó; el endpoint es la única vía y necesita autenticación para evitar ejecución no autorizada.                       | El endpoint responde 503 si falta configurar `BIBLIA_INTERNAL_INGESTION_KEY`, 401/403 si la credencial no es válida, y 501 si la ejecución automática no está implementada. |
| ADR-0102-BIBLIA-009 | Migrar a Tailwind CSS v4 con plugin `@tailwindcss/vite` y activar `inlineStylesheets: "always"` en el build de Astro.                                              | Tailwind v4 simplifica la configuración y mejora el rendimiento; inlineStylesheets evita bloqueos de render por CSS externo en SSR.                      | Se eliminó `zod` como dependencia directa; el build inline reduce peticiones HTTP y alinea la app con la versión más reciente del ecosistema Tailwind del monorepo.         |
| ADR-0102-BIBLIA-010 | Aplicar scope de tema vía clase `biblia-theme` en el `<body>` del layout de la app en lugar de forkar componentes compartidos de `@repo/ui`.                       | Mantiene consistencia visual con Portal y Calendario sin duplicar lógica de theme ni componentes compartidos.                                            | Cada app del ecosistema puede aplicar su propio scope CSS sin romper el sistema de diseño unificado.                                                                        |

## Alternativas consideradas

- Alternativa A: contenido bíblico en archivos locales versionados. Se descartó por escala, consulta y mantenimiento.
- Alternativa B: habilitar múltiples versiones activas en MVP. Se descartó para reducir complejidad funcional inicial.
- Alternativa C: publicar LPD en entorno público. Se descartó por riesgo legal sin licencia formal.
- Alternativa D: mantener script local `ingest-bible-json.mjs` como vía de ingestion. Se eliminó porque el endpoint HTTP es el contrato estable, y el script duplicaba lógica sin ventaja operativa.
- Alternativa E: consultar Supabase directamente desde cada página/página API sin capa intermedia. Se descartó por violar DRY y carecer de manejo centralizado de errores/fallback.

## Riesgos y mitigaciónes

- Riesgo 1: exposición accidental de contenido restringido.
- Mitigación 1: segmentación interna, controles de acceso y checklist de release.
- Riesgo 2: consultas lentas en búsqueda textual con volumen alto.
- Mitigación 2: índices full-text y validación de performance en dataset real.
- Riesgo 3: endpoint de ingestion expuesto sin autenticación.
- Mitigación 3: validación de `BIBLIA_INTERNAL_INGESTION_KEY` vía header o Bearer antes de cualquier operación; si falta la variable de entorno, el endpoint responde 503 sin ejecutar lógica.
- Riesgo 4: degradación silenciosa si Supabase no responde y el fallback a datos locales oculta el problema.
- Mitigación 4: el health endpoint reporta estado `degraded` y retorna 503 si la consulta al catálogo falla, permitiendo alertas tempranas.
