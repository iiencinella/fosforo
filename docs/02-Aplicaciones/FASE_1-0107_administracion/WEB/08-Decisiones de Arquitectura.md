---
tags:
  - proyecto/fosforo
  - administracion
  - arquitectura
  - decisiones
  - aplicacion
type: app-arquitectura
area: aplicaciones
status: vigente
created: 2026-05-27
updated: 2026-06-19
related:
  - "[[00-README|0107 Administracion]]"
  - "[[02-SRS|SRS Administracion]]"
  - "[[03-FRD|FRD Administracion]]"
---

# Decisiones de Arquitectura - 0107_administracion

## Contexto

- Plataforma objetivo: WEB
- Alcance de esta decision: definir la arquitectura base del panel de administracion del ecosistema Fosforo para soportar los modulos de gestion de iglesias, horarios y dashboard de metricas.

## Funcionalidades generales obligatorias

- CRUD de iglesias con validacion de unicidad y datos geograficos
- CRUD de horarios de celebraciones asociados a iglesias
- Dashboard con metricas agregadas del ecosistema
- Autenticacion y autorizacion por roles (admin, editor, viewer)
- Registro de auditoria de operaciones

## Decisiones clave

| ID                          | Decision                                                           | Motivo                                                                                                                                       | Impacto                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-0107-ADMINISTRACION-001 | Usar Astro con islands para el frontend del panel                  | Consistencia con el resto de las apps web del ecosistema; reutilizacion de componentes compartidos de `@repo/ui`                             | Las paginas del panel son mayoritariamente interactivas (CRUD), por lo que se usara poca hidratacion parcial; los formularios seran componentes React                        |
| ADR-0107-ADMINISTRACION-002 | Usar Supabase como backend unico (DB + API + RLS)                  | Misma plataforma de datos que el resto del ecosistema; RLS permite control de acceso a nivel de fila segun rol del usuario                   | Las reglas de RLS deben replicar la logica de roles definida en la app; los datos de iglesias y horarios se comparten con otras apps                                         |
| ADR-0107-ADMINISTRACION-003 | Supabase Auth con sesion via cookie httpOnly personalizada         | Consistencia con el stack Supabase del ecosistema; evita dependencias externas de autenticacion; control directo sobre el manejo de sesiones | La sesion se maneja con cookie `admin_session` (httpOnly, secure en prod) que almacena el token JWT de Supabase; los roles se verifican contra `admin_users` en cada request |
| ADR-0107-ADMINISTRACION-004 | Borrado logico (soft delete) de iglesias mediante cambio de estado | Mantener integridad referencial con horarios y otras entidades que referencian iglesias                                                      | Las queries deben filtrar siempre por `status = 'active'`; las iglesias desactivadas se ocultan del dashboard pero no se eliminan                                            |

## Alternativas consideradas

- Alternativa A: Panel independiente con React puro (sin Astro). Descartado porque rompe la consistencia tecnologica del ecosistema y dificulta la reutilizacion de componentes compartidos.
- Alternativa B: Dashboard embebido en el Portal existente. Descartado porque el panel requiere un modelo de autorizacion propio (roles admin/editor/viewer) y un ciclo de vida independiente.
- Alternativa C: Base de datos separada para el panel. Descartado porque los datos de iglesias y horarios son compartidos con otras apps y deben residir en el mismo esquema.

## Riesgos y mitigaciones

- Riesgo 1: El panel crece en modulos sin una estructura clara, generando deuda tecnica.
  - Mitigacion 1: Organizar el codigo por modulos (iglesias/, horarios/, dashboard/) desde el inicio, con rutas y componentes aislados.
- Riesgo 2: Conflictos de RLS entre el panel y otras apps que acceden a las mismas tablas.
  - Mitigacion 2: Las politicas RLS deben permitir acceso desde cualquier rol autenticado para lectura, y restringir escritura segun rol del panel.
