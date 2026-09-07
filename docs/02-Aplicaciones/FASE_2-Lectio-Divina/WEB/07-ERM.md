---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-erm
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# ERM — Gestión de Riesgos Operativos — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Dominio de riesgo

Lectio Divina guarda **contenido espiritual personal e íntimo**. El peor evento no es una caída de pantalla sino que **otro vea el diario** o que **se pierda**. Los riesgos priorizan la privacidad y la persistencia sobre la conveniencia.

## 2. Matriz de riesgos

### ERM-LECTIO-001 — Violación de privacidad del diario — P1

| Campo                 | Valor                                                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Descripción           | Un actor distinto al dueño accede al diario (usuario, rol de servicio, backoffice, fuga por logs).                                                                                      |
| Impacto               | P1: pérdida total de confianza; daño real a personas (contenido íntimo); impacto reputacional del ecosistema.                                                                           |
| Mitigación preventiva | RLS estricta por `user_id` sin excepción de roles (ADR-LECTIO-002); cifrado en reposo; RUM y logs sin contenido (ADR-LECTIO-007); exportación solo del dueño (ADR-LECTIO-008).          |
| Mitigación detectiva  | **Tests de RLS bloqueantes en CI** (TC-LECTIO-008/009); alerta P1 ante UPDATE/DELETE/SELECT masivo sobre `lectio.entries` desde service-role; revisión trimestral de políticas.         |
| Runbook               | RUN-LEX: (1) revocar claves/API keys involucradas; (2) revisar logs de acceso Postgres; (3) rotar credenciales; (4) notificar al usuario afectado y a security; (5) forense de alcance. |

### ERM-LECTIO-002 — Pérdida de entradas del diario — P1

| Campo                 | Valor                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Descripción           | El usuario escrebe y su texto no se persiste (corte de red, bug de autoguardado, borrón accidental) o se pierde una base.                                                       |
| Impacto               | P1: contenido espiritual irreemplazable ("la oración de ayer no se puede reescribir").                                                                                          |
| Mitigación preventiva | **Autoguardado por paso** (debounce 2 s, ADR-LECTIO-003); reintentos + cola local en cliente (LECTIO-E-005); sin DELETE destructivo de sesiones desde UI (soft check); backups. |
| Mitigación detectiva  | **PITR/backups diarios del Proyecto Supabase**; alerta si tasa de autoguardado exitoso < 99.5 % (SLO-LECTIO-005).                                                               |
| Runbook               | RUN-REC: restaurar punto-in-time; reconciliar `updated_at` máximos por paso; comunicación al usuario si hubo ventana de pérdida.                                                |

### ERM-LECTIO-003 — Motor sin lecturas del día — P2

| Campo                 | Valor                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Descripción           | El Motor Litúrgico no responde o no publicó lecturas: la app abre "hoy" vacio.                                                        |
| Impacto               | P2: experiencia degradada, frustración repetida rompe el hábito (feeder del abandono).                                                |
| Mitigación preventiva | Fallback: selección manual de lectura (ADR-LECTIO-001, CR/LECTIO-E-003); lectura cacheada de presentación; sesión se crea igualmente. |
| Mitigación detectiva  | Alerta P2 si Motor falla > 5 min o "días sin lecturas" > 0; evento de log de dependencia.                                             |
| Runbook               | RUN-MOT: verificar estado del Motor con su equipo; habilitar fallback visible; retirar banner al recuperar.                           |

### ERM-LECTIO-004 — CMS caído — P3

| Campo                 | Valor                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Descripción           | CMS (texto del Misal) indisponible: sin contenido de lecturas.                                                              |
| Impacto               | P3: degradación temporal; el resto de la app funciona.                                                                      |
| Mitigación preventiva | **Cache de presentación** (última versión de lecturas servida, marcada como tal); con revalidación periódica en background. |
| Mitigación detectiva  | Alerta de error rate contra CMS > umbral (P3).                                                                              |
| Runbook               | RUN-CMS: servir cache; informar "lecturas levemente desactualizadas" si corresponde; escalar al equipo de Contenidos.       |

### ERM-LECTIO-005 — Zona horaria rompe el streak — P2

| Campo                 | Valor                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Descripción           | Un viajero o cambio horario ve su racha "rota" aunque oró ambos días (error clásico de cálculo por UTC).                         |
| Impacto               | P2: injusticia personal; desmotiva justo cuando el hábito florecía.                                                              |
| Mitigación preventiva | `tz_offset` guardado **por sesión**; streak calculado sobre fechas locales (RB-LECTIO-004, ADR-LECTIO-004); tests TC-LECTIO-012. |
| Mitigación detectiva  | Monitoreo de discrepancias `                                                                                                     | fecha_utc - fecha_local | > 1` en sesión (inidica datos defectuosos). |
| Runbook               | RUN-TZ: recomputar streak desde `sessions`; corregir `tz_offset` históricos en lotes auditados.                                  |

### ERM-LECTIO-006 — RUM con PII del diario — P1

| Campo                 | Valor                                                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Descripción           | Por error se envían textos del diario (o derivados: longitud, snippets) a Log/RUM.                                                                                              |
| Impacto               | P1: fuga de contenido íntimo a un sistema con otro propósito y retención.                                                                                                       |
| Mitigación preventiva | ADR-LECTIO-007: payload permitido whitelist `{user_id_hash, fecha, paso}`; lint custom y test TC-LECTIO-015 como filtros obligatorios; ningún evento "biografía" del contenido. |
| Mitigación detectiva  | Escaneo de payloads RUM en CI + en runtime (sampleo) por palabras/longitud atipica.                                                                                             |
| Runbook               | RUN-RUM: purgar eventos contaminados en el proveedor; rotar claves RUM; pospoer retención al mínimo; post-mortem.                                                               |

### ERM-LECTIO-007 — Abandono de la práctica — P3

| Campo                 | Valor                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Descripción           | El usuario deja de orar y el producto cae en desuso silencioso.                                                                    |
| Impacto               | P3: producto sin misión cumplida (KPI "sesiones/semana" caído).                                                                    |
| Mitigación preventiva | Recordatorio opt-in (ADR-LECTIO-006); streak visible y honesto; modo lectura de baja fricción para volver; guía clara paso a paso. |
| Mitigación detectiva  | KPI semanal por cohortes; alerta P3 si caída > 30 % WoW en usuarios activos.                                                       |
| Runbook               | RUN-GRO: revisar cohortes y recordatorios; iterar sobre onboarding y copys; reporte mensual.                                       |

## 3. Resumen de severidad

| ID             | Riesgo                  | Severidad | Slas de respuesta  |
| -------------- | ----------------------- | --------- | ------------------ |
| ERM-LECTIO-001 | Viol. privacidad diario | P1        | Respuesta < 30 min |
| ERM-LECTIO-002 | Pérdida de entradas     | P1        | Respuesta < 30 min |
| ERM-LECTIO-006 | PII en RUM              | P1        | Respuesta < 30 min |
| ERM-LECTIO-003 | Motor sin lecturas      | P2        | Respuesta < 4 h    |
| ERM-LECTIO-005 | TZ rompe streak         | P2        | Respuesta < 1 día  |
| ERM-LECTIO-004 | CMS caído               | P3        | Respuesta < 1 día  |
| ERM-LECTIO-007 | Abandono                | P3        | Mensual            |

## 4. Objetivos de recuperación (transversales al diario)

- **RTO: 2 h** — el diario es contenido personal valioso: una interrupción prolongada rompe la oración del día de toda una comunidad.
- **RPO: 1 h** — PITR/backup continuo de Supabase para no perder entradas ni siquiera de la última hora.

## 5. Auditoría y enlaces

- Revisión trimestral de este ERM junto a `10-OWASP.md` y `11-SLA y SLO.md`.
- Trazabilidad: ADR-LECTIO-001..008, FR-LECTIO-* , TC-LECTIO-*.
