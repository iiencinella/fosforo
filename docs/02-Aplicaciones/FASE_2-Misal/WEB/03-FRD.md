---
tags:
  - proyecto/fosforo
  - aplicacion
  - misal
  - frd
type: app-frd
area: aplicaciones
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[00-README|Misal]]"
  - "[[../../00-General/08-FRD-Maestro|FRD Maestro]]"
---

# FRD - Misal

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Ficha

- ID base: `RB-MISAL-*`, `UC-MISAL-*`
- Plataforma: WEB
- Owner funcional: Iván Ezequiel Iencinella
- Fecha: 2026-09-05

## 2. Casos de uso

| ID           | Caso de uso                    | Flujo principal                                                                                                                                                                                            | Excepciones                                                                                                                           |
| ------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| UC-MISAL-001 | Ver lecturas del día           | 1. Usuario abre `/`. 2. SSR consulta Motor Litúrgico por fecha de hoy. 3. SSR consulta CMS por lecturas. 4. Página muestra oración inicial, lecturas, salmo, evangelio y color litúrgico.                  | Motor cae → banner degradación con último cache. CMS cae → banner + cache. Sin lecturas del día → mensaje "Contenido en preparación". |
| UC-MISAL-002 | Navegar a otra fecha           | 1. Usuario pulsa "Ayer"/"Mañana" o abre date picker. 2. Navegación a `/dia/{fecha}`. 3. View Transition suave; contenido del día nuevo.                                                                    | Fecha sin lecturas → mensaje + CTA "Volver a hoy". Fecha fuera de rango → error controlado.                                           |
| UC-MISAL-003 | Consultar ordinario            | 1. Usuario abre `/ordinario`. 2. Ve textos fijos agrupados por momento de la Misa.                                                                                                                         | —                                                                                                                                     |
| UC-MISAL-004 | Activar modo lectura           | 1. Usuario activa toggle "Modo lectura". 2. Tipografía serif, tamaño aumentado, modo oscuro según preferencia. 3. Preferencia persiste.                                                                    | —                                                                                                                                     |
| UC-MISAL-005 | Guardar favorito               | 1. Usuario autenticado pulsa "Guardar" en una lectura. 2. Se persiste en Supabase con RLS. 3. Visible en `/favoritos`.                                                                                     | Sin sesión → CTA de login. Error de DB → toast de error.                                                                              |
| UC-MISAL-006 | Reportar problema de contenido | 1. Usuario pulsa "Reportar problema" en una lectura. 2. Formulario breve (tipo de problema, comentario opcional). 3. Envío registra evento en Log (`app=misal`, `level=warn`). 4. Confirmación al usuario. | Rate limiting por sesión.                                                                                                             |
| UC-MISAL-007 | Activar recordatorio diario    | 1. Usuario autenticado activa "Recordatorio diario" y elige canal (push/email). 2. Se registra preferencia en Notificaciones. 3. Recibe recordatorio diario.                                               | Canal no disponible → mensaje. Ya activo → toggle actualiza.                                                                          |
| UC-MISAL-008 | Dar consentimiento de RUM      | 1. Primera visita muestra banner de consentimiento. 2. Usuario acepta/rechaza. 3. SDK activa/desactiva tracking. 4. DNT activo → sin banner, sin tracking.                                                 | —                                                                                                                                     |

## 3. Reglas de negocio

| ID           | Regla                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| RB-MISAL-001 | La fecha litúrgica se resuelve SIEMPRE por el Motor Litúrgico; la app no implementa cálculo calendárico propio. |
| RB-MISAL-002 | Los textos de lecturas provienen SIEMPRE del CMS; la app no hardcodea contenido litúrgico.                      |
| RB-MISAL-003 | El cache SSR del día es de 24h para datos del Motor y 1h para contenido del CMS.                                |
| RB-MISAL-004 | Ante caída de CMS o Motor, se sirve el último cache disponible con banner de degradación visible.               |
| RB-MISAL-005 | Solo usuarios autenticados pueden guardar favoritos y activar recordatorios.                                    |
| RB-MISAL-006 | El modo lectura y la preferencia de tema se guardan en localStorage (sin requerir sesión).                      |
| RB-MISAL-007 | La página del día es SEO-friendly: título con celebración y fecha, meta descripción con lecturas.               |

## 4. Validaciónes y errores esperados

| Contexto             | Validación                              | Error                                               |
| -------------------- | --------------------------------------- | --------------------------------------------------- |
| Navegación por fecha | Fecha en rango válido (2000-2100)       | `MISAL-001: Fecha fuera de rango`                   |
| Lecturas del día     | Existencia de contenido en CMS          | `MISAL-002: Sin lecturas publicadas para {fecha}`   |
| Favorito             | Usuario autenticado                     | `MISAL-003: Sesión requerida para favoritos`        |
| Reporte              | Rate limit por sesión                   | `MISAL-004: Demasiados reportes, intenta más tarde` |
| Recordatorio         | Canal disponible y preferencias válidas | `MISAL-005: Canal de notificación no disponible`    |

## 5. Estados funcionales

- Estado `loading`: skeleton de lecturas durante SSR/CSR.
- Estado `empty`: "Contenido en preparación" si el CMS no tiene lecturas del día.
- Estado `error`: mensaje + reintento; banner de degradación si APIs caídas.
- Estado `success`: lecturas completas con color litúrgico y navegación.
- Estado `degraded`: contenido de cache con banner informativo.

## 6. Trazabilidad FRD -> SRS

| FRD          | SRS                                      |
| ------------ | ---------------------------------------- |
| UC-MISAL-001 | FR-MISAL-001, FR-MISAL-004, FR-MISAL-005 |
| UC-MISAL-002 | FR-MISAL-002                             |
| UC-MISAL-003 | FR-MISAL-003                             |
| UC-MISAL-004 | FR-MISAL-007                             |
| UC-MISAL-005 | FR-MISAL-008                             |
| UC-MISAL-006 | FR-MISAL-010                             |
| UC-MISAL-007 | FR-MISAL-011                             |
| UC-MISAL-008 | FR-MISAL-009                             |
| RB-MISAL-001 | IR-MISAL-002                             |
| RB-MISAL-002 | IR-MISAL-001                             |
