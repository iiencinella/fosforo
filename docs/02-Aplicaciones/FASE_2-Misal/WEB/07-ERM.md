---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - erm
type: app-erm
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
---

# ERM - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `ERM-MISAL-*`
- Owner operativo: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Registro de riesgos y errores

| ID            | Riesgo/Error                                      | Tipo   | Severidad | Mitigación                                                                                                         | Owner                    |
| ------------- | ------------------------------------------------- | ------ | --------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| ERM-MISAL-001 | Motor Litúrgico devuelve celebración incorrecta   | Riesgo | P1        | Revisión editorial en CMS; reportes de usuarios; comparación con fuentes oficiales; runbook de corrección en Motor | Iván Ezequiel Iencinella |
| ERM-MISAL-002 | CMS sin lecturas del día publicadas               | Riesgo | P1        | Alerta diaria (Notificaciones a editores) si faltan lecturas de hoy/mañana; estado empty con mensaje claro         | Iván Ezequiel Iencinella |
| ERM-MISAL-003 | CMS o Motor caídos (indisponibilidad)             | Riesgo | P2        | Cache SSR (24h Motor, 1h CMS) + fallback última versión + banner degradación; auto-reintento                       | Iván Ezequiel Iencinella |
| ERM-MISAL-004 | Contenido litúrgico con error doctrinal publicado | Riesgo | P1        | Flujo editorial con revisor obligatorio en CMS; reportes de usuarios; corrección rápida con invalidación de cache  | Iván Ezequiel Iencinella |
| ERM-MISAL-005 | Pico de tráfico (domingos, fechas especiales)     | Riesgo | P3        | Cache SSR por día (mismo HTML para todos), CDN de Vercel; escalado automático                                      | Iván Ezequiel Iencinella |
| ERM-MISAL-006 | Regresión de Web Vitals                           | Riesgo | P3        | Monitoreo continuo vía RUM; alerta si LCP p75 > 2.5s; presupuesto de performance en CI                             | Iván Ezequiel Iencinella |

## 3. Runbooks

- P1 (celebración incorrecta): Confirmar con fuente oficial → corregir en Motor Litúrgico (admin) → invalidar cache del día → verificar en Misal → registrar evento.
- P1 (faltan lecturas): Alerta diaria → editor completa lecturas en CMS → publica → webhook invalida cache → verificar en Misal.
- P2 (servicios caídos): Verificar estado de CMS/Motor → si caída prolongada, banner permanente → comunicar a usuarios via portal.

## 4. Continuidad operativa

- RTO objetivo: 2 horas (el Misal es una app de alta visibilidad; con cache, la degradación parcial es tolerable).
- RPO objetivo: 24 horas (contenido del día regenerable desde CMS/Motor; solo se perderían favoritos del día).
- Estrategia de rollback: Rollback inmediato en Vercel a la versión anterior del deploy; cache SSR sigue operativo durante el rollback.
