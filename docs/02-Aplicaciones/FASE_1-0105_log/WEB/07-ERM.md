---
tags:
  - proyecto/fosforo
  - erm
  - aplicacion/log
type: app-erm
area: aplicaciones
status: vigente
created: 2026-05-26
updated: 2026-05-26
related:
  - "[[00-README|README Log]]"
  - "[[06-Esquema de Datos|Esquema de Datos Log]]"
---

# ERM - 0105_log

## 1. Ficha

- ID base: `ERM-0105-LOG-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-05-26

## 2. Registro de riesgos y errores

| ID               | Riesgo/Error                                              | Tipo   | Severidad | Mitigacion                                                                                           | Owner           |
| ---------------- | --------------------------------------------------------- | ------ | --------- | ---------------------------------------------------------------------------------------------------- | --------------- |
| ERM-0105-LOG-001 | Caida de Supabase (DB no disponible)                      | Riesgo | P1        | Cachear ultimos datos en frontend; mostrar mensaje de degradacion; monitorear status.supabase.com    | Owner tecnico   |
| ERM-0105-LOG-002 | Pico de ingesta satura la DB                              | Riesgo | P2        | Rate limiting en POST /api/logs; indices optimizados; tabla particionada por mes                     | Owner tecnico   |
| ERM-0105-LOG-003 | API key comprometida                                      | Riesgo | P1        | Key rotation; deteccion de uso anomalo; desactivacion inmediata desde panel; almacen con hash        | Seguridad owner |
| ERM-0105-LOG-004 | Datos inconsistentes por payload malformado               | Error  | P3        | Validacion estricta con Zod; logs invalidos rechazados con 422 y detalle claro                       | Owner tecnico   |
| ERM-0105-LOG-005 | Acceso no autorizado por configuracion incorrecta de RLS  | Riesgo | P1        | Tests de RLS en CI; validacion manual antes de cada deploy; auditoria periodica de politicas         | Seguridad owner |
| ERM-0105-LOG-006 | Crecimiento de la tabla sin control                       | Riesgo | P2        | Politica de retencion (30 dias por defecto); job cron para limpieza; alerta de uso de almacenamiento | Owner tecnico   |
| ERM-0105-LOG-007 | Error en la UI al renderizar logs con metadata malformada | Error  | P3        | Renderizado defensivo con fallback a JSON stringify; test de componentes con datos malformados       | Owner tecnico   |

## 3. Runbooks

- **P1 - Caida de Supabase:** Verificar status en status.supabase.com. Si es interrupcion planificada, esperar. Si es no planificada, contactar soporte Supabase. La app muestra estado de degradacion en el header.
- **P1 - API key comprometida:** Desactivar key en tabla `api_keys` (set is_active = false). Generar nueva key. Notificar al owner de la app afectada. Rotar la key en la configuracion de la app emisora.
- **P1 - Acceso no autorizado por RLS:** Revisar politicas RLS de la tabla `log_entries`. Ejecutar `SELECT * FROM pg_policies WHERE tablename = 'log_entries'`. Verificar que no haya politicas demasiado permisivas. Aplicar fix y testear.

## 4. Continuidad operativa

- **RTO objetivo:** 4 horas (servicio debe estar disponible nuevamente dentro de 4 horas ante un desastre)
- **RPO objetivo:** 1 hora (perdida maxima de datos aceptable de 1 hora)
- **Estrategia de rollback:** Mantener la version anterior del deploy en Vercel disponible para rollback inmediato via dashboard de Vercel. Para cambios de schema DB, usar migraciones con `supabase db pull` y revertir con `supabase db reset` si es necesario.
