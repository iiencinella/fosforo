---
tags:
  - proyecto/fosforo
  - calendario
  - arquitectura
  - especificación-tecnica
  - aplicación
type: app-tech-spec
area: aplicaciónes
status: vigente
created: 2026-03-07
updated: 2026-08-14
related:
  - "[[00-README|0103 Calendario]]"
---

# Especificacion Tecnica - 0103 Calendario

## Herramientas y tecnologias

- Plataforma: WEB
- Framework principal: Astro para routing, render híbrido y endpoints.
- Lenguaje principal: TypeScript.
- Herramientas de build: Astro build, pnpm y Turborepo.
- Testing: Vitest para lógica, servicios, validadores y adaptadores; integración Supabase y E2E HTTP opt-in en `tests/integration` y `tests/e2e`.

## Arquitectura tecnica

- Patrón de arquitectura: app web por capas con páginas Astro, layout compartido, componentes de UI, servicios server-side, mapeadores de contrato y endpoints HTTP.
- Modulos principales: `home/today`, `calendar-grid`, `day-detail`, `related-links`, `api`, `services`, `validation`, `observability`, `shared-ui`, `info-secondary` (sección de info secundaria con estado del dataset, fuente de verdad y MVP), `widget` (widget embebible de jornada del día vía iframe).
- Dependencias compartidas: `@repo/ui`, `@repo/tailwind-config`, contratos y estilos del ecosistema, y Supabase como persistencia de datos litúrgicos.

## Modelos de datos

- Modelo 1: `liturgy_daily_readings` como entidad base de jornada diaria (`reading_date`, `celebration_name`, lecturas, ciclo, semana y metadatos del alcance litúrgico).
- Modelo 2: `liturgy_day_profiles` como proyección mensual por `MM-DD` para enriquecer fechas futuras cuando no exista match exacto en `liturgy_daily_readings`.
- Modelo 3: tablas satélite de apoyo (`liturgy_day_saints`, `liturgy_day_links`) para enriquecer experiencia y reutilización sin duplicar la entidad base.
- Modelo 4: DTOs públicos (`CalendarDayDto`, `CalendarMonthDto`, `RelatedLinkDto`) para desacoplar la UI y los consumidores del shape SQL, incluyendo metadata enriquecida de perfiles mensuales cuando la fecha no tenga match exacto.

## Endpoints (si aplica)

| Metodo | Ruta                  | Proposito                                                                                                       |
| ------ | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/health`         | Exponer salud básica y versión desplegada del calendario.                                                       |
| GET    | `/api/calendar/day`   | Devolver la jornada litúrgica normalizada para una fecha válida o para el día actual.                           |
| GET    | `/api/calendar/month` | Devolver la estructura mensual normalizada con metadata de cada fecha disponible y un resumen agregado del mes. |

Los endpoints del MVP se implementan como capa pública y de consumo interno del ecosistema. La UI debe consumir esta capa o servicios server-side equivalentes, sin acceso directo del cliente a Supabase.

Las respuestas exitosas de `day` y `month` usan cache compartido de 5 minutos con stale-while-revalidate; errores y health usan `no-store`. Los errores de infraestructura se registran como eventos JSON server-side y se responden con mensajes genéricos y estado `503`.

La resolución diaria sigue este orden: 1) match exacto en `liturgy_daily_readings`, 2) fallback por `MM-DD` en `liturgy_day_profiles`, 3) fallback heurístico final sobre el dataset base si el perfil mensual no existiera. Cuando la resolución usa perfil mensual, el contrato debe exponer metadata complementaria como rango litúrgico, banderas marianas/argentinas y nota de fuente. La vista mensual también debe publicar `metadataSummary` para simplificar consumidores que necesiten métricas o badges agregados sin reprocesar cada día en cliente.

## Consideraciónes UI/UX

- Layout principal: hero compacto al inicio (`#today`) con kicker, título, subtítulo y meta-bar de pills informativas. Inmediatamente después, el calendario mensual y el detalle del día se muestran juntos en `calendar-shell` (grid de 2 columnas en desktop: calendario a la izquierda, aside Sticky a la derecha). Se eliminó la tarjeta "Jornada seleccionada" del hero para evitar duplicación con el aside.
- Celdas del calendario minimalistas: cada celda muestra solo el número del día y un punto del color litúrgico correspondiente (verde, morado, blanco, rojo, rosa vía `data-lit`). Los textos de festividad, flags de rango/AR/Mariana y chips de tiempo litúrgico no se renderizan en las celdas: esa información vive en la tarjeta del día seleccionado (aside). Las celdas mantienen `aria-label` con número, mes y celebración para lectores de pantalla.
- Vista móvil (<720px): la grilla mensual, toolbar y leyenda se ocultan; se muestra una barra de navegación por día (`calendar-day-nav`) con flechas "Día anterior"/"Día siguiente" que navegan via query param `?date=YYYY-MM-DD` (la navegación cruza meses automáticamente) seguida del detalle de la jornada. El `calendar-shell` colapsa a una columna desde <960px.
- Hero legible: los textos del hero llevan contorno oscuro (`paint-order: stroke fill` + `-webkit-text-stroke`) porque el halo radial brand-50 del fondo lava las letras claras, especialmente en modo oscuro.
- Aside Sticky (`calendar-aside`): el panel de detalle del día usa `position: sticky; top: 88px` en desktop para acompanar el scroll del calendario. En móvil (<960px) vuelve a `position: static`.
- Sección de info secundaria (`#info`): las tarjetas "Que resuelve este MVP", "Fuente de verdad" y "Estado del dataset" se muestran en un grid de 3 columnas debajo del calendario y el aside, como información secundaria.
- Header: los botones de "Ingresar" y "Crear Cuenta" están ocultos vía `hideAuth={true}` en `PortalHeader`. La navegación principal enlaces a `#today`, `#info`, `#ecosystem` y `#api`.
- Navegación principal: shell visual del ecosistema con header, tema claro/oscuro, transiciónes y navegación móvil consistente.
- Estados de interfaz (loading/empty/error/success): skeleton para cargas, mensaje vacío explícito, error recuperable y éxito visual con día activo bien identificado.
- Accesibilidad base: foco visible, navegación por teclado en la grilla, contraste AA, labels explícitos donde aplique y respeto de `prefers-reduced-motion`.
- Estética: reutilización obligatoria de `@repo/ui`, `foundation.css`, `calendar.css` y tokens compartidos; el CSS local (`calendario.css`) solo debe resolver piezas de dominio no generalizables.
- Widget embebible (`/widget/day`): página Astro autónoma embebible vía iframe que muestra la jornada litúrgica del día actual (celebración, tipo, lecturas, tags litúrgicos) con soporte de tema claro/oscuro mediante query param `?theme=light|dark` (default: `dark`). No recibe otros parámetros. Incluye un botón toggle de tema y un enlace al calendario completo. Estilos inline en `cal-widget.css` con tokens del ecosistema, sin `@repo/ui` runtime activo en el iframe.

## Limitación operativa conocida

- En Windows, `pnpm build` puede fallar al final del empaquetado con `@astrojs/vercel` por `EPERM` al crear symlinks dentro de `.vercel/output/functions/`.
- La falla no bloquea `pnpm check-types` ni `pnpm test:unit`, y no indica un problema funcional del dominio `calendario`; corresponde al paso de bundling del adaptador Vercel en este entorno.
- Recomendación operativa: ejecutar builds productivos en CI Linux, WSL o una terminal con permisos de symlink habilitados (por ejemplo, Windows Developer Mode).
- Mientras esa condición no esté disponible, usar `check-types` + `test:unit` como validación local mínima y reservar `build` para entornos compatibles con symlinks.
