---
tags:
  - proyecto/fosforo
  - santopedia
  - frd
  - web
type: app-frd
area: aplicaciónes
status: draft
created: 2026-09-05
updated: 2026-09-05
related:
  - "[[02-SRS|02-SRS]]"
  - "[[04-Flujos y Secuencias|04-Flujos y Secuencias]]"
---

# Santopedia — FRD

> Generado con Kimi K3 (Moonshot AI). Owner: Iván Ezequiel Iencinella.

## 1. Alcance

Detalle funcional y de comportamiento de Santopedia (fase WEB). Se basa en [02-SRS](02-SRS.md) y genera [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md) y [05-Tests Unitarios](05-Tests%20Unitarios.md).

## 2. Casos de uso

| ID           | Caso de uso                        | Actor                 | FR asociado                              |
| ------------ | ---------------------------------- | --------------------- | ---------------------------------------- |
| UC-SANTO-001 | Ver ficha de santo                 | Visitante/autenticado | FR-SANTO-001, FR-SANTO-008, FR-SANTO-009 |
| UC-SANTO-002 | Buscar santo                       | Visitante/autenticado | FR-SANTO-003                             |
| UC-SANTO-003 | Navegar por categoría              | Visitante/autenticado | FR-SANTO-002                             |
| UC-SANTO-004 | Ver santo del día                  | Visitante/autenticado | FR-SANTO-004                             |
| UC-SANTO-005 | Guardar favorito                   | Autenticado           | FR-SANTO-005                             |
| UC-SANTO-006 | Reportar error de contenido        | Visitante/autenticado | FR-SANTO-007                             |
| UC-SANTO-007 | Otorgar/revocar consentimiento RUM | Visitante             | FR-SANTO-006, FR-SANTO-010               |

### UC-SANTO-001 — Ver ficha de santo

- **Actor:** visitante o usuario autenticado.
- **Precondición:** el santo esta publicado en el CMS.
- **Flujo principal:**
  1. El usuario llega por URL canónica `/santo/[slug]` (o desde listado/búsqueda/santo del día).
  2. El SSR consulta el CMS por slug; con cache tibia, sirve desde cache con revalidación en background.
  3. La app consulta al Motor la fiesta del santo para la fecha actual (calendario vigente; aplica traslaciones con nota).
  4. Render de la ficha: biografía sanitizada, patronazgos, iconografía, atributos, imágenes webp responsive, JSON-LD `Person`.
  5. Si hay sesión, se muestra el estado del favorito (marcado/no) sincronizado con `santopedia.favorites`.
- **Flujos alternos:** slug inexistente → 404 con sugerencias del buscador; CMS caído → intento de cache; sin cache → página de error con reintento; Motor caído → ficha visible con fiesta "no disponible" y banner de degradación.
- **Postcondición:** se emite `santo.viewed` si hay consentimiento.

### UC-SANTO-002 — Buscar santo

- **Actor:** visitante o usuario autenticado.
- **Flujo principal:**
  1. El usuario escribe en el buscador; con >= 2 caracteres y debounce 300ms, se consulta `GET /api/content/santos?q=`.
  2. Se listan resultados con thumbnail y snippet resaltado sobre nombre y patronazgos.
  3. El usuario abre una ficha; la búsqueda se marca exitosa.
- **Flujos alternos:** < 2 caracteres → no se consulta y se muestra hint "Escribe al menos 2 letras"; 0 resultados → estado vacío con sugerencias (categorías y santo del día); error del CMS → estado de error con reintento.
- **Postcondición:** se emite `santo.searched { q, resultados, exito }` si hay consentimiento.

### UC-SANTO-003 — Navegar por categoría

- **Actor:** visitante o usuario autenticado.
- **Flujo principal:** el usuario accede a `/santos` (alfabético) o a una categoría (`/santos?categoria=martires`, papas, doctores, fundadores...), combina filtros de siglo y país, y pagina. Cada ítem enlaza a la ficha.
- **Flujos alternos:** combinación de filtros sin resultados → estado vacío con botón "limpiar filtros"; página fuera de rango → 404 suave con retorno al listado.

### UC-SANTO-004 — Ver santo del día

- **Actor:** visitante o usuario autenticado.
- **Flujo principal:**
  1. SSR consulta al Motor la memoria/fiesta de hoy.
  2. Con la respuesta consulta al CMS los santos coincidentes y renderiza la página con nota litúrgica si hubo traslación.
  3. CTA "ver ficha completa" por cada santo del día.
- **Flujos alternos:** sin fiesta hoy → estado vacío explicativo ("hoy no hay memoria obligatoria"); Motor caído → banner de degradación con último cálculo cacheado del día.

### UC-SANTO-005 — Guardar favorito

- **Actor:** usuario autenticado.
- **Precondición:** sesión válida del Sistema de Logueo.
- **Flujo principal:** el usuario marca/desmarca el corazón en la ficha; `POST/DELETE /api/favoritos` persiste en `santopedia.favorites` (RLS); UI optimista con rollback ante error; `/favoritos` lista su colección ordenada por fecha.
- **Flujos alternos:** sin sesión → 401 y CTA de login conservando la intención (retorno a la ficha); fallo de persistencia → rollback + mensaje de reintento.

### UC-SANTO-006 — Reportar error de contenido

- **Actor:** visitante o usuario autenticado.
- **Flujo principal:** desde la ficha, "Reportar un error" abre un mini-formulario (tipo + comentario); `POST /api/reportes` persiste insert-only en `santopedia.reports` con `session_hash`; confirmación "Gracias, revisaremos el contenido".
- **Flujos alternos:** tipo inválido o comentario vacío → validación en cliente y 400; exceso de reportes desde la misma sesión → rate limit con mensaje amable; la entrada queda en cola editorial del CMS (SLA de corrección 48h).

### UC-SANTO-007 — Consentimiento RUM

- **Actor:** visitante.
- **Flujo principal:** el banner compartido del ecosistema solicita consentimiento; al aceptar, se inicializa el SDK RUM y los eventos de la sesión fluyen; al rechazar, no se inicializa.
- **Flujos alternos:** revocación posterior detiene el envío inmediatamente; sin decisión no hay instrumentación.

## 3. Reglas de negocio

| ID           | Regla                                                                                                                                                               | FR                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| RB-SANTO-001 | El contenido mostrado SIEMPRE proviene del CMS; prohibido hardcodear o duplicar fichas de santos en la app.                                                         | FR-SANTO-001, FR-SANTO-002, FR-SANTO-003 |
| RB-SANTO-002 | La fecha de fiesta SIEMPRE se resuelve contra el Motor Litúrgico; prohibido calcular fechas localmente o leer campos de fecha crudos del CMS como fuente de verdad. | FR-SANTO-004, FR-SANTO-001               |
| RB-SANTO-003 | El buscador exige mínimo 2 caracteres; con menos no se emite request ni se muestran resultados parciales.                                                           | FR-SANTO-003                             |
| RB-SANTO-004 | Favoritos solo para usuarios autenticados; anónimo recibe CTA de login, nunca escritura.                                                                            | FR-SANTO-005                             |
| RB-SANTO-005 | Toda imagen se sirve webp responsive con lazy loading fuera del viewport y dimensiones explícitas (anti-CLS).                                                       | FR-SANTO-008                             |
| RB-SANTO-006 | Cada ficha emite JSON-LD `schema.org/Person` con canonical por slug; sin JSON-LD la página no pasa QA.                                                              | FR-SANTO-009                             |

## 4. Validaciones y errores

| ID        | Situación                                    | Validación / Manejo                                                                                                               | Código                   |
| --------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| SANTO-001 | Slug con formato inválido o no existente     | Validación server-side del patrón de slug (`^[a-z0-9]+(?:-[a-z0-9]+)*$`); si no matchea o el CMS no lo tiene → 404 con buscador.  | 404                      |
| SANTO-002 | `q` con < 2 caracteres                       | Se bloquea en cliente (no request) y el endpoint también rechaza (400) por defensa en profundidad.                                | 400                      |
| SANTO-003 | Favorito sin sesión                          | 401 con `Location`/CTA de login y retorno a la ficha tras autenticar.                                                             | 401                      |
| SANTO-004 | Reporte con tipo inválido o comentario vacío | Validación de enum de tipos y comentario requerido (1..1000 chars); 400 con mensajes de campo.                                    | 400                      |
| SANTO-005 | CMS o Motor no disponibles                   | Estado degradado: servir desde cache SSR (CMS) o último cálculo diario (Motor) + banner informativo; sin stack traces al usuario. | 503 (fallback cache 200) |

## 5. Estados de la interfaz

| Componente     | Loading                                 | Empty                                       | Error                                   | Success                                 | Degraded                                                          |
| -------------- | --------------------------------------- | ------------------------------------------- | --------------------------------------- | --------------------------------------- | ----------------------------------------------------------------- |
| Ficha de santo | Skeleton del layout de ficha            | n/a (404 suave con buscador)                | Página de error con reintento           | Ficha completa con fiesta resuelta      | Ficha desde cache + banner "contenido puede estar desactualizado" |
| Listado        | Skeleton de grid de cards               | "No hay santos con estos filtros" + limpiar | Error con reintento                     | Grid paginado                           | Grid desde cache + banner                                         |
| Buscador       | Spinner inline en dropdown              | Sin resultados + sugerencias                | "No pudimos buscar, reintentá"          | Resultados con snippet                  | Resultados cacheados + banner                                     |
| Santo del día  | Skeleton de portlet                     | "Hoy no hay memoria obligatoria"            | Banner de degradación + último cacheado | Santo(s) del día con nota litúrgica     | Cálculo cacheado + banner                                         |
| Favoritos      | Estados de botón (marcando/desmarcando) | "Aún no tenés favoritos"                    | Rollback + mensaje de reintento         | Colección ordenada                      | n/a                                                               |
| Reporte        | Estado enviando en el formulario        | n/a                                         | "No se pudo enviar, reintentá"          | Confirmación "revisaremos el contenido" | n/a                                                               |

## 6. Trazabilidad FRD → SRS

| UC           | FR                                       | RB                                                     | Errores              |
| ------------ | ---------------------------------------- | ------------------------------------------------------ | -------------------- |
| UC-SANTO-001 | FR-SANTO-001, FR-SANTO-008, FR-SANTO-009 | RB-SANTO-001, RB-SANTO-002, RB-SANTO-005, RB-SANTO-006 | SANTO-001, SANTO-005 |
| UC-SANTO-002 | FR-SANTO-003                             | RB-SANTO-001, RB-SANTO-003                             | SANTO-002, SANTO-005 |
| UC-SANTO-003 | FR-SANTO-002                             | RB-SANTO-001                                           | SANTO-001, SANTO-005 |
| UC-SANTO-004 | FR-SANTO-004                             | RB-SANTO-002                                           | SANTO-005            |
| UC-SANTO-005 | FR-SANTO-005                             | RB-SANTO-004                                           | SANTO-003            |
| UC-SANTO-006 | FR-SANTO-007                             | RB-SANTO-001                                           | SANTO-004            |
| UC-SANTO-007 | FR-SANTO-006, FR-SANTO-010               | —                                                      | —                    |

Los comportamientos definidos aquí se cubren con TC-SANTO-001 a 015 en [05-Tests Unitarios](05-Tests%20Unitarios.md) y se modelan como secuencias en [04-Flujos y Secuencias](04-Flujos%20y%20Secuencias.md).
