---
name: ecosystem-ui-ux
description: >-
  Fósforo monorepo UI/UX: shared tokens, light/dark theme (data-theme), mandatory
  mobile hamburger nav, Astro View Transitions (ClientRouter), skeleton loading,
  Bento grids. Use for tema claro/oscuro, hamburguesa, view transitions, skeleton,
  grillas, bento, packages/tailwind-config, packages/ui, apps Astro.
---

# UI/UX del ecosistema Fósforo

Guía **específica del monorepo Fósforo** para que todas las apps se perciban como un solo producto. Complementa **ui-ux-pro-max** y **tailwind-css-patterns**; prioriza **tokens**, **tema claro/oscuro**, **navegación móvil con menú hamburguesa**, **View Transitions de Astro**, **skeleton en carga** y **layout Bento** donde aplique.

## Superficies del monorepo

Apps en `apps/`: **auth**, **biblia**, **calendario**, **cancionero**, **misal**, **oraciones**, **portal**, **santopedia**. Paquetes UI compartidos: **`packages/ui`**, **`packages/tailwind-config`**.

## Fuente de verdad de color (no inventar paleta)

Los colores del ecosistema están definidos en:

- `packages/tailwind-config/shared-styles.css` — bloque `@theme` (marca `--color-brand-*`, escalas base, semánticos) y **`:root`** para **modo oscuro por defecto**. Bloque **`html[data-theme="light"]`** para **modo claro** (papel cálido, texto carbón, acentos brand oscurecidos para contraste, bordes y sombras suaves en tono cálido).
- `packages/ui/src/foundation.css` — import de `@repo/tailwind-config`, `body` y halos de fondo; variante **`html[data-theme="light"] body`** para halos acordes al modo claro.

**Reglas:** no introducir hex arbitrarios para marca o fondo; ampliar el tema solo en `shared-styles.css` (o derivados con `color-mix` / opacidad desde variables existentes). En componentes y CSS de apps, usar **`var(--color-*)`** y alias ya mapeados (`--bg-dark`, `--text-light`, etc.) para que respeten claro/oscuro. Evitar **cromas fijas** tipo `rgba(7, 7, 7, …)` en cabeceras o pills: preferir `color-mix(in srgb, var(--color-bg) …, transparent)` o `var(--color-surface)`.

### Tema claro y oscuro (obligatorio en producto)

- El usuario debe poder **alternar tema claro y oscuro** de forma explícita (control accesible: botón o interruptor, con `aria-label` que indique el modo al que cambia).
- **Contrato técnico:** persistir la elección (p. ej. `localStorage`) y aplicarla en **`<html data-theme="light">` o `data-theme="dark"`**. El modo por defecto sin preferencia guardada puede seguir **oscuro** o alinearse a `prefers-color-scheme` si el equipo lo define; lo no negociable es el **toggle** y la **coherencia con los tokens** anteriores.
- **Sin FOUC recomendado:** script inline mínimo en el layout (antes del CSS o justo al abrir `body`) que lea la preferencia guardada y asigne `data-theme` antes del primer paint, cuando el producto lo requiera.

## Navegación móvil: menú hamburguesa (obligatorio)

En **viewport móvil** (por debajo del breakpoint de navegación principal del layout, típicamente `< md` / `48rem` salvo que la app documente otro):

- La **barra principal de enlaces** no debe quedar como fila apretada ilegible: debe **colapsarse** y exponerse un **botón menú hamburguesa** (tres líneas o icono equivalente, con `aria-expanded`, `aria-controls` apuntando al panel, y **etiqueta accesible**).
- Al activarlo, mostrar **panel deslizante, drawer o full-screen** con los mismos enlaces y acciones relevantes (incluido **acceso al cambio de tema** si vive en cabecera).
- **Teclado y foco:** `Esc` cierra donde aplique; foco visible; orden de tab lógico dentro del panel.
- **Cohesión:** mismo patrón en todas las apps Astro del ecosistema salvo excepción documentada.

## Astro: View Transitions nativas (obligatorio en apps Astro)

Las páginas que usen layout común deben integrar las **View Transitions de Astro** (SPA-like sin abandonar el modelo de Astro):

1. En el layout raíz (`<head>`): importar **`ClientRouter`** desde **`astro:transitions`** y renderizar **`<ClientRouter />`**.
2. En contenedores de página o layout: usar **`transition:animate`**, **`transition:name`** o **`transition:persist`** según el caso (p. ej. `fade` / `slide` desde **`astro:transitions`** en el shell o main) para que las navegaciónes **entre rutas** tengan transición suave **nativa del runtime de Astro**, no sustitutos ad hoc con animaciónes globales que rompan el historial.
3. Elementos que no deben animarse en la primera carga pueden usar **`transition:animate="initial"`**; bloques que deben quedar estables: **`transition:persist`** cuando corresponda.

Detalle de API: ver **`.agents/skills/astro-framework/references/view-transitions.md`**.

## Dirección visual: moderna y simple

- **Jerarquía clara:** familias del tema (sans/serif/mono en `shared-styles.css`); títulos legibles, cuerpo cómodo, muted para secundario.
- **Cromática contenida:** acento cálido de marca en ambos modos; halos suaves en `body` definidos en `foundation.css` (oscuro y claro).
- **Superficies limpias:** `var(--color-surface)` / `--color-line`, radios `--radius-*`, sombras del tema.
- **Espaciado del sistema:** escala `--spacing-*`.

## Skeleton en carga (obligatorio)

Mientras un componente o vista espere datos, lazy load o hidratación perceptible, mostrar **skeleton** que imite la geometría del contenido (incl. Bento si aplica), con tokens de superficie; no pantalla vacía ni solo spinner de página como sustituto del layout.

## Grillas de imágenes y/o tarjetas → layout **Bento** (obligatorio)

Galerías, mosaicos y grillas de tarjetas: **CSS Grid** asimétrico con **spans** variables, `gap` con tokens, imágenes `object-fit: cover`, responsive a columna única en móvil.

## Cohesión entre apps (resumen)

1. **Una fuente de verdad** para color y tema: `shared-styles.css` + `foundation.css`.
2. **Misma semántica de estados** (vacío, error, carga con skeleton).
3. **Paridad a11y** y **mismo patrón móvil** (hamburguesa + tema).
4. **View Transitions** activas en layouts Astro compartidos o por app, de forma coherente.

## Checklist rápido ante un cambio UI

- [ ] `shared-styles.css` / `foundation.css` revisados; tema vía `data-theme` respetado.
- [ ] **Móvil:** ¿hay hamburguesa y panel de nav al colapsar la barra?
- [ ] **Astro:** ¿`<ClientRouter />` y directivas de transición en el layout o páginas?
- [ ] ¿Toggle claro/oscuro accesible y persistido?
- [ ] ¿Grilla de imágenes o tarjetas? → **Bento** + **skeleton** en carga.
- [ ] ¿Cambio en paquete compartido? → consumidoras y regresiones.

## Salida esperada del agente

- Citar rutas del repo (tema, foundation, layout Astro).
- Implementar o revisar **hamburguesa**, **ClientRouter + transiciones**, **toggle de tema** y **paleta clara** solo a través de los tokens definidos.
- Proponer Bento y skeleton según reglas anteriores.
