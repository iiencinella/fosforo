---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-srs
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# SRS — Especificación de Requerimientos de Software — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Alcance del sistema

Lectio Divina (WEB) es una aplicación Astro 6 SSR en `src/apps/lectio-divina/` que provee: sesión guiada de oración en 5 pasos sobre las lecturas del día, diario personal privado en Supabase (esquema `lectio`), historial de práctica con racha, recordatorios opt-in, modo lectura y observabilidad RUM. Integra Motor Litúrgico, CMS, Sistema de Logueo, Sistema de Notificaciones y Log.

## 2. Requerimientos funcionales

### FR-LECTIO-001 — Sesión guiada en 5 pasos

El sistema **debe** proveer una sesión guiada por los pasos `lectio → meditatio → oratio → contemplatio → actio` (en ese orden), con:

- Navegación paso a paso ("Siguiente"/"Anterior"), indicador de progreso 1..5.
- El texto de la **lectura del día** visible en _lectio_ (y accesible en los demás pasos).
- En cada paso: texto guía (estático de la app) + campo de escritura de apuntes con **autoguardado**.
- Marca de paso completado al avanzar.

**Criterios:** una sesión abierta en la misma fecha retoma el estado guardado; avanzar marca `paso.completado`; completar _actio_ marca sesión `completada`. Trazabilidad: PRD-LECTIO-001, UC-LECTIO-001/002.

### FR-LECTIO-002 — Textos guía de dominio propio

Los textos explicativos de los 5 pasos son **contenido estático de la app** (dominio católico, redactor humano), versionados en el repositorio (módulo guía). **No** provienen del CMS y **no** son editables desde administración.

### FR-LECTIO-003 — Lecturas del día vía Motor/CMS

El sistema **debe** obtener las lecturas del día desde el **Motor Litúrgico** (resolución litúrgica de la fecha) y el texto desde el **CMS/Misal**, con cache de presentación. Si el Motor no responde o no hay lecturas, aplicar **fallback**: permitir seleccionar manualmente una lectura entre las disponibles (FR-LECTIO-007). Las lecturas **no se duplican** en la base de Lectio.

### FR-LECTIO-004 — Diario personal con CRUD

El usuario autenticado **debe** poder:

- **Crear/leer/editar** una entrada de diario por sesión y paso (`paso ∈ {lectio, meditatio, oratio, contemplatio, actio}`), guardada con `updated_at`.
- Autoguardado con debounce (2 s) mientras escribe (PUT por paso).
- Listar el diario por fecha y leer una entrada del día.

Acceso **exclusivo del dueño** (RLS estricta, ver FR-LECTIO-010). Trazabilidad: PRD-LECTIO-003, UC-LECTIO-003.

### FR-LECTIO-005 — Historial y streak con TZ del usuario

El sistema **debe** mostrar:

- Lista/calendario de sesiones completadas por fecha.
- **Streak**: días consecutivos de sesión completada, calculado con la **zona horaria** registrada del usuario (`tz_offset`); un día cambia cuando cambia la fecha local del usuario.

Trazabilidad: PRD-LECTIO-004, TC-LECTIO-012, UC-LECTIO-004.

### FR-LECTIO-006 — Recordatorio opt-in vía Notificaciones

Con consentimiento explícito, el sistema **debe** registrar en `preferences` un recordatorio de práctica (hora local, canal dispuesto por el Sistema de Notificaciones) que dispare una notificación con **enlace profundo** a `/hoy`. La preferencia es desactivable; sin consentimiento, **ningún** recordatorio se envía. Trazabilidad: PRD-LECTIO-005, UC-LECTIO-005.

### FR-LECTIO-007 — Modo lectura y fallback de lectura manual

- **Modo lectura:** tipografía serena con tamaño configurable (`font_size`), tema claro/oscuro (`data-theme` del ecosistema), mínimo de folders de UI; accesible incluso sin auth.
- **Fallback:** ante ausencia de lecturas del Motor, el usuario puede elegir manualmente una lectura disponible para orar (el diario en ese caso queda igualmente ligado a su sesión del día).

### FR-LECTIO-008 — Autenticación para diario y preferencias

El sistema **debe** requerir sesión autenticada (Sistema de Logueo) para: escribir/leer el diario propio, exportarlo y leer/actualizar preferencias. El intento sin auth redirige a login con `returnTo`. Trazabilidad: PRD-LECTIO-006.

### FR-LECTIO-009 — Exportación del diario propio (Could)

El sistema **puede** permitir generar la **exportación del diario propio** en Markdown y JSON (`GET /api/diario/export`), descargable solo por el dueño autenticado. Es un requerimiento "Could" del MVP. Trazabilidad: UC-LECTIO-006.

### FR-LECTIO-010 — RUM y privacidad del diario

El sistema **debe** emitir a **Log (RUM)** los eventos:

- `lectio.sesion.iniciada` `{ user_id_hash, fecha, fuente_lecturas }`
- `lectio.paso.completado` `{ user_id_hash, fecha, paso }`
- `lectio.sesion.completada` `{ user_id_hash, fecha }`

**Prohibido** enviar a RUM: texto de entradas, fragmentos del diario o cualquier contenido personal (ver SEC-LECTIO-007). El diario es privado por diseño: **NUNCA debe ser accesible por otros roles** (ni administración, ni servicio, ni otro usuario); la única política de lectura/escritura es `user_id = auth.uid()`. Trazabilidad: PRD-LECTIO-008/009.

## 3. Requerimientos no funcionales

| ID            | Requerimiento               | Meta                                                                                                                                |
| ------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| NFR-LECTIO-01 | Performance (LCP p75)       | < 2.5 s en las rutas principales (`/hoy`, `/sesion/[fecha]`, `/diario`)                                                             |
| NFR-LECTIO-02 | Accesibilidad               | WCAG 2.2 AA: navegación por teclado en pasos, labels en campos del diario, contraste AA en ambos temas                              |
| NFR-LECTIO-03 | Disponibilidad del servicio | 99.5 % (ver `11-SLA y SLO.md`)                                                                                                      |
| NFR-LECTIO-04 | Privacidad del diario       | Máxima: RLS por `user_id` + cifrado en reposo de Supabase; cero accesos por roles; pérdida de entradas = 0 (autoguardado + backups) |
| NFR-LECTIO-05 | TTFB p95                    | < 800 ms en SSR                                                                                                                     |
| NFR-LECTIO-06 | Robustez                    | Fallback a lectura manual y cache de CMS ante indisponibilidad de dependencias                                                      |

## 4. Integraciones requeridas (IR)

| ID           | Sistema                       | Uso                                                                            |
| ------------ | ----------------------------- | ------------------------------------------------------------------------------ |
| IR-LECTIO-01 | **Motor Litúrgico**           | Resolvedor de lecturas del día (qué lengua/celebración corresponde a la fecha) |
| IR-LECTIO-02 | **CMS (Misal)**               | Texto de las lecturas y guías; cache de presentación                           |
| IR-LECTIO-03 | **Sistema de Logueo**         | Autenticación (JWT/cookies) para diario y preferencias                         |
| IR-LECTIO-04 | **Sistema de Notificaciones** | Recordatorio de práctica opt-in con enlace profundo                            |
| IR-LECTIO-05 | **Log (RUM + logs)**          | Eventos de práctica y diagnóstico de errores                                   |

## 5. Criterios de aceptación (CA)

| ID           | Criterio                                                                                                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CA-LECTIO-01 | Dado un usuario autenticado, cuando completa la sesión de hoy (5 pasos), entonces su entrada queda en el diario con todos los apuntes y la fecha correcta.                                                                   |
| CA-LECTIO-02 | Dado un usuario B autenticado, cuando intenta leer/actualizar la entrada de A (por ID), entonces recibe resultado vacío/401-403; **nadie más** (ni rol administrador ni servicio) puede leerla: verificado por tests de RLS. |
| CA-LECTIO-03 | Dado el usuario recarga la página en mitad de sesión, cuando vuelve a abrirla el mismo día, entonces retoma su texto y progreso sin pérdida.                                                                                 |
| CA-LECTIO-04 | Dada una fecha y zona horaria, el streak cambia solo cuando la fecha **local** del usuario cambia.                                                                                                                           |
| CA-LECTIO-05 | Ningún atributo de `entries.*.texto` aparece en eventos RUM ni logs.                                                                                                                                                         |

## 6. Trazabilidad

| SRS           | PRD                | UC (FRD)          | TC (Tests)         | ADR                | Riesgo (ERM)       |
| ------------- | ------------------ | ----------------- | ------------------ | ------------------ | ------------------ |
| FR-LECTIO-001 | PRD-LECTIO-001     | UC-LECTIO-001/002 | TC-LECTIO-001..005 | ADR-LECTIO-001/004 | ERM-LECTIO-007     |
| FR-LECTIO-003 | PRD-LECTIO-002     | UC-LECTIO-001     | TC-LECTIO-006      | ADR-LECTIO-001     | ERM-LECTIO-003/004 |
| FR-LECTIO-004 | PRD-LECTIO-003     | UC-LECTIO-003     | TC-LECTIO-008..010 | ADR-LECTIO-003     | ERM-LECTIO-002     |
| FR-LECTIO-005 | PRD-LECTIO-004     | UC-LECTIO-004     | TC-LECTIO-011/012  | ADR-LECTIO-004     | ERM-LECTIO-005     |
| FR-LECTIO-006 | PRD-LECTIO-005     | UC-LECTIO-005     | TC-LECTIO-013      | ADR-LECTIO-006     | ERM-LECTIO-007     |
| FR-LECTIO-008 | PRD-LECTIO-006     | UC-LECTIO-003     | TC-LECTIO-007      | ADR-LECTIO-002     | ERM-LECTIO-001     |
| FR-LECTIO-009 | —                  | UC-LECTIO-006     | TC-LECTIO-014      | ADR-LECTIO-008     | —                  |
| FR-LECTIO-010 | PRD-LECTIO-008/009 | UC-LECTIO-007     | TC-LECTIO-015/016  | ADR-LECTIO-007     | ERM-LECTIO-006     |
