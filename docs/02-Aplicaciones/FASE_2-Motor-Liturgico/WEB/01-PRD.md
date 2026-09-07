---
tags:
  - proyecto/fosforo
  - aplicacion
  - motor-liturgico
  - fase-2
  - prd
type: app-prd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Iván Ezequiel Iencinella
related:
  - "[[00-README|Motor Liturgico]]"
  - "[[../../00-General/06-PRD-Maestro|PRD Maestro]]"
---

# PRD - Motor Liturgico

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `PRD-MOTOR-LIT-*`
- Plataforma: WEB
- Owner producto: Iván Ezequiel Iencinella
- Fecha: 2026-09-05
- Estado: draft

## 2. Problema y oportunidad

- **Problema:** Las aplicaciones liturgicas del ecosistema Fosforo (Misal, Visita 7 Iglesias, Lectio Divina) necesitan resolver el calendario liturgico catolico para una fecha dada. Sin un Motor centralizado, cada app tendria que implementar y mantener su propia logica de calculo de Pascua, ciclos liturgicos (A/B/C), precedencias de celebraciones, colores y tipos de fiesta. Esto genera duplicacion de codigo, riesgo de inconsistencias entre apps y un alto costo de mantenimiento ante cambios del calendario.
- **Oportunidad:** Centralizar el calculo liturgico en un unico servicio reutilizable expuesto via API REST. El Motor se convierte en la fuente unica de verdad para el calendario, permitiendo que todas las apps consumidoras obtengan resultados consistentes y se actualicen el calendario en un solo lugar. El contenido textual (lecturas, oraciones, antifonas) se delega al CMS, manteniendo una separacion clara entre logica calendrica y contenido editorial.

## 3. Objetivo de negocio

Construir un Motor Liturgico que resuelva el calendario catolico (rito romano) de forma determinista, exponiendo una API REST con latencia p95 < 100 ms, y que sea consumida por el 100% de las apps liturgicas del ecosistema Fosforo al cierre del MVP.

## 4. Segmentos y JTBD

- **Segmento principal (sistema):** Apps consumidoras del ecosistema (Misal, Visita 7 Iglesias, Lectio Divina) que necesitan resolver el calendario liturgico por fecha.
- **Segmento secundario (editores):** Editores de calendario liturgico que gestionan celebraciones excepcionales y actualizaciones del calendario via panel admin.
- **JTBD principal:** "Como app consumidora, quiero obtener la celebracion liturgica, ciclo, color y lecturas para una fecha dada, para mostrar contenido consistente sin duplicar logica de calculo."

## 5. Alcance MVP

| ID                | Requisito de producto                                                                                               | Prioridad | Justificacion                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------- |
| PRD-MOTOR-LIT-001 | Calculo de fecha a celebracion liturgica (ciclo, nombre, tipo, color)                                               | Must      | Funcion nucleo del Motor; sin esto no hay producto        |
| PRD-MOTOR-LIT-002 | Devolucion de colores liturgicos y tipos de fiesta (solemnidad, fiesta, memoria, feria)                             | Must      | Necesario para que las apps rendericen correctamente      |
| PRD-MOTOR-LIT-003 | API REST `GET /api/liturgia/{fecha}` con respuesta JSON estructurada                                                | Must      | Contrato de integracion para apps consumidoras            |
| PRD-MOTOR-LIT-004 | Integracion con CMS para referencias a textos de lecturas (sin duplicar contenido)                                  | Must      | El contenido es del CMS; el Motor solo guarda referencias |
| PRD-MOTOR-LIT-005 | Calculo de Pascua y fiestas moviles (Miercoles de Ceniza, Ascension, Pentecostes, Domingo de la Santisima Trinidad) | Must      | Sin Pascua, el calendario liturgico no es completo        |
| PRD-MOTOR-LIT-006 | Integracion RUM (pageviews y eventos) via app Log                                                                   | Should    | Necesario para observabilidad y medicion de adopcion      |

## 6. No alcance MVP

- Calendarios propios de otras iglesias u ortodoxos (solo rito romano).
- Santos patronales locales o diocesanos personalizados (post-MVP).
- Multi-idioma para nombres de celebraciones (el contenido multilingue se gestiona en el CMS).
- Edicion colaborativa del calendario en tiempo real.
- Exportacion a formatos externos (iCalendar, Google Calendar).
- Notificaciones push a usuarios finales (gestionado por el Sistema de Notificaciones, no por el Motor).

## 7. KPI y criterios de exito

- **KPI principal:** Latencia p95 de la API < 100 ms.
- **KPI secundario 1:** 100% de apps liturgicas del ecosistema integradas al Motor.
- **KPI secundario 2:** Determinismo: misma fecha produce siempre el mismo resultado (0% de variacion).

## 8. Riesgos de negocio

| Riesgo                                                      | Impacto | Mitigacion                                                           | Owner                    |
| ----------------------------------------------------------- | ------- | -------------------------------------------------------------------- | ------------------------ |
| Calculo incorrecto de Pascua o fiestas moviles              | Alto    | Usar algoritmo de Gauss validado con tests contra fechas conocidas   | Iván Ezequiel Iencinella |
| Desincronizacion entre Motor y CMS (referencias rotas)      | Medio   | Validacion de integridad referencial y job de verificacion periodica | Iván Ezequiel Iencinella |
| Rango de fechas fuera de soporte genera respuestas erroneas | Medio   | Validacion de rango (2000-2100) y error 400 explicito                | Iván Ezequiel Iencinella |

## 9. Trazabilidad

- SRS derivado: [02-SRS.md](02-SRS.md)
- FRD derivado: [03-FRD.md](03-FRD.md)
