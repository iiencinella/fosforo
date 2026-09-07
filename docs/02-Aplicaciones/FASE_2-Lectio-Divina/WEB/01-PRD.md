---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-prd
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# PRD — Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Contexto y problema

### 1.1 Contexto

La Lectio Divina es el método tradicional de la Iglesia para orar con la Palabra: leer (_lectio_), meditar (_meditatio_), orar (_oratio_), contemplar (_contemplatio_) y actuar (_actio_). Dentro de Fósforo, las lecturas de cada día ya están resueltas por el Motor Litúrgico y el CMS del Misal: la materia prima de la oración existe y está disponible.

### 1.2 Problema

La práctica de oración con la Palabra **carece de guía y de continuidad**:

- Quien no conoce el método no encuentra una guía sencilla integrada a las lecturas del día.
- Quien lo conoce practica con apuntes dispersos (PDFs, cuadernos, app de notas) y **sin registro**: su camino de oración no deja memoria.
- Nada sostiene el hábito: sin recordatorio ni historial, la práctica se abandona.

### 1.3 Evidencia / validación

Detalle completo en `00-README.md` §2. Resumen: la Lectio Divina hoy se practica sin guía o con material disperso; no existe en el ecosistema una herramienta que una **lecturas del día + método + diario íntimo + continuidad**.

## 2. Job To Be Done (JTBD)

> **"Cuando quiero orar con la Palabra (hoy o cualquier día), quiero una guía sencilla que me acompañe paso a paso sobre las lecturas de hoy y un registro de mi camino de oración, para sostener el hábito y ver cómo Dios actúa en mi vida."**

Trabajos funcionales:

- Orar hoy con las lecturas del día siguiendo los 5 pasos, sin fricción.
- Dejar constancia de lo que leí, medité, oré, contemplé y me propuso actuar.
- Volver mañana: ver mi historial y mi racha.

Trabajos emocionales:

- Sentir un espacio íntimo y seguro: "esto es solo mío".
- Evitar la culpa del abandono: un recordatorio amable y la continuidad.

## 3. Usuario objetivo

- **Principal:** católico adulto (acitvo en la web de Fósforo) que quiere profundizar en la oración con la Palabra; usuario autenticado.
- **Secundario:** persona curiosa, bautizada o no, que explora la Lectio Divina por primera vez (modo lectura, sin diario).

## 4. Requerimientos de producto

Los IDs siguen la convención `PRD-LECTIO-*`. Itere con `02-SRS.md` para la expresión funcional formal.

### PRD-LECTIO-001 — Sesión guiada en 5 pasos

La app **debe** guiar al usuario por los 5 pasos de la Lectio Divina (_lectio, meditatio, oratio, contemplatio, actio_) en orden, con el texto de la lectura del día visible en cada paso y un espacio para escribir apuntes. Los pasos tienen contenido explicativo propio (qué se hace en cada paso, con textos del dominio católico) y son estáticos/versionados por la app.

### PRD-LECTIO-002 — Lecturas del día desde Motor/CMS

La sesión y la página "Hoy" **deben** mostrar las lecturas del día obtenidas del **Motor Litúrgico** (qué corresponde a hoy) con texto del **CMS/Misal**. La app **no** debe hardcodear lecturas ni duplicarlas en su base de datos.

### PRD-LECTIO-003 — Diario personal de oración

El usuario autenticado **debe** poder escribir y conservar entradas de diario **por fecha**, con apuntes de cada paso. Cada entrada pertenece a una sesión; el diario es **privado**: solo el dueño puede leerlo o modificarlo (RLS).

### PRD-LECTIO-004 — Historial y racha de práctica

La app **debe** mostrar el historial de sesiones (calendario y lista) y la **racha** de días consecutivos de práctica calculada en la **zona horaria del usuario**.

### PRD-LECTIO-005 — Recordatorio de práctica (opt-in)

Con consentimiento explícito, la app **debe** poder pedir al Sistema de Notificaciones un **recordatorio de práctica** (momento configurable), con enlace profundo a la sesión de hoy. Desactivable en cualquier momento.

### PRD-LECTIO-006 — Auth para el diario

Escribir el diario, verlo, exportarlo y las preferencias **requieren** sesión iniciada (Sistema de Logueo). Sin auth, el usuario puede recorrer la guía en **modo lectura** pero no guardar entradas.

### PRD-LECTIO-007 — Modo lectura

La app **debe** ofrecer un **modo lectura** apto para oración: tipografía serena (tamaño de letra configurable), tema claro/oscuro reutilizando el tema del ecosistema, distracciones mínimas.

### PRD-LECTIO-008 — Privacidad del diario

El diario **debe permanecer privado**: sin listados públicos, sin acceso de administración sobre el contenido, sin compartir ni comunidad. La privacidad es un requisito de producto, no solo técnico (ver `10-OWASP.md`).

### PRD-LECTIO-009 — Observabilidad de práctica (RUM)

La app **debe** emitir eventos de práctica (sesión iniciada, paso completado, sesión completada) a **Log (RUM)**, **sin incluir nunca contenido del diario**, para medir los KPIs.

## 5. Métricas y criterios de éxito

| KPI                                        | Meta                                         |
| ------------------------------------------ | -------------------------------------------- |
| Sesiones de práctica semanales por usuario | ≥ 3, tendencia creciente                     |
| LCP p75                                    | < 2.5 s                                      |
| Usuarios con racha ≥ 7 días                | Creciente mes a mes                          |
| Activación de recordatorios (opt-in)       | Medida y reportada (sin meta forzosa en MVP) |

## 6. Riesgos de producto

| ID     | Riesgo                                                                                                                        | Impacto | Mitigación                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| PRD-R1 | **Privacidad del diario:** una filtrura o acceso indebido destruye la confianza en el producto (contenido espiritual íntimo). | Crítico | RLS estricta por dueño, sin acceso por roles, tests de RLS, auditoría (`ERM-LECTIO-001`).         |
| PRD-R2 | **Motor sin lecturas del día:** el usuario abre la guía y no hay lecturas.                                                    | Alto    | Fallback a lectura seleccionable manualmente; observabilidad (`ERM-LECTIO-003`).                  |
| PRD-R3 | **Abandono de la práctica:** el hábito no se sostiene y el producto "se muere de naturalidad".                                | Alto    | Recordatorios opt-in, racha visible, KPI semanal, modo lectura de bajo umbral (`ERM-LECTIO-007`). |

## 7. Fuera de alcance para esta fase

Ver `00-README.md` §4: comunidad/compartir, IA generadora de meditaciones, multi-idioma. También fuera: edición/suscripción, apps nativas, ferias de retiros.
