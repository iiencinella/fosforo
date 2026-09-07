---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - frd
type: app-frd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `RB-MOTOR-LIT-*`, `UC-MOTOR-LIT-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Casos de uso

| ID               | Caso de uso                               | Flujo principal                                                                                             | Excepciones                                                                      |
| ---------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| UC-MOTOR-LIT-001 | Resolver celebracion liturgica por fecha  | App consumidora envia `GET /api/liturgia/{fecha}`; Motor resuelve ciclo, nombre, tipo, color y lecturas     | Fecha fuera de rango (400), fecha invalida (400), cache miss (recalcular o 503)  |
| UC-MOTOR-LIT-002 | Obtener lecturas del dia                  | Motor retorna referencias `cms_entry_id`; app consumidora resuelve textos desde el CMS                      | Referencia rota en CMS (404 del CMS), CMS no disponible (fallback con mensaje)   |
| UC-MOTOR-LIT-003 | Listar celebraciones de un mes            | App envia `GET /api/liturgia/rango?desde=&hasta=`; Motor retorna array de celebraciones en el rango         | Rango mayor a 31 dias (400), fechas fuera de rango soportado (400)               |
| UC-MOTOR-LIT-004 | Calcular Pascua para un año               | App envia `GET /api/liturgia/pascua/{año}`; Motor retorna fecha de Pascua y fiestas moviles derivadas       | Año fuera de rango 2000-2100 (400)                                               |
| UC-MOTOR-LIT-005 | Gestionar celebracion excepcional (admin) | Editor autenticado crea/edita una celebracion excepcional via panel admin; Motor recalcula e invalida cache | Permisos insuficientes (403), conflicto de fecha (409), validacion fallida (400) |

## 3. Reglas de negocio

| ID               | Regla                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| RB-MOTOR-LIT-001 | El calculo liturgico es determinista: la misma fecha produce siempre el mismo resultado (sin variacion entre llamadas)              |
| RB-MOTOR-LIT-002 | Pascua se calcula segun el algoritmo de Gauss para el rito latino                                                                   |
| RB-MOTOR-LIT-003 | Precedencia de celebraciones: solemnidad > fiesta > memoria > feria. Una solemnidad puede desplazar una memoria o feria en su fecha |
| RB-MOTOR-LIT-004 | Las lecturas se referencian al CMS via `cms_entry_id`; el Motor no almacena ni sirve el contenido textual de las lecturas           |
| RB-MOTOR-LIT-005 | El rango de fechas soportado es 2000-2100 inclusive; fechas fuera de rango responden 400                                            |
| RB-MOTOR-LIT-006 | El ciclo liturgico (A/B/C) se asigna segun el ano liturgico: Ciclo A para anos terminados en 1, B en 2, C en 0 (ano civil mod 3)    |
| RB-MOTOR-LIT-007 | El ano liturgico comienza con el Primer Domingo de Adviento y termina con la solemnidad de Cristo Rey del ano siguiente             |
| RB-MOTOR-LIT-008 | Los colores liturgicos validos son: verde, rojo, blanco, morado, rosado y negro (usado solo en misas de difuntos)                   |

## 4. Validaciones y errores esperados

| Contexto                         | Validacion                                                    | Error                                       |
| -------------------------------- | ------------------------------------------------------------- | ------------------------------------------- |
| `GET /api/liturgia/{fecha}`      | Formato de fecha ISO 8601 (YYYY-MM-DD)                        | 400: "Formato de fecha invalido"            |
| `GET /api/liturgia/{fecha}`      | Fecha dentro del rango 2000-2100                              | 400: "Fecha fuera de rango (2000-2100)"     |
| `GET /api/liturgia/rango`        | Rango maximo de 31 dias                                       | 400: "Rango maximo de 31 dias"              |
| `GET /api/liturgia/pascua/{ano}` | Ano dentro de 2000-2100                                       | 400: "Ano fuera de rango (2000-2100)"       |
| Panel admin (POST/PUT)           | Autenticacion y rol de editor                                 | 403: "Permisos insuficientes"               |
| Panel admin (POST/PUT)           | No duplicar celebracion en la misma fecha con misma prioridad | 409: "Conflicto de celebracion en la fecha" |

## 5. Estados funcionales

- Estado `loading`: La app consumidora muestra skeleton mientras espera la respuesta de la API.
- Estado `empty`: No hay celebracion liturgica para la fecha (feria sin memoria asignada) o el rango no retorna resultados. La UI muestra mensaje informativo.
- Estado `error`: Fecha fuera de rango, formato invalido, o error interno del servidor. La API responde 4xx/5xx con JSON de error estructurado.
- Estado `success`: La API responde 200 con JSON estructurado conteniendo ciclo, celebracion, tipo, color y lecturas.

## 6. Trazabilidad FRD -> SRS

| FRD              | SRS                                |
| ---------------- | ---------------------------------- |
| UC-MOTOR-LIT-001 | FR-MOTOR-LIT-001, FR-MOTOR-LIT-004 |
| UC-MOTOR-LIT-002 | FR-MOTOR-LIT-006                   |
| UC-MOTOR-LIT-003 | FR-MOTOR-LIT-004                   |
| UC-MOTOR-LIT-004 | FR-MOTOR-LIT-005                   |
| UC-MOTOR-LIT-005 | FR-MOTOR-LIT-007                   |
| RB-MOTOR-LIT-001 | NFR-MOTOR-LIT-003                  |
| RB-MOTOR-LIT-002 | FR-MOTOR-LIT-005                   |
| RB-MOTOR-LIT-004 | FR-MOTOR-LIT-006                   |
| RB-MOTOR-LIT-005 | NFR-MOTOR-LIT-004                  |
