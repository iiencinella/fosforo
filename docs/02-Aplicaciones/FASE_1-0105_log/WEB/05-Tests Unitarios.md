---
tags:
  - proyecto/fosforo
  - tests
  - aplicacion/log
  - rum
  - analiticas
type: app-tests
area: aplicaciones
status: draft
created: 2026-05-26
updated: 2026-09-05
related:
  - "[[00-README|README Log]]"
  - "[[04-Flujos y Secuencias|Flujos Log]]"
---

# Tests Unitarios - 0105_log

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `TC-0105-LOG-*` (logs operativos), `TC-LOG-RUM-*` (RUM y analíticas)
- Owner QA: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Estrategia

- **Framework:** Vitest (configuracion del monorepo)
- **Alcance unitario:** Validacion de payloads, logica de filtros, formateo de datos, transformacion de queries, componentes React puros (sin integracion), SDK RUM (anonimización, sampling, captura de vitals, sendBeacon mock)
- **Alcance de integracion:** API endpoints de ingesta y consulta (con Supabase local), SDK RUM con DOM mock
- **Exclusiones justificadas:** Tests E2E (se cubriran en fase posterior); tests visuales de graficos; tests de rendimiento de red para sendBeacon

## 3. Matriz de pruebas

### Logs operativos (MVP vigente)

| ID              | Requisito trazado | Tipo                                                                 | Estado  |
| --------------- | ----------------- | -------------------------------------------------------------------- | ------- |
| TC-0105-LOG-001 | FR-0105-LOG-001   | Unitario - Validacion de payload valido                              | Hecho   |
| TC-0105-LOG-002 | FR-0105-LOG-002   | Unitario - Payload invalido devuelve 422                             | Hecho   |
| TC-0105-LOG-003 | FR-0105-LOG-002   | Unitario - Campos requeridos (app, level, message)                   | Hecho   |
| TC-0105-LOG-004 | FR-0105-LOG-003   | Unitario - API key invalida devuelve 401                             | Hecho   |
| TC-0105-LOG-005 | FR-0105-LOG-003   | Unitario - Request sin API key devuelve 401                          | Hecho   |
| TC-0105-LOG-006 | FR-0105-LOG-004   | Integration - Listado paginado devuelve 50 items + total             | Hecho   |
| TC-0105-LOG-007 | FR-0105-LOG-005   | Integration - Filtro por nivel devuelve solo ese nivel               | Hecho   |
| TC-0105-LOG-008 | FR-0105-LOG-006   | Integration - Filtro por app devuelve solo esa app                   | Hecho   |
| TC-0105-LOG-009 | FR-0105-LOG-007   | Integration - Filtro por rango de fechas                             | Hecho   |
| TC-0105-LOG-010 | FR-0105-LOG-008   | Integration - Busqueda por texto libre                               | Hecho   |
| TC-0105-LOG-011 | FR-0105-LOG-009   | Unitario - Formateo de metadata JSON para vista detalle              | Hecho   |
| TC-0105-LOG-012 | FR-0105-LOG-010   | Integration - Dashboard devuelve metricas correctas                  | Hecho   |
| TC-0105-LOG-013 | FR-0105-LOG-011   | Unitario - Logica de threshold de alertas                            | Hecho   |
| TC-0105-LOG-014 | FR-0105-LOG-012   | Unitario - Redireccion a login si no autenticado                     | Hecho   |
| TC-0105-LOG-015 | FR-0105-LOG-013   | Unitario - Render de pagina "acceso denegado" para rol no autorizado | Parcial |
| TC-0105-LOG-016 | RB-0105-LOG-001   | Unitario - Validacion de campos obligatorios en payload              | Hecho   |
| TC-0105-LOG-017 | RB-0105-LOG-002   | Unitario - Niveles de severidad validos                              | Hecho   |
| TC-0105-LOG-018 | RB-0105-LOG-007   | Unitario - Paginacion maxima 50 items                                | Hecho   |

### RUM y analíticas (extensión)

| ID             | Requisito trazado | Tipo                                                                                       | Estado    |
| -------------- | ----------------- | ------------------------------------------------------------------------------------------ | --------- |
| TC-LOG-RUM-001 | FR-LOG-RUM-002    | Unitario - Validación de payload RUM (event_name, app, page)                               | Pendiente |
| TC-LOG-RUM-002 | FR-LOG-RUM-002    | Integration - Ingesta de evento RUM devuelve 201                                           | Pendiente |
| TC-LOG-RUM-003 | FR-LOG-RUM-003    | Unitario - Web Vitals captura LCP, INP, CLS con DOM mock                                   | Pendiente |
| TC-LOG-RUM-004 | FR-LOG-RUM-006    | Unitario - Anonimización: SDK no incluye user ID ni IP en payload                          | Pendiente |
| TC-LOG-RUM-005 | FR-LOG-RUM-007    | Unitario - Sampling: evento con sampling 0% no se envía                                    | Pendiente |
| TC-LOG-RUM-006 | FR-LOG-RUM-006    | Unitario - SDK respeta `navigator.doNotTrack` (no envía eventos)                           | Pendiente |
| TC-LOG-RUM-007 | FR-LOG-RUM-006    | Unitario - SDK no envía eventos sin consentimiento                                         | Pendiente |
| TC-LOG-RUM-008 | NFR-LOG-RUM-001   | Unitario - SDK no rompe app anfitriona (try-catch global, falla silenciosa)                | Pendiente |
| TC-LOG-RUM-009 | FR-LOG-RUM-001    | Unitario - SDK usa `sendBeacon` (no `fetch`)                                               | Pendiente |
| TC-LOG-RUM-010 | FR-LOG-RUM-004    | Unitario - Captura de error de frontend con contexto completo                              | Pendiente |
| TC-LOG-RUM-011 | FR-LOG-RUM-005    | Integration - Dashboard de producto muestra embudos y retención                            | Pendiente |
| TC-LOG-RUM-012 | FR-LOG-RUM-R008   | Unitario - Usuario con rol `product` accede a `/dashboard-producto` pero no a `/dashboard` | Pendiente |
| TC-LOG-RUM-013 | NFR-LOG-RUM-002   | Integration - Ingesta RUM no degrada ingesta de logs operativos                            | Pendiente |
| TC-LOG-RUM-014 | NFR-LOG-RUM-003   | Unitario - Payload RUM con PII (email, IP) es rechazado por validación                     | Pendiente |
| TC-LOG-RUM-015 | FR-LOG-RUM-002    | Unitario - Taxonomía común: event_name no whitelisted devuelve 422                         | Pendiente |

## 4. Cobertura objetivo

- **Cobertura global:** >= 80%
- **Modulos criticos:** >= 90% (validacion payload, API endpoints de ingesta, logica de filtros, SDK RUM: anonimización, sampling, captura de vitals, sendBeacon)

## 5. Criterios de aprobacion

### Logs operativos

- [x] Tests unitarios criticos en verde (51 tests en 5 suites: log-data, logs API, authz/middleware, routes, session)
- [x] Cobertura minima alcanzada: 95.5% statements / 90.8% branches / 97.6% functions (umbral 80/70/70 en vitest.config.ts; script pnpm test:coverage). Excluidos con justificacion los wrappers de integracion Supabase (supabase.ts, auth-supabase.ts, log-repository.ts), cubiertos por E2E.
- [x] Trazabilidad FR -> TC actualizada
- [ ] No hay regresiones en tests existentes del monorepo (validado en apps log/calendario; resto sin cambios)

### RUM y analíticas

- [ ] Tests unitarios del SDK RUM en verde (anonimización, sampling, captura vitals, sendBeacon, consentimiento, DNT, try-catch global)
- [ ] Tests de integración de ingesta RUM en verde
- [ ] Cobertura minima alcanzada: >= 80% global, >= 90% módulos críticos
- [ ] Trazabilidad FR-LOG-RUM -> TC-LOG-RUM actualizada
- [ ] Sin regresiones en tests de logs operativos

Notas de implementacion (2026-08-21):

- Los tests de integracion de filtros se implementan sobre la logica pura (`queryLogs`) y el handler de API con repositorio mockeado; la validacion contra Supabase local/remoto queda en verificacion E2E.
- TC-015 cubre el gate server-side (`requireRole` + middleware); el render visual de la pagina de acceso denegado se verifica en E2E.

Notas de implementación RUM (2026-09-05):

- TC-LOG-RUM-003 usa `@happy-dom/jest-dom` o jsdom para mockear `PerformanceObserver` y capturar Web Vitals en tests.
- TC-LOG-RUM-008 verifica que un error en `sendBeacon` (mock para lanzar excepción) no propaga a la app anfitriona.
- TC-LOG-RUM-013 mide latencia de ingesta de logs operativos antes y después de inyectar carga concurrente de ingesta RUM.
