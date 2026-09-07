---
tags:
  - proyecto/fosforo
  - app/lectio-divina
  - fase/2
  - plataforma/web
type: app-readme
owner: Iván Ezequiel Iencinella
status: draft
created: 2026-09-05
updated: 2026-09-05
---

# Lectio Divina (WEB)

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Propósito y visión

**Lectio Divina** es la aplicación de oración con la Palabra de Fósforo. Permite al usuario realizar una **sesión guiada de Lectio Divina en 5 pasos** — _lectio, meditatio, oratio, contemplatio, actio_ — sobre **las lecturas del día** (provenientes del Misal/CMS vía el Motor Litúrgico), y conservar un **diario personal de oración** con apuntes de cada paso, más el **historial de práctica** (racha).

La visión es la clásica: que cualquier persona, sin formación previa, pueda orar con la Palabra hoy, siguiendo un camino antiguo y probado, y que ese camino quede registrado como memoria espiritual personal.

- **Código de app:** `lectio-divina`
- **Ruta de código (a crear):** `src/apps/lectio-divina/`
- **Plataforma:** WEB
- **Fase:** 2
- **Asignación de fase:** Entra en Fase 2 porque antes de la reorganización no tenía fase asignada; su naturaleza (lecturas del Misal vía Motor Litúrgico + diario con auth) la coloca junto a las apps de Fase 2.

## 2. Validación de la necesidad

Hoy la Lectio Divina se practica **sin guía** (quien la conoce improvisa de memoria) o con **PDFs y hojas dispersas** que no se conectan con las lecturas del día ni guardan rastro de la oración. Consecuencias observadas:

1. **Barrera de entrada:** quien no conoce el método no sabe por dónde empezar.
2. **Fricción diaria:** buscar las lecturas de hoy en otra app y el método en un PDF rompe el momento de oración.
3. **Sin memoria:** la oración se dispersa; no hay registro del camino personal, ni continuidad (racha, historial).
4. **No hay sostén del hábito:** nada recuerda la práctica, y abandonar es lo normal.

Necesidad validada: una **práctica guiada y sostenida**, unida a las lecturas del día y con un diario íntimo que valga la pena cuidar.

## 3. Arquitectura (resumen)

- **Frontend:** Astro 6 (SSR) + React 19 islands + Tailwind v4, con base visual `@repo/ui` y tokens de `src/packages/tailwind-config/shared-styles.css`.
- **Lecturas del día:** provienen del **Motor Litúrgico** (qué lecturas corresponden a hoy según el calendario) con texto servido/Cacheado vía **CMS (Misal)**. La app **nunca hardcodea** lecturas ni las duplica en su base.
- **Diario personal:** Supabase (Postgres) en esquema `lectio`, con **RLS estricta por `user_id`**: cada entrada es visible y editable **solo por su dueño**.
- **Sesión guiada:** los textos de la guía (los 5 pasos) son **contenido estático propio de la app**, versionado en repositorio; el contenido dinámico (lecturas) viene del Motor/CMS.
- **Recordatorios:** opt-in, vía el **Sistema de Notificaciones**.
- **Observabilidad:** **Log** (RUM + logs): eventos de práctica (`lectio.sesion.*`, `lectio.paso.*`), **sin contenido del diario**.
- **Auth:** obligatoria para diario y preferencias; la sesión guiada "de lectura" es en cambio pública.

Detalle completo: `02-SRS.md`, `06-Esquema de Datos.md`, `09-Especificacion Tecnica.md`.

## 4. Alcance del MVP

### Incluido en MVP

| Requerimiento                             | Descripción                                                                                                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sesión guiada de Lectio Divina en 5 pasos | Flujo paso a paso (_lectio → meditatio → oratio → contemplatio → actio_), con el texto de la lectura del día a la vista en cada paso y espacio para anotar. |
| Lecturas del día                          | Obtenidas del Motor Litúrgico/CMS (Misal), presentadas dentro de la sesión y en la página "Hoy".                                                            |
| Diario personal                           | Entradas por fecha con apuntes de cada paso: crear, editar, autoguardado, ver por día. Acceso solo del dueño.                                               |
| Historial de práctica                     | Calendario/lista de sesiones realizadas y racha (streak) calculada con la zona horaria del usuario.                                                         |
| Recordatorio de práctica                  | Opt-in vía Sistema de Notificaciones, con enlace profundo a la sesión de hoy.                                                                               |
| Auth para el diario                       | Inicio de sesión obligatorio para escribir y conservar el diario (Sistema de Logueo).                                                                       |
| Modo lectura                              | Tipografía y tema aptos para orar (tamaño de fuente, modo sereno).                                                                                          |
| RUM                                       | Eventos de práctica para medir engagement y KPIs, sin PII del diario.                                                                                       |

### No alcance (explícito)

- **Comunidad o compartir entradas:** el diario es íntimo; no hay funciones sociales en el MVP (ni está previsto compartirlas).
- **IA que escriba meditaciones:** la guía es humana, tradicional y fija; ninguna IA genera contenido espiritual.
- **Multi-idioma:** solo español en el MVP.

## 5. KPIs

| KPI                                               | Objetivo                                                | Fuente                         |
| ------------------------------------------------- | ------------------------------------------------------- | ------------------------------ |
| Sesiones de práctica por semana por usuario       | ≥ 3 (numérico de referencia: creciente semana a semana) | RUM `lectio.sesion.completada` |
| LCP (p75)                                         | < 2.5 s                                                 | RUM web vitals                 |
| Retención de racha (usuarios con streak ≥ 7 días) | Tendencia positiva                                      | `sessions` + RUM               |

## 6. Dependencias de ecosistema

| Sistema                   | Uso en Lectio Divina               | Criticidad |
| ------------------------- | ---------------------------------- | ---------- |
| Motor Litúrgico           | Determina las lecturas del día     | Alta       |
| CMS / Misal               | Texto de las lecturas y guías      | Alta       |
| Sistema de Logueo         | Auth para diario y preferencias    | Alta       |
| Sistema de Notificaciones | Recordatorio opt-in de práctica    | Media      |
| Log (RUM + logs)          | Métricas de práctica y diagnóstico | Media      |

## 7. Secuencia documental (estado draft)

| #   | Documento                           | Estado |
| --- | ----------------------------------- | ------ |
| 00  | README (este archivo)               | draft  |
| 01  | PRD                                 | draft  |
| 02  | SRS                                 | draft  |
| 03  | FRD                                 | draft  |
| 04  | Flujos y Secuencias                 | draft  |
| 05  | Tests Unitarios                     | draft  |
| 06  | Esquema de Datos                    | draft  |
| 07  | ERM (gestión de riesgos operativos) | draft  |
| 08  | Decisiones de Arquitectura          | draft  |
| 09  | Especificación Técnica              | draft  |
| 10  | OWASP                               | draft  |
| 11  | SLA y SLO                           | draft  |

## 8. Cómo navegar

1. Producto/por qué: `01-PRD.md`.
2. Qué debe hacer el sistema: `02-SRS.md`.
3. Reglas de negocio y casos de uso: `03-FRD.md`.
4. Cómo fluye la oración: `04-Flujos y Secuencias.md`.
5. Cómo se construye: `08-Decisiones de Arquitectura.md` y `09-Especificacion Tecnica.md`.
6. Cómo se garantiza calidad y seguridad: `05-Tests Unitarios.md`, `10-OWASP.md`, `11-SLA y SLO.md`.
