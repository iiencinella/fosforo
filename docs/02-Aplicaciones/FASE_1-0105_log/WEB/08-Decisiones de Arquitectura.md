---
tags:
  - proyecto/fosforo
  - arquitectura
  - decisiones
  - aplicacion/log
type: app-arquitectura
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|README Log]]"
  - "[[02-SRS|SRS Log]]"
  - "[[03-FRD|FRD Log]]"
---

# Decisiones de Arquitectura - 0105_log

## Contexto

- Plataforma objetivo: WEB
- Alcance de esta decision: Arquitectura completa de la aplicacion de logs, incluyendo frontend, API, base de datos, autenticacion y despliegue.

## Funcionalidades generales obligatorias

- Layout responsivo con menu hamburguesa en mobile (segun estandar del ecosistema)
- Tema claro/oscuro con toggle y persistencia (segun estandar del ecosistema)
- View Transitions de Astro entre paginas
- Skeletons durante la carga de datos
- Accesibilidad base: foco visible, roles ARIA, etiquetas, navegacion por teclado

## Decisiones clave

| ID               | Decision                                            | Motivo                                                                                                                 | Impacto                                                                  |
| ---------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ADR-0105-LOG-001 | Usar Astro SSR en lugar de static                   | Necesitamos API endpoints y proteccion de rutas por autenticacion                                                      | Cambia output de build a server; requiere adapter (Vercel)               |
| ADR-0105-LOG-002 | Usar Supabase Auth con RLS para control de acceso   | Mismo stack que el resto del ecosistema; RLS garantiza seguridad a nivel DB                                            | Requiere configurar roles en app_metadata                                |
| ADR-0105-LOG-003 | API key (hash) para ingesta en lugar de JWT de apps | Las apps emisoras no tienen usuarios; una API key es mas simple y evita depender del ciclo de vida de sesiones humanas | Requiere tabla api_keys y logica de hashing                              |
| ADR-0105-LOG-004 | Tabla unica log_entries con indices                 | Simplicidad; el volumen esperado no justifica sharding inicial. Particionamiento por mes como mejora futura            | Monitorear crecimiento; planificar particion cuando supere 10M registros |
| ADR-0105-LOG-005 | Zod para validacion de payloads de ingesta          | Tipado compartido entre API y frontend; Same-source validation                                                         | Dependencia adicional, pero ligera y estandar en el ecosistema           |
| ADR-0105-LOG-006 | React islands para tabla, filtros y dashboard       | Interactividad rich (filtros reactivos, graficos) sin perder SSR del layout Astro                                      | Requires @astrojs/react                                                  |
| ADR-0105-LOG-007 | Chart.js liviano para dashboard                     | Simple, maduro, bundle pequeno. Alternativas: Recharts (mas React-native) o Nivo (mas features)                        | Chart.js elegido por bundle size y simplicidad para MVP                  |

## Alternativas consideradas

- **Alternativa A - Tabla separada por app:** Se descarto porque complica el listado unificado y las consultas cross-app.
- **Alternativa B - Logging via webhook externo (Better Stack, Datadog):** Se descarto para MVP por costo y dependencia externa. Se evaluara en futura iteracion.
- **Alternativa C - Modo static Astro con cliente pesado:** Se descarto por los requisitos de autenticacion y proteccion de rutas.

## Riesgos y mitigaciones

- **Riesgo 1 - Crecimiento acelerado de la tabla log_entries:** Mitigacion: indice compuesto por (app, level, timestamp); plan de particionamiento por mes al alcanzar 10M registros; job cron semanal para limpieza de logs > 30 dias.
- **Riesgo 2 - Abuso del endpoint de ingesta (muchos requests):** Mitigacion: rate limiting a nivel de Vercel o middleware de Astro; maximo 100 requests/min por API key.
- **Riesgo 3 - Datos sensibles en metadata de logs:** Mitigacion: documentar que las apps emisoras no deben incluir datos personales en logs; validacion no blocking en API para advertir.
