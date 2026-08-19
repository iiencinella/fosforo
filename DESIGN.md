---
name: Fósforo
description: Sistema de diseño y directivas UI/UX para el proyecto Fósforo
---

## Design Tokens

### Colores

#### Colores de Marca

- `--color-brand-50: #fff5e8`
- `--color-brand-100: #ffe9cc`
- `--color-brand-300: #ffd080`
- `--color-brand-500: #ffb762`
- `--color-brand-600: #f59d6a`
- `--color-brand-700: #d47a46`

#### Colores de Superficie (Tema Oscuro)

- `--color-surface-0: #070707` (bg-dark)
- `--color-surface-50: #0b0b0d` (bg-dark-2)
- `--color-surface-100: #121216`
- `--color-surface-200: #1a1b20`

#### Colores de Texto

- `--color-text-primary: #f8fafc` (text-light)
- `--color-text-secondary: #cbd5e1`
- `--color-text-muted: #94a3b8` (muted)

#### Colores de Borde

- `--color-border-subtle: rgba(255, 255, 255, 0.06)` (line)
- `--color-border-default: rgba(255, 255, 255, 0.1)`

#### Colores de Estado

- `--color-success-500: #2f9e44`
- `--color-warning-500: #d49a14`
- `--color-danger-500: #d94848`
- `--color-info-500: #4dabf7`

#### Colores de Acento

- `--color-accent: var(--color-brand-300)` (accent)
- `--color-accent-strong: var(--color-brand-600)` (accent-strong)

#### Colores Litúrgicos (App Calendario)

- `--lit-green: #1e7a4b` (tiempo ordinario)
- `--lit-purple: #6a2b73` (cuaresma, adviento)
- `--lit-white: #e7d9bb` (pascua, navidad)
- `--lit-red: #b03a2e` (solemnidades)
- `--lit-rose: #c07b63` (gaudete, laetare)

#### Marca Extendida

- `--color-blue-1000: #2a8af6`
- `--color-purple-1000: #a853ba`
- `--color-red-1000: #e92a67`

### Tipografía

#### Familias de Fuentes

- `--font-sans: "Manrope", "IBM Plex Sans", "Segoe UI", sans-serif`
- `--font-serif: "Fraunces", "Iowan Old Style", "Apple Garamond", serif`
- `--font-mono: "IBM Plex Mono", "Consolas", monospace`

#### Escala Tipográfica

- Título hero: `clamp(2.6rem, 4vw, 4rem)` (portal), `clamp(2.4rem, 3.6vw, 3.6rem)` (calendario)
- Título de sección: `2rem`
- Título de tarjeta: `1.4rem` (portal), `1rem` (catálogo)
- Cuerpo: `1rem` a `1.1rem`
- Pequeño/meta: `0.85rem` a `0.95rem`
- Kicker/eyebrow: `0.82rem` a `0.95rem`, uppercase, `letter-spacing: 0.2em`
- Breadcrumbs: `0.85rem`

### Espaciado

- `--spacing-1: 0.25rem`
- `--spacing-2: 0.5rem`
- `--spacing-3: 0.75rem`
- `--spacing-4: 1rem`
- `--spacing-5: 1.25rem`
- `--spacing-6: 1.5rem`
- `--spacing-8: 2rem`
- `--spacing-10: 2.5rem`
- `--spacing-12: 3rem`
- `--spacing-16: 4rem`

### Radio de Borde

- `--radius-xs: 0.375rem`
- `--radius-sm: 0.625rem`
- `--radius-md: 1rem`
- `--radius-lg: 1.375rem`
- Botones: `999px` (forma pills)
- Elementos pequeños: `8px` a `14px`

### Sombras

- `--shadow-soft: 0 10px 24px rgba(0, 0, 0, 0.2)`
- `--shadow-medium: 0 22px 60px rgba(0, 0, 0, 0.35)` (shadow)

### Transiciones

- `--transition-fast: 160ms ease`
- `--transition-default: 220ms ease`
- Hover transforms: `translateY(-1px)` a `translateY(-4px)`

### Breakpoints

- `--breakpoint-sm: 40rem` (640px)
- `--breakpoint-md: 48rem` (768px)
- `--breakpoint-lg: 64rem` (1024px)
- `--breakpoint-xl: 80rem` (1280px)
- Ancho máximo del container: `--container-max-width: 1120px`
- Padding del container: `--container-padding-inline: 4vw`

---

## Estilos Globales

### Reset Base

- `box-sizing: border-box` (universal)
- `scroll-behavior: smooth`
- `-webkit-font-smoothing: antialiased`
- `-moz-osx-font-smoothing: grayscale`

### Fondo del Body

```
radial-gradient(circle at 15% 0%, rgba(255, 208, 128, 0.06), transparent 35%),
radial-gradient(circle at 100% 12%, rgba(245, 157, 106, 0.1), transparent 40%),
var(--color-bg)
```

### Estilos de Enlaces

- Color: `var(--color-accent)`
- Hover: `var(--color-accent-strong)`
- Sin decoración de texto por defecto

### Estilos de Focus

- `outline: none`
- `box-shadow: var(--focus-ring: 0 0 0 3px rgba(255, 208, 128, 0.25))`
- Alternativa: `outline: 2px solid var(--color-brand-300); outline-offset: 2px`

### Esquema de Color

- `color-scheme: dark` (root)

---

## Patrones de Componentes

### Botones

#### Botón Primario

```css
border-radius: 999px;
background: linear-gradient(
  135deg,
  var(--color-brand-500) 0%,
  var(--color-brand-600) 100%
);
color: #1a120c;
font-weight: 600;
padding: 0.75rem 1.125rem;
transition:
  transform var(--transition-default),
  background var(--transition-default);
```

- Hover: `translateY(-1px)`, gradiente más claro

#### Botón Secundario

```css
background: transparent;
border-color: var(--color-line);
color: var(--color-text);
```

- Hover: `background: var(--color-surface-strong)` o `rgba(255, 255, 255, 0.65)`

#### Estado Deshabilitado

- `opacity: 0.6`
- `cursor: not-allowed`
- `filter: saturate(0.9)`

### Tarjetas

#### Tarjeta de Superficie (Estándar)

```css
background: var(--color-surface);
border: 1px solid var(--color-line);
border-radius: var(--radius-md);
box-shadow: var(--shadow-soft);
padding: 18px;
```

#### Tarjeta Hero

```css
background: var(--color-surface);
border-radius: var(--radius-lg);
border: 1px solid var(--color-line);
box-shadow: var(--shadow-medium);
```

#### Tarjeta de App

```css
min-height: 190px;
transition:
  transform 0.2s ease,
  box-shadow 0.2s ease;
```

- Hover: `translateY(-4px)`, `box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4)`

#### Resaltado de Borde Animado

Las tarjetas deben resaltar del contenido con un borde animado con difuminación:

```css
position: relative;
border: 1px solid transparent;
background:
  linear-gradient(var(--color-surface), var(--color-surface)) padding-box,
  linear-gradient(135deg, rgba(255, 208, 128, 0.4), rgba(245, 157, 106, 0.1))
    border-box;
animation: border-glow 3s ease-in-out infinite alternate;
```

```css
@keyframes border-glow {
  0% {
    border-image: linear-gradient(
        135deg,
        rgba(255, 208, 128, 0.3),
        rgba(245, 157, 106, 0.1)
      )
      1;
    box-shadow: 0 0 20px rgba(255, 208, 128, 0.05);
  }
  100% {
    border-image: linear-gradient(
        135deg,
        rgba(255, 208, 128, 0.6),
        rgba(245, 157, 106, 0.3)
      )
      1;
    box-shadow: 0 0 30px rgba(255, 208, 128, 0.12);
  }
}
```

- El borde debe usar `border-image` con gradientes semitransparentes
- La animación debe ser sutil (`3s ease-in-out infinite alternate`)
- El `box-shadow` difuminado refuerza el efecto de profundidad
- Respetar `prefers-reduced-motion: reduce` desactivando la animación

### Formularios

#### Input/Textarea/Select

```css
border-radius: 12px;
border: 1px solid var(--color-line);
background: rgba(255, 255, 255, 0.04); /* portal */
background: var(--color-surface-strong); /* catalog, biblia */
color: var(--color-text);
padding: 12px 14px;
font-family: var(--font-sans);
```

#### Labels

- `font-size: 0.85rem`
- `color: var(--color-muted)`

#### Opciones de Select

- `background-color: #0b0b0d`
- `color: var(--color-text)`

### Navegación

#### Header (Sticky)

```css
position: sticky;
top: 0;
z-index: 20;
backdrop-filter: blur(14px);
background: rgba(7, 7, 7, 0.82);
border-bottom: 1px solid var(--color-line);
```

#### Logo

```css
font-family: var(--font-serif);
font-size: 1.25rem;
letter-spacing: 0.02em;
```

- Logo mark: `width: 36px, height: 36px, border-radius: 50%, gradient background`

#### Enlaces de Nav

- `display: flex`
- `gap: 18px`
- `font-size: 0.95rem`
- `color: var(--color-muted)`
- Oculto en mobile (`max-width: 900px`)

### Breadcrumbs

```css
display: flex;
flex-wrap: wrap;
gap: 10px;
font-size: 0.85rem;
color: var(--color-muted);
```

- Activo: `color: var(--color-accent), font-weight: 600`
- Separador: `/` con `opacity: 0.5`

### Encabezado de Sección

```css
display: flex;
align-items: flex-end;
justify-content: space-between;
gap: 24px;
margin-bottom: 32px;
```

#### Pill/Kicker

```css
display: inline-flex;
padding: 4px 10px;
border-radius: 999px;
font-size: 0.75rem;
background: rgba(255, 208, 128, 0.12);
color: var(--color-accent);
font-weight: 600;
letter-spacing: 0.03em;
```

### Indicadores de Estado

#### Estado con Punto

```css
display: inline-flex;
gap: 6px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.08em;
font-size: 0.65rem;
```

- Estable: `background: #2f9e44`
- Beta: `background: #d49a14`
- Desarrollo: `background: #4dabf7`
- Idea: `background: #845ef7`

### Patrones de Grilla

**Patrón Bento**: Todas las grillas (ya sea de imágenes, tarjetas o contenido) deben usar el patrón Bento. Esto implica:

- Variedad de tamaños de celdas (no todas del mismo tamaño)
- Combinación de celdas grandes y pequeñas para crear jerarquía visual
- Uso de `grid-template-areas` o spans para crear un diseño asimétrico y dinámico
- Las imágenes destacadas deben ocupar 2x2 o áreas más grandes
- Las tarjetas secundarias pueden ser más compactas
- Mantener el `gap` consistente con el diseño (18px para cards, 14px para filtros)

Ejemplo de estructura Bento:

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: 18px;
}

.bento-item-large {
  grid-column: span 2;
  grid-row: span 2;
}

.bento-item-medium {
  grid-column: span 1;
  grid-row: span 2;
}

.bento-item-small {
  grid-column: span 1;
  grid-row: span 1;
}
```

#### Grilla de Apps

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
gap: 18px;
```

#### Grilla de Blog

```css
grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
```

#### Grilla de Filtros

```css
grid-template-columns: minmax(240px, 1.2fr) repeat(2, minmax(180px, 0.8fr)) auto;
gap: 14px;
```

#### Dos Columnas

```css
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 26px;
```

### Sección Hero

```css
min-height: 100vh;
display: grid;
place-items: center;
border-radius: var(--radius-lg);
background: var(--color-bg-elevated);
position: relative;
overflow: hidden;
```

- Media overlay: gradiente desde los lados y abajo
- Video: `opacity: 0.5`, `object-fit: cover`

---

## Temas Específicos de Apps

### Portal (Tema Oscuro)

- Base: Oscuro con gradientes radiales
- Header: Sticky con backdrop blur
- Components: portal.css

### Calendario (Tema Claro)

```css
--bg-dark: #f6f1e6;
--bg-dark-2: #f3ece0;
--text-light: #2b1f14;
--muted: #6e5b4f;
--card-bg: rgba(255, 255, 255, 0.75);
--accent: #b15e2f;
--accent-strong: #8f4b1f;
--line: rgba(43, 31, 20, 0.14);
```

- Background: `radial-gradient(circle at top, #fff8ec 0%, #f6f1e6 45%, #efe6d6 100%)`
- Colores litúrgicos para días del calendario

### Biblia (Tema Oscuro - Serif)

- Fuente: `--font-serif` para el cuerpo
- Background: `radial-gradient(circle at top, rgba(255, 208, 128, 0.18), transparent 34%)`
- Estilo de cita: `border-left: 3px solid rgba(255, 208, 128, 0.35)`

### Santopedia (Tema Oscuro - Catálogo)

- Extiende catalog.css
- Background: Múltiples gradientes radiales
- Sticky header con `backdrop-filter: blur(10px)`
- Tarjetas de perfil con gradiente overlay

### Widget de Calendario (Claro Independizado)

```css
font-family: "Nunito Sans", "Segoe UI", Tahoma, sans-serif;
color: #1f1f1f;
background: linear-gradient(145deg, #fffdf8 0%, #fbf4e9 100%);
border: 1px solid #eadfcf;
```

- Puntos de color litúrgico: verde, blanco, rojo, morado, rosa, predeterminado

### App Móvil (React Native)

```javascript
screenBackground: "#f7f8fc"
card: { backgroundColor: "#ffffff", borderRadius: 12, borderColor: "#dbe3f0" }
primaryButton: { backgroundColor: "#153b75", borderRadius: 8 }
text: { color: "#2f4664" }
muted: { color: "#5f7086" }
```

---

## Diseño Responsivo

### Breakpoints

- `900px`: Apilar hero, dos columnas, apps-filtros; ocultar nav-links
- `720px`: Una columna calendario, ajustar padding
- `640px`: Ajustar padding hero, section-header a columna, overlay de gradiente más fuerte
- `360px`: Ajustes de widget (texto más pequeño, padding)

### Adaptaciónes Móvil

- Hero: `grid-template-columns: 1fr`
- Dos columnas: `grid-template-columns: 1fr`
- Apps filtros: `grid-template-columns: 1fr`
- Nav: A veces `flex-direction: column`

---

## Accesibilidad

### Focus Visible

```css
:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
/* O */
:focus-visible {
  outline: 2px solid var(--color-brand-300);
  outline-offset: 2px;
}
```

### Skip Links

```css
position: absolute;
left: 12px;
top: -120px;
z-index: 40;
/* Focus se mueve a top: 12px */
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

### Contraste de Color

- Texto sobre superficies: `#f8fafc` sobre `#121216` (4.5+:1)
- Texto muted: `#94a3b8` para información secundaria
- Colores de estado cumplen WCAG AA

---

## Estilos de Contenido Markdown

```css
h2: font-size: 1.4rem, font-weight: 600, margin: 28px 0 12px
h3: font-size: 1.1rem, font-weight: 600, margin: 20px 0 10px
p: margin: 0 0 14px, line-height: 1.65
ul, ol: margin: 0 0 14px, padding-left: 22px
li: margin-bottom: 6px, line-height: 1.5
strong: font-weight: 600
```

---

## Bloques de Código

```css
font-family: var(--font-mono);
font-size: 0.86rem;
color: #ffe8c9;
background: rgba(0, 0, 0, 0.32);
border: 1px solid var(--color-line);
border-radius: 12px;
padding: 14px;
overflow-x: auto;
```

---

## Mensajes de Estado de Formularios

### Pendiente

```css
background: rgba(255, 255, 255, 0.02);
color: var(--color-muted);
border: 1px solid rgba(255, 255, 255, 0.04);
```

### Éxito

```css
background: rgba(139, 212, 139, 0.12);
color: #8bd48b;
border: 1px solid rgba(139, 212, 139, 0.18);
```

### Error

```css
background: rgba(255, 123, 123, 0.08);
color: #ff7b7b;
border: 1px solid rgba(255, 123, 123, 0.12);
```

---

## Directrices de Animación

- Usar función de timing `ease`
- Interacciones rápidas: `160ms`
- Transiciones por defecto: `220ms`
- Hover transforms: `translateY(-1px a -4px)`
- Siempre respetar `prefers-reduced-motion`
- Usar `motion-reduce: ui:transform-none` para prefijo Tailwind

---

## Estructura de Archivos

### Archivos del Sistema de Diseño

- `packages/tailwind-config/shared-styles.css` - Design tokens
- `packages/ui/src/foundation.css` - Estilos base, reset, app shell
- `packages/ui/src/portal.css` - Componentes del portal
- `packages/ui/src/catalog.css` - Componentes de catálogo/santopedia
- `packages/ui/src/calendar.css` - Componentes del calendario (tema claro)

### Estilos de Apps

- `apps/portal/src/styles/portal-entry.css` - Entrada del portal
- `apps/calendario/src/styles/calendario-home.css` - Home del calendario
- `apps/calendario/src/styles/calendario-widget.css` - Widget (independiente)
- `apps/biblia/src/styles/biblia.css` - App biblia
- `apps/santopedia/src/styles/santopedia.css` - App santopedia

### Archivos de Componentes (React/TSX)

- `packages/ui/src/portal-header.tsx`
- `packages/ui/src/portal-hero.tsx`
- `packages/ui/src/section-header.tsx`
- `packages/ui/src/breadcrumbs.tsx`
- `packages/ui/src/card.tsx`
- `packages/ui/src/portal-app-card.tsx`
- `packages/ui/src/portal-blog-card.tsx`
- `packages/ui/src/portal-contact-form.tsx`
- `packages/ui/src/portal-bible-search.tsx`
- `packages/ui/src/portal-api-playground.tsx`
- `packages/ui/src/portal-engagement.tsx`

---

## Directrices de Uso

1. **Siempre usar variables CSS** de `shared-styles.css` para colores, espaciado y tipografía
2. **Importar foundation** (`@import "@repo/ui/foundation.css"`) en puntos de entrada de la app
3. **Usar la biblioteca de componentes** de `@repo/ui` para UI consistente
4. **Seguir el tema oscuro** por defecto; tema claro solo para calendario/widget
5. **Mantener espaciado consistente** usando la escala de espaciado
6. **Usar `clamp()`** para tipografía responsiva
7. **Aplicar transiciones** a elementos interactivos
8. **Probar con `prefers-reduced-motion`** habilitado
9. **Asegurar visibilidad de focus** en todos los elementos interactivos
10. **Usar HTML semántico** y etiquetas ARIA donde corresponda
