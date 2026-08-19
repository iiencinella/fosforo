---
tags:
  - proyecto/fosforo
  - calendario
  - novedades
  - widget
type: app-changelog
area: aplicaciónes
status: vigente
created: 2026-08-14
related:
  - "[[00-README|0103 Calendario]]"
---

# Novedas - 2026-08-14 (Widget)

## Widget embebible de jornada del día

Se creó un widget web embebible vía iframe que muestra la jornada litúrgica del día actual (fecha, celebración, tipo, lecturas y tags litúrgicos) con un enlace al calendario completo para ver más detalles. El widget es autónomo, con estilos inline y soporte para tema claro/oscuro.

### Archivos creados

- `src/apps/calendario/src/pages/widget/day.astro` — Página Astro embebible que resuelve la jornada del día server-side usando `getDayByDate`.
- `src/apps/calendario/src/styles/cal-widget.css` — Estilos scoped al widget usando tokens del ecosistema (`@repo/ui/foundation.css`).

### Comportamiento

- Resuelve la fecha actual en el servidor usando `getDayByDate` del calendario.
- Muestra: fecha formateada (weekdayLabel), título de celebración, tags litúrgicos (rango, color con dot, tiempo litúrgico, ciclo, mariana, argentina), lecturas del día (label + reference en cards clicables) y un CTA "Ver calendario →" que enlaza a `/?date=YYYY-MM-DD`.
- Toggle de tema claro/oscuro inline (sin React, JS vanilla).
- Soporta el query param `?theme=light|dark` (default: `dark`).
- No recibe otros parámetros de entrada.

### Snippet de embebido

```html
<iframe
  src="https://calendario.fosforo.org/widget/day?theme=dark"
  width="420"
  height="480"
  frameborder="0"
  style="border-radius: 12px;"
  title="Jornada litúrgica del día"
></iframe>
```

### Validaciones ejecutadas

- `pnpm --filter calendario check-types` (`astro check`): 0 errores, 0 warnings, 0 hints.

### Documentación de soporte

- `docs/02-Aplicaciones/FASE_1-0103_calendario/WEB/00-README.md`: actualizado estado de implementación.
- `docs/02-Aplicaciones/FASE_1-0103_calendario/WEB/09-Especificacion Tecnica.md`: actualizado con módulo `widget` y sección UI/UX del widget embebible.
