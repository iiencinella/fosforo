---
tags:
  - proyecto/fosforo
  - horarios
  - arquitectura
  - decisiones
  - aplicación
type: app-arquitectura
area: aplicaciónes
status: vigente
created: 2026-05-26
updated: 2026-06-19
related:
  - "[[00-README|0106 Horarios]]"
  - "[[02-SRS|SRS Horarios]]"
  - "[[03-FRD|FRD Horarios]]"
---

# Decisiones de Arquitectura - 0106_horarios

## Contexto

- Plataforma objetivo: WEB
- Alcance de esta decision: arquitectura de app publica de consulta de celebraciones, incluyendo frontend, APIs, persistencia y observabilidad basica.

## Funcionalidades generales obligatorias

- Layout responsive con menu hamburguesa obligatorio en mobile segun estandar del ecosistema.
- Estados loading/empty/error/success consistentes con primitives compartidas de UI.
- Integracion con tema claro/oscuro via tokens compartidos del monorepo.
- Accesibilidad base en formularios/filtros/navegacion por teclado.

## Decisiones clave

| ID                    | Decision                                                             | Motivo                                                                                   | Impacto                                                               |
| --------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| ADR-0106-HORARIOS-001 | Usar Astro SSR con endpoints internos para busqueda y detalle        | Necesitamos filtros dinamicos y lectura de datos en tiempo real sin SPA completa.        | Requiere adapter server en deploy y capa de servicios para consultas. |
| ADR-0106-HORARIOS-002 | Persistir dominio en Supabase PostgreSQL                             | Alinea con stack transversal del ecosistema y simplifica integracion con otras apps.     | Exige modelado y politicas de seguridad de lectura/escritura.         |
| ADR-0106-HORARIOS-003 | Implementar geolocalizacion como capacidad opcional y no bloqueante  | Respeta privacidad y evita friccion para usuarios que no comparten ubicacion.            | Debe existir fallback robusto a busqueda textual.                     |
| ADR-0106-HORARIOS-004 | Reutilizar `@repo/ui` y tokens compartidos para shell y estados      | Evita divergencia visual y acelera implementacion consistente entre apps del ecosistema. | Limita estilos ad hoc y exige adaptar componentes al design system.   |
| ADR-0106-HORARIOS-005 | Incorporar indicador explicito de estado de actualizacion por templo | La calidad percibida depende de transparencia sobre vigencia de horarios.                | Añade metadato operativo y reglas de negocio adicionales.             |
| ADR-0106-HORARIOS-006 | Registrar eventos de consulta con minimizacion de datos              | Necesitamos medir uso sin comprometer privacidad ni complejidad de cumplimiento.         | Define esquema de telemetria acotado y retencion limitada.            |

## Alternativas consideradas

- Alternativa A - SSG puro con dataset estatico: descartada por necesidad de filtros dinamicos y estado de actualizacion cambiante.
- Alternativa B - SPA completa React + API separada: descartada para MVP por mayor complejidad operativa sin beneficio inmediato.
- Alternativa C - Geolocalizacion obligatoria: descartada por impacto en privacidad y conversion inicial.

## Riesgos y mitigaciónes

- Riesgo 1: crecimiento de consultas en fechas liturgicas criticas.
- Mitigación 1: cache de endpoints de lectura y tuning de indices SQL.
- Riesgo 2: deuda tecnica por divergencia entre sitio productivo actual y nueva app del monorepo.
- Mitigación 2: paridad funcional MVP primero y migracion incremental por modulos.
- Riesgo 3: inconsistencias en datos cargados manualmente.
- Mitigación 3: pipeline de validacion operativa y estado visible de revision por templo.
