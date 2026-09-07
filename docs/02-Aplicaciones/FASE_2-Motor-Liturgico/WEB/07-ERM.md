---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - erm
type: app-erm
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
---

# ERM - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `ERM-MOTOR-LIT-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Registro de riesgos y errores

| ID                | Riesgo/Error                                           | Tipo   | Severidad | Mitigacion                                                                                                            | Owner                    |
| ----------------- | ------------------------------------------------------ | ------ | --------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| ERM-MOTOR-LIT-001 | Calculo incorrecto de Pascua o fiestas moviles         | Riesgo | P1        | Algoritmo de Gauss validado con tests contra fechas conocidas (2000-2100); suite de regresion por cada ano            | Iván Ezequiel Iencinella |
| ERM-MOTOR-LIT-002 | Desincronizacion entre Motor y CMS (referencias rotas) | Riesgo | P2        | Job de verificacion periodica de integridad referencial; alerta si `cms_entry_id` no existe en el CMS                 | Iván Ezequiel Iencinella |
| ERM-MOTOR-LIT-003 | Fecha fuera de rango soportado (2000-2100)             | Error  | P3        | Validacion de rango en API; respuesta 400 con mensaje claro; documentar limite en contrato                            | Iván Ezequiel Iencinella |
| ERM-MOTOR-LIT-004 | Cache stale tras actualizacion de celebracion          | Riesgo | P3        | Invalidacion de cache del ano liturgico afectado tras escritura admin; TTL de cache configurable                      | Iván Ezequiel Iencinella |
| ERM-MOTOR-LIT-005 | Indisponibilidad del CMS al resolver lecturas          | Riesgo | P2        | El Motor no depende del CMS para resolver la metadata (ciclo, tipo, color); las apps consumidoras manejan el fallback | Iván Ezequiel Iencinella |
| ERM-MOTOR-LIT-006 | Inconsistencia entre el ano civil y el ano liturgico   | Riesgo | P3        | El ano liturgico se calcula desde Adviento; documentar la logica en `liturgical_years`                                | Iván Ezequiel Iencinella |

## 3. Runbooks

- P1 (calculo incorrecto de Pascua): `src/apps/motor-liturgico/RUNBOOK-PASCUA.md` (a crear) - Ejecutar suite de tests de regresion de Pascua, verificar algoritmo de Gauss, comparar contra tablas liturgicas oficiales.
- P2 (desincronizacion CMS): `src/apps/motor-liturgico/RUNBOOK-CMS-SYNC.md` (a crear) - Ejecutar job de verificacion de `cms_entry_id`, identificar referencias rotas, coordinar con el equipo del CMS.
- P3 (fuera de rango / cache stale): `src/apps/motor-liturgico/RUNBOOK-OPS.md` (a crear) - Verificar logs de API, revisar TTL de cache, invalidar manualmente si es necesario.

## 4. Continuidad operativa

- **RTO objetivo:** 4 horas (el Motor es un servicio de lectura; puede tolerar degradacion temporal mientras se recupera el cache).
- **RPO objetivo:** 1 hora (las celebraciones se precalculan por ano y se persisten en PostgreSQL; la perdida de datos de cache es recuperable recalculando).
- **Estrategia de rollback:** Revertir despliegue a la version anterior via CI/CD; el calculo liturgico es determinista, por lo que la version anterior produce los mismos resultados para fechas ya calculadas.
- **Backup:** PostgreSQL (Supabase) con backups automaticos diarios; el calculo de cualquier ano es reproducible desde el algoritmo, por lo que la perdida de `liturgical_celebrations` es recuperable recalculando.
