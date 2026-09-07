---
tags:
  - proyecto/fosforo
  - santopedia
  - sla
  - slo
  - web
type: app-sla-slo
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[01-PRD|01-PRD]]"
  - "[[07-ERM|07-ERM]]"
  - "[[10-OWASP|10-OWASP]]"
---

# Santopedia — SLA y SLO

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Marco

SLO medidos mensualmente sobre ventanas de 30 días con datos RUM (cuando existe) y monitoreo sintético. Error budget calculado sobre el SLO de disponibilidad.

## 2. SLOs

| ID            | SLO                                | Objetivo            | Medición                                                                            | Origen                     |
| ------------- | ---------------------------------- | ------------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| SLO-SANTO-001 | Disponibilidad de lectura          | >= 99.5%            | % de requests a fichas/listados con respuesta HTTP valida (200/301/404 intencional) | Monitoreo sintético + logs |
| SLO-SANTO-002 | Performance de carga (LCP)         | LCP p75 < 2.5s      | Core Web Vitals por página (ficha como prioritaria)                                 | RUM                        |
| SLO-SANTO-003 | Latencia de respuesta del servidor | TTFB p95 < 800ms    | TTFB de `/santo/[slug]` y `/santos` (con cache)                                     | Logs + RUM                 |
| SLO-SANTO-004 | Tasa de error del servicio         | < 0.1%              | % de 5xx sobre requests totales a páginas y endpoints                               | Logs                       |
| SLO-SANTO-005 | Éxito de búsqueda                  | > 70%               | `santo.searched {exito:true} / santo.searched total`                                | RUM                        |
| SLO-SANTO-006 | Corrección de contenido reportado  | < 48h (p95)         | Tiempo reporte → corrección visible (propagada via invalidación de cache)           | Cola editorial CMS         |
| SLO-SANTO-007 | Privacidad RUM                     | Eventos con PII = 0 | Auditoría automática de payload contra allowlist                                    | Pipeline CI                |

### 2.1 Detalle por SLO

- **SLO-SANTO-001:** una respuesta degradada desde cache (con banner) cuenta como disponible; un 503 sin cache no. Ventana de exclusión: mantenimientos comunicados.
- **SLO-SANTO-002:** se mide en usuarios reales (p75, no media); páginas: ficha, listado, santo del día. Degradaciones por red del usuario se reportan separadas.
- **SLO-SANTO-003:** medido server-side por request-id; excluye llamadas del cliente a terceros.
- **SLO-SANTO-005:** definición de éxito (FRD UC-SANTO-002): la sesión con búsqueda abre al menos una ficha derivada de esa búsqueda dentro de un plazo razonable (misma sesión). Los términos < 2 caracteres bloqueados no cuentan como búsquedas fallidas.
- **SLO-SANTO-006:** dueño: equipo editorial del CMS; Santopedia verifica la propagación (invalidación de cache).
- **SLO-SANTO-007:** objetivo binario: cualquier evento con campo fuera del allowlist es un incidente (ERM-SANTO-005).

## 3. Error budget

- Disponibilidad objetivo 99.5% mensual ⇒ presupuesto de indisponibilidad: **3.6h/mes** (0.5% de 720h ≈ 216 minutos).
- Política de gasto:
  - **Consumo < 50%** (normal): ritmo habitual de cambios.
  - **Consumo 50-80%:** priorizar confiabilidad; congelar cambios no críticos de la app.
  - **Consumo > 80%:** freeze de deploys de la app hasta recuperarse; solo hotfix.
- El gasto también se consume por violaciones sostenidas de SLO-SANTO-003/004 (según pesos definidos en revisión trimestral).

## 4. Alertas

| Severidad | Condición                                                                                                      | Acción                                                              | SLA de respuesta |
| --------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------- |
| **P1**    | Disponibilidad < 99% en ventana de 1h; o evento RUM con PII > 0; o fuga de secretos en bundle                  | Page on-call; mitigar (runbook RB-SANTO-ER2/ER3); freeze de deploys | 15 min           |
| **P2**    | CMS degradado (tasa de respuestas desde cache > 20% por 15 min); TTFB p95 > 800ms sostenido; 5xx > 0.1% en 24h | On-call dentro del día hábil; activar RB-SANTO-ER2                  | 4h               |
| **P3**    | LCP p75 > 2.5s por 7 días; éxito de búsqueda < 70% en 7 días; pico de reportes sin atender (SLO-006 en riesgo) | Backlog con plan en revisión semanal                                | 5 días hábiles   |

Enrutamiento: P1 por página/llamada de guardia del ecosistema; P2/P3 por canal de operaciones con owner asignado (Iván Ezequiel Iencinella por defecto).

## 5. Reporte y revisión

- **Dashboard:** disponibilidad, TTFB, LCP p75, tasa de error, éxito de búsqueda, reportes pendientes.
- **Revisión:** mensual del cumplimiento y del error budget; trimestral de umbrales y pesos.
- **Post-mortem:** obligatorio para P1 y para consumos del budget > 50% en un mes; los aprendizajes actualizan [07-ERM](07-ERM.md) y este documento.

## 6. Estados de servicio comunicados al usuario

| Estado       | Condición                                    | Comunicación al usuario                                         |
| ------------ | -------------------------------------------- | --------------------------------------------------------------- |
| Operativo    | SLOs en rango                                | Sin banner                                                      |
| Degradado    | Sirviendo desde cache (CMS/Motor con falla)  | Banner "contenido puede estar desactualizado"                   |
| Parcial      | Escritura de favoritos/reportes indisponible | Banner en acciones; lectura sigue disponible                    |
| Indisponible | Cache vacío y upstream caído                 | Página de error controlada con reintento (cuenta contra budget) |
