---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-frd
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# FRD — Documento de Requerimientos Funcionales — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Casos de uso

### UC-LECTIO-001 — Iniciar una sesión de oración

| Campo         | Valor                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Actor         | Usuario (autenticado o anónimo)                                                                     |
| Precondición  | Ruta `/hoy` accesible; Motor responde o hay fallback                                                |
| Flujo         | El usuario ingresa a "Hoy": ve fecha litúrgica, lecturas del día y el CTA "Comenzar Lectio Divina". |
| Postcondición | Se crea (o retoma) la sesión del día (idempotente) y se emite `lectio.sesion.iniciada`.             |

### UC-LECTIO-002 — Avanzar los pasos de la sesión

| Campo         | Valor                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actor         | Usuario autenticado (o modo lectura sin guardar)                                                                                                            |
| Flujo         | En `/sesion/[fecha]`, avanza `lectio → ... → actio`; en cada paso lee el texto guía, la lectura, escribe apuntes con autoguardado y marca el paso completo. |
| Postcondición | Sesión `completada` tras _actio_; se emite `lectio.paso.completado` por paso y `lectio.sesion.completada` al final.                                         |

### UC-LECTIO-003 — Escribir en el diario

| Campo         | Valor                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actor         | Usuario autenticado                                                                                                                                           |
| Flujo         | Dentro de un paso, escribe su apunte; autoguardado lo persiste en `entries` (por `session_id` + `paso`). También puede editar lo ya guardado desde `/diario`. |
| Postcondición | Entrada persistida con `updated_at` actualizado; visible solo para el dueño.                                                                                  |
| Alternativa   | Sin auth → redirección a login con retorno.                                                                                                                   |

### UC-LECTIO-004 — Ver historial de práctica

| Campo         | Valor                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Actor         | Usuario autenticado                                                                                   |
| Flujo         | Accede a su historial: calendario/lista de sesiones por fecha y su racha (streak) en su zona horaria. |
| Postcondición | Vista coherente con `sessions`; entradas de días pasados abribles en modo lectura.                    |

### UC-LECTIO-005 — Configurar recordatorio

| Campo         | Valor                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actor         | Usuario autenticado                                                                                                                                                   |
| Flujo         | Activa el recordatorio (opt-in), define hora local; el sistema persiste en `preferences` y el Sistema de Notificaciones agenda el envío con enlace profundo a `/hoy`. |
| Postcondición | Preferencia guardada; puede desactivarla cuando quiera.                                                                                                               |

### UC-LECTIO-006 — Exportar el diario

| Campo         | Valor                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| Actor         | Usuario autenticado (dueño)                                                                   |
| Flujo         | Solicita exportación; el sistema genera Markdown/JSON de **sus** entradas y entrega descarga. |
| Postcondición | Archivo entregado; operación registrada sin contenido.                                        |

### UC-LECTIO-007 — Consentimiento RUM

| Campo         | Valor                                                                                                                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actor         | Usuario                                                                                                                                                                                                         |
| Flujo         | Antes de enviar eventos de práctica, el sistema respeta el consentimiento de telemetría del ecosistema; el usuario puede ver en `preferences`/pie que "solo se registran eventos de práctica, nunca tu diario". |
| Postcondición | RUM emite (o no) según consentimiento; contenido del diario nunca viaja.                                                                                                                                        |

### UC-LECTIO-008 — Usar el modo lectura

| Campo         | Valor                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actor         | Usuario (sin auth incluido)                                                                                                                              |
| Flujo         | Activa modo lectura (tema, tamaño de letra) y recorre la guía completa sin campos de guardado; puede iniciar sesión en cualquier momento para conservar. |
| Postcondición | Preferencias locales/UI aplicadas; sin escritura en `entries` si no hay auth.                                                                            |

## 2. Reglas de negocio

### RB-LECTIO-001 — Lecturas SIEMPRE del Motor/CMS

Las lecturas mostradas (en "Hoy" y en la sesión) provienen **exclusivamente** del Motor Litúrgico vía CMS. **Prohibido** hardcodear lecturas en código o duplicarlas en la base de Lectio. La única derivación de frontend permitida es cache de presentación con TTL corto.

### RB-LECTIO-002 — Diario privado (RLS por dueño, sin excepción)

Toda fila de `lectio.entries` y `lectio.sessions` pertenece a `user_id`. Las políticas de Supabase permiten `select/insert/update/delete` **solo** con `auth.uid() = user_id`. **No existe** excepción para ningún rol (service-role solo para migraciones controladas bajo auditoría, jamás para lectura de aplicación). Nadie más puede leer el diario: esta regla no tiene excepción de negocio.

### RB-LECTIO-003 — Sesión idempotente por fecha

Existe **una sesión activa por usuario y día**: `unique(user_id, fecha)`. Volver a "Comenzar" el mismo día **retoma** la sesión existente (no crea duplicados). El estado de sesión transiciona `activa → completada`; una sesión completada del mismo día se reabre para lectura/edición, no se duplica.

### RB-LECTIO-004 — Streak con zona horaria del usuario

El streak se calcula en la **fecha local del usuario** (`tz_offset` de `preferences`). Un día de práctica es una sesión `completada` con la fecha local del usuario; la racha se rompe solo si falta un día local completo. Cambios de vuelo/viaje no penalizan: el servidor usa el `tz_offset` guardado en cada sesión.

### RB-LECTIO-005 — Textos guía estáticos de dominio propio

Los textos de los 5 pasos son **contenido propio, versionado en repositorio** (módulo `guia/`). No se sirven desde CMS, no son editables por administración, y toda modificación pasa por PR con revisión (contenido espiritual del dominio católico). Versionado semántico del contenido acompañado de fecha de ayuda.

### RB-LECTIO-006 — Exportación solo del diario propio

`GET /api/diario/export` exige auth y devuelve únicamente filas con `user_id = auth.uid()`. No hay exportación por usuario/fecha de terceros ni de administrador.

### RB-LECTIO-007 — El recordatorio es opt-in

Sin consentimiento explícito no existe agenda de recordatorio. Dar de baja la preferencia cancela la notificación en < 24 h efectivas.

### RB-LECTIO-008 — RUM sin PII de diario

Los eventos RUM (`lectio.*`) contienen solo identificadores anonimizados, fecha y paso. **Prohibido** incluir texto, fragmentos, longitud del apunte ni metadatos derivados del contenido.

## 3. Validaciones y errores

| ID           | Validación / Error                                   | Comportamiento                                                                                                                                           |
| ------------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LECTIO-E-001 | Fecha inválida / fuera de rango en `/sesion/[fecha]` | 404 con mensaje "Fecha no válida"; sin escape de rutas (validación estricta `YYYY-MM-DD`).                                                               |
| LECTIO-E-002 | No autenticado al escribir en diario                 | 401 en API + redirección UI a login con `returnTo`; texto en curso se conserva en el cliente (no se pierde al volver).                                   |
| LECTIO-E-003 | Motor sin lecturas del día                           | Banner "No hay lecturas publicadas para hoy" + modo fallback (CR-2: lectura manual); evento de log de dependencia degradada.                             |
| LECTIO-E-004 | Conflicto de autoguardado (texto desactualizado)     | Resolución _última escritura gana_ por paso con `updated_at` mostrado; aviso inline sutil si el `updated_at` remoto es mayor que el local en la recarga. |
| LECTIO-E-005 | Error de guardado del diario                         | Reintentos exponenciales (3) en cliente; si persiste, banner "No se pudo guardar; tu texto queda aquí" y reenvío cuando la red vuelve (cola local).      |

## 4. Estados

### Sesión (`sessions.status`)

```
[no existe] --iniciar--> ACTIVA --completar actio--> COMPLETADA
ACTIVA (mismo día, re-ingreso) -> ACTIVA (retomar, idempotente)
COMPLETADA (mismo día) -> edición de entradas permitida; status permanece COMPLETADA
```

### Entrada de paso (`entries`)

```
[vacía] --escribir+debounce--> GUARDADA --edición--> GUARDADA (updated_at nuevo)
[vacía] --paso salteado--> sin fila (no se fuerzan entradas vacías al exportar)
```

### Cumplimiento de pasos

`paso_completado: lectio → meditatio → oratio → contemplatio → actio` en orden; retroceso permitido para editar, sin desmarcar pasos ya completados.

## 5. Trazabilidad

| RB/UC                            | SRS                   | TC                                | ADR                |
| -------------------------------- | --------------------- | --------------------------------- | ------------------ |
| UC-LECTIO-001/002, RB-LECTIO-003 | FR-LECTIO-001/005     | TC-LECTIO-001..004                | ADR-LECTIO-004     |
| UC-LECTIO-003, RB-LECTIO-002     | FR-LECTIO-004/008/010 | TC-LECTIO-008..010, TC-LECTIO-015 | ADR-LECTIO-002/003 |
| UC-LECTIO-004, RB-LECTIO-004     | FR-LECTIO-005         | TC-LECTIO-011/012                 | ADR-LECTIO-004     |
| UC-LECTIO-005, RB-LECTIO-007     | FR-LECTIO-006         | TC-LECTIO-013                     | ADR-LECTIO-006     |
| UC-LECTIO-006, RB-LECTIO-006     | FR-LECTIO-009         | TC-LECTIO-014                     | ADR-LECTIO-008     |
| UC-LECTIO-007, RB-LECTIO-008     | FR-LECTIO-010         | TC-LECTIO-015/016                 | ADR-LECTIO-007     |
| UC-LECTIO-008                    | FR-LECTIO-007         | TC-LECTIO-011                     | ADR-LECTIO-005     |
| RB-LECTIO-001                    | FR-LECTIO-003         | TC-LECTIO-006                     | ADR-LECTIO-001     |
