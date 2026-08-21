---
tags:
  - proyecto/fosforo
  - desarrollo
  - aplicacion/log
type: app-plan-desarrollo
area: aplicaciones
status: vigente
created: 2026-08-21
updated: 2026-08-21
related:
  - "[[00-README|README Log]]"
  - "[[03-FRD|FRD Log]]"
  - "[[05-Tests Unitarios|Tests Log]]"
  - "[[10-OWASP|OWASP Log]]"
---

# Plan de Desarrollo MVP - 0105_log

Registro de los pasos de desarrollo para completar el MVP de la app Log.
Rama de trabajo: `feat/log-mvp-completacion`.

## Contexto

La implementación existente fue una prueba de concepto funcional. Este plan
cierra las brechas contra la documentación vigente (SRS, FRD, OWASP, Tests)
y agrega la integración final: envío de logs desde las apps del ecosistema.

## Estado real detectado (auditoría 2026-08-21)

- Implementado: ingesta POST con API key + Zod, GET con filtros, detalle,
  dashboard ops, lógica de alertas, auth dev/ops, RLS en migración.
- Pendiente: paginación UI, filtros de fecha UI, estados loading/error,
  rate limiting, fallback mock en producción, métricas eficientes,
  12 de 18 tests, integración de envío en administracion/calendario/horarios.

## Fases

### F0 — Setup

| Paso                                   | Estado |
| -------------------------------------- | ------ |
| Crear rama `feat/log-mvp-completacion` | Hecho  |
| Documentar plan de desarrollo          | Hecho  |

### F1 — Brechas funcionales (FRD/SRS)

| Paso                                             | Referencia     | Estado    |
| ------------------------------------------------ | -------------- | --------- |
| Paginación real en /logs (controles, default 50) | FR-004, RB-007 | Hecho |
| Filtros de fecha since/until en UI               | FR-007         | Hecho    |
| Estados loading/error en listado                 | FRD §5         | Hecho    |
| Extraer AlertBanner como componente              | FR-011         | Hecho    |
| Feedback de error en login                       | SEC-001        | Hecho    |
| Logout revoca sesión en Supabase                 | SEC-001        | Hecho    |

### F2 — Seguridad OWASP

| Paso                                    | Referencia | Estado    |
| --------------------------------------- | ---------- | --------- |
| Rate limiting 100 req/min por key en DB | SEC-006    | Hecho    |
| Fallback mock solo desarrollo           | Riesgo PoC | Hecho    |
| Tracking last_used_at de API keys       | SEC-005    | Hecho    |
| Secure headers CSP/HSTS                 | SEC-009    | Hecho    |

### F3 — Performance

| Paso                                     | Referencia  | Estado    |
| ---------------------------------------- | ----------- | --------- |
| RPC SQL agregada para métricas dashboard | NFR-003/006 | Hecho    |

### F4 — Tests

| Paso                        | Referencia  | Estado    |
| --------------------------- | ----------- | --------- |
| Completar matriz TC-001→018 | 05-Tests §3 | Hecho    |

### F5 — Validación y cierre documental

| Paso                                   | Estado    |
| -------------------------------------- | --------- |
| check-types / test:unit / build        | Hecho     |
| Verificación manual E2E                | Pendiente de entorno con Supabase remoto |
| Actualizar README, OWASP, matriz tests | Hecho     |
| Registro de novedades                  | Hecho     |

### F6 — Envío de logs desde apps del ecosistema

| Paso                                                   | Referencia      | Estado    |
| ------------------------------------------------------ | --------------- | --------- |
| Endurecer @repo/api-utils/log-client (timeout, config) | NFR-OBS-001     | Hecho    |
| Agregar LOGS_API_URL a env                             | IR-0105-LOG-003 | Hecho    |
| Script generador de API keys + migración por app       | SEC-007         | Hecho    |
| Instrumentar administracion, calendario, horarios      | FR-OBS-001      | Hecho    |
| Verificación E2E por app                               | CA-0105-LOG-003 | Pendiente de entorno con DB remota |

## Decisiones tomadas

- Rate limiting en base de datos (Vercel serverless hace impreciso el conteo en memoria).
- Fallback mock restringido a desarrollo; producción devuelve error explícito.
- Una API key por app del ecosistema, generada por script, hash en migración,
  clave cruda solo en variables de entorno.
- Instrumentación inicial limitada a errores (error/fatal) en catch blocks de APIs.
