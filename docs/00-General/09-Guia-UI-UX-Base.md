---
tags:
  - proyecto/fosforo
  - diseño
  - ui
  - ux
  - guia
  - design-system
type: guia-diseno
area: general
status: vigente
created: 2026-03-09
updated: 2026-04-04
related:
  - "[[01-Indice General|Guia General]]"
  - "[[06-PRD Maestro|PRD Maestro]]"
---

# Guia UI/UX Base - Ecosistema Fósforo

> [!info] Documento rector de interfaz
> Esta guia define la base visual y de experiencia de usuario para todo el ecosistema Fósforo. Todas las aplicaciónes deben respetar estos principios, paletas, tokens y patrones para mantener coherencia entre productos.

---

## Resumen

| Aspecto           | Decision                                                                   |
| ----------------- | -------------------------------------------------------------------------- |
| **Estilo**        | Minimalista, calido y centrado en el contenido                             |
| **Temas**         | Modo oscuro y modo claro (preferencia del sistema o del usuario)           |
| **Oscuro**        | Fondo carbon, texto claro, enfasis ambar calido, secundario neutro calido  |
| **Claro**         | Fondo blanco, texto oscuro, enfasis azul liturgico, secundario verde oliva |
| **Accesibilidad** | WCAG AA minimo; soporte `prefers-reduced-motion`; navegación por teclado   |
| **Stack visual**  | TailwindCSS + componentes React con tokens CSS                             |
| **Iconos**        | Lucide Icons (SVG, consistente, sin emojis como iconos)                    |

---

## 1. Filosofia de diseno

La interfaz del ecosistema Fósforo debe ser **minimalista, calida y centrada en el contenido**, alineada con la identidad de "portador de luz": claridad visual, calidez espiritual y respeto por la lectura sin saturar al usuario.

### 1.1 Principios visuales

| Principio         | Descripcion                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| **Claridad**      | Contenido y acciones visibles sin ruido visual; jerarquia clara con tamaños y pesos tipograficos. |
| **Consistencia**  | Mismos patrones en todas las aplicaciónes (navegación, botones, formularios, cards).              |
| **Calidez**       | Tonos calidos que evoquen espiritualidad sin ser ornamentales; evitar frialdad corporativa.       |
| **Accesibilidad** | Contraste WCAG AA, areas tactiles minimas 44x44px, foco visible, soporte teclado completo.        |
| **Escalabilidad** | Tokens de diseno reutilizables; componentes modulares que evolucionen sin romper la identidad.    |

### 1.2 Principios de experiencia (UX)

- **Menos pasos**: flujos cortos; evitar pasos innecesarios en tareas frecuentes.
- **Feedback claro**: confirmación de acciones (guardado, envio, error) visible e inequivoca.
- **Estados explicitos**: loading, vacio, error y exito con mensajes o indicadores reconocibles.
- **Recuperación de errores**: mensajes que expliquen que paso y que puede hacer el usuario.
- **No depender solo del color**: estados semanticos comúnicados con icono + texto + patron.

### 1.3 Reglas de calidad visual (anti-patrones)

| Regla                             | Hacer                                        | No hacer                                 |
| --------------------------------- | -------------------------------------------- | ---------------------------------------- |
| **No emojis como iconos**         | Usar SVG icons (Lucide, Heroicons)           | Usar emojis como iconos de UI            |
| **Hover estable**                 | Transiciones de color/opacity                | Scale transforms que desplazan layout    |
| **Cursor pointer**                | `cursor-pointer` en todo elemento clickeable | Cursor default en elementos interactivos |
| **Bordes visibles en light mode** | `border-gray-200`                            | `border-white/10` (invisible)            |
| **Texto legible en light mode**   | `#0F172A` (slate-900) para texto principal   | `#94A3B8` (slate-400) para body text     |
| **Glass card en light mode**      | `bg-white/80` o mayor opacidad               | `bg-white/10` (demasiado transparente)   |
| **Transiciones suaves**           | `transition-colors duration-200`             | Cambios instantaneos o >500ms            |
| **Iconos consistentes**           | Mismo set, mismo tamaño viewBox (24x24)      | Mezclar sets y tamaños                   |

---

## 2. Paletas de color

Todas las aplicaciónes deben soportar **modo oscuro** y **modo claro**, respetando la preferencia del sistema o del usuario.

### 2.1 Modo oscuro

| Rol                    | Color           | Hex       | Tailwind     | Uso                                         |
| ---------------------- | --------------- | --------- | ------------ | ------------------------------------------- |
| **Fondo primario**     | Carbon          | `#0F1115` | `gray-950`   | Fondo principal de pagina                   |
| **Fondo superficie**   | Carbon claro    | `#1A1D23` | `gray-900`   | Cards, paneles, modales                     |
| **Fondo elevado**      | Gris calido     | `#252830` | `gray-800`   | Dropdowns, tooltips, overlays               |
| **Texto principal**    | Blanco calido   | `#F1F0EB` | `stone-100`  | Titulos, parrafos, lectura                  |
| **Texto secundario**   | Gris calido     | `#A8A29E` | `stone-400`  | Subtitulos, metadatos, etiquetas            |
| **Enfasis (primario)** | Ambar liturgico | `#D4A843` | `amber-500`  | CTAs, enlaces activos, iconos activos, foco |
| **Enfasis hover**      | Ambar oscuro    | `#B8922F` | `amber-600`  | Hover de botones y enlaces primarios        |
| **Exito**              | Verde musgo     | `#6B9E78` | `green-400`  | Confirmaciónes, estados positivos           |
| **Advertencia**        | Ambar claro     | `#E8C547` | `yellow-400` | Alertas, precauciones                       |
| **Error**              | Rojo terracota  | `#D46B6B` | `red-400`    | Errores, eliminaciónes, campos invalidos    |
| **Info**               | Azul suave      | `#7DB8D4` | `sky-400`    | Información contextual, tips                |
| **Borde**              | Gris neutro     | `#2D3139` | `gray-700`   | Separadores, bordes de cards e inputs       |

**Tokens CSS (modo oscuro):**

```css
:root,
.dark {
  --bg-primary: #0f1115;
  --bg-surface: #1a1d23;
  --bg-elevated: #252830;
  --text-primary: #f1f0eb;
  --text-secondary: #a8a29e;
  --accent: #d4a843;
  --accent-hover: #b8922f;
  --success: #6b9e78;
  --warning: #e8c547;
  --error: #d46b6b;
  --info: #7db8d4;
  --border: #2d3139;
}
```

### 2.2 Modo claro

| Rol                    | Color          | Hex       | Tailwind    | Uso                                         |
| ---------------------- | -------------- | --------- | ----------- | ------------------------------------------- |
| **Fondo primario**     | Blanco         | `#FFFFFF` | `white`     | Fondo principal de pagina                   |
| **Fondo superficie**   | Gris calido    | `#FAFAF8` | `stone-50`  | Cards, paneles, secciones                   |
| **Fondo elevado**      | Gris claro     | `#F0EFEB` | `stone-100` | Dropdowns, tooltips, overlays               |
| **Texto principal**    | Carbon         | `#0F172A` | `slate-900` | Titulos, parrafos, lectura                  |
| **Texto secundario**   | Gris medio     | `#475569` | `slate-600` | Subtitulos, metadatos, etiquetas            |
| **Enfasis (primario)** | Azul liturgico | `#1D5FA6` | `blue-700`  | CTAs, enlaces activos, iconos activos, foco |
| **Enfasis hover**      | Azul oscuro    | `#164B82` | `blue-800`  | Hover de botones y enlaces primarios        |
| **Exito**              | Verde bosque   | `#2E7D32` | `green-700` | Confirmaciónes, estados positivos           |
| **Advertencia**        | Ambar          | `#D4A017` | `amber-600` | Alertas, precauciones                       |
| **Error**              | Rojo           | `#C62828` | `red-700`   | Errores, eliminaciónes, campos invalidos    |
| **Info**               | Azul cielo     | `#0284C7` | `sky-600`   | Información contextual, tips                |
| **Borde**              | Gris suave     | `#E2E0DB` | `stone-200` | Separadores, bordes de cards e inputs       |

**Tokens CSS (modo claro):**

```css
:root,
.light {
  --bg-primary: #ffffff;
  --bg-surface: #fafaf8;
  --bg-elevated: #f0efeb;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --accent: #1d5fa6;
  --accent-hover: #164b82;
  --success: #2e7d32;
  --warning: #d4a017;
  --error: #c62828;
  --info: #0284c7;
  --border: #e2e0db;
}
```

### 2.3 Resumen rápido de paletas

| Tema       | Fondo     | Texto     | Enfasis   | Secundario | Borde     |
| ---------- | --------- | --------- | --------- | ---------- | --------- |
| **Oscuro** | `#0F1115` | `#F1F0EB` | `#D4A843` | `#A8A29E`  | `#2D3139` |
| **Claro**  | `#FFFFFF` | `#0F172A` | `#1D5FA6` | `#475569`  | `#E2E0DB` |

### 2.4 Colores semanticos (ambos modos)

| Estado          | Oscuro    | Claro     | Uso                                    |
| --------------- | --------- | --------- | -------------------------------------- |
| **Exito**       | `#6B9E78` | `#2E7D32` | Accion completada, validación positiva |
| **Advertencia** | `#E8C547` | `#D4A017` | Precaucion, campo pendiente            |
| **Error**       | `#D46B6B` | `#C62828` | Fallo, eliminación, campo invalido     |
| **Info**        | `#7DB8D4` | `#0284C7` | Información adicional, tip contextual  |

> [!warning] Contraste obligatorio
> Todos los colores semanticos deben cumplir WCAG AA (4.5:1 para texto normal, 3:1 para texto grande) sobre su fondo correspondiente. Validar con [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

---

## 3. Contraste y accesibilidad

### 3.1 Niveles de contraste

| Elemento                    | Ratio minimo | Standard |
| --------------------------- | ------------ | -------- |
| Texto normal (< 18px)       | **4.5:1**    | WCAG AA  |
| Texto grande (>= 18px)      | **3:1**      | WCAG AA  |
| Texto grande bold (>= 14px) | **3:1**      | WCAG AA  |
| Componentes UI y graficos   | **3:1**      | WCAG AA  |

### 3.2 Foco visible

- Todos los elementos interactivos deben tener indicador de foco claro.
- Usar `outline` o `ring` con color de enfasis: `focus:ring-2 focus:ring-accent focus:ring-offset-2`.
- En modo oscuro: `focus:ring-offset-bg-surface`.
- No suprimir `outline` sin reemplazar con un indicador equivalente.

### 3.3 Navegación por teclado

- Orden de tab coincide con orden visual.
- Todos los elementos interactivos alcanzables por teclado.
- Traps de foco en modales y dialogs.
- Skip links para contenido principal.

### 3.4 ARIA y semantica

- Usar HTML semantico siempre que sea posible (`<nav>`, `<main>`, `<article>`, `<section>`).
- `aria-label` para botones solo con iconos.
- `role` y `aria-*` en componentes custom (tabs, accordions, dropdowns).
- Formularios: `<label for="id">` asociado explicitamente al control.

### 3.5 No depender solo del color

Los estados (error, exito, advertencia, info) deben comúnicarse con:

- **Icono** (SVG del set Lucide)
- **Texto** descriptivo
- **Color** como refuerzo visual

Ejemplo de mensaje de error correcto:

```
[!] El campo email no tiene un formato valido.
    Por favor, revisa e intenta de nuevo.
```

---

## 4. Tipografia

### 4.1 Familias tipograficas

| Uso                                     | Familia                                  | Fallback                |
| --------------------------------------- | ---------------------------------------- | ----------------------- |
| **UI general**                          | `Inter`                                  | `system-ui, sans-serif` |
| **Contenido largo** (Biblia, oraciones) | `Source Sans 3` o `Merriweather` (serif) | `Georgia, serif`        |
| **Codigo**                              | `JetBrains Mono`                         | `monospace`             |

**Tokens CSS:**

```css
--font-sans: "Inter", system-ui, -apple-system, sans-serif;
--font-serif: "Merriweather", "Source Sans 3", Georgia, serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### 4.2 Escala tipografica

Escala modular con ratio **1.25** (Major Third):

| Token       | Rem   | Px  | Uso                          | Line-height |
| ----------- | ----- | --- | ---------------------------- | ----------- |
| `text-xs`   | 0.75  | 12  | Captions, badges, timestamps | 1.0         |
| `text-sm`   | 0.875 | 14  | Labels, metadata, hints      | 1.25        |
| `text-base` | 1.0   | 16  | Cuerpo de texto, parrafos    | 1.6         |
| `text-lg`   | 1.25  | 20  | Subtitulos, lead text        | 1.5         |
| `text-xl`   | 1.5   | 24  | Titulos de seccion (h3)      | 1.35        |
| `text-2xl`  | 1.875 | 30  | Titulos de pagina (h2)       | 1.3         |
| `text-3xl`  | 2.25  | 36  | Titulos principales (h1)     | 1.25        |
| `text-4xl`  | 3.0   | 48  | Hero, display                | 1.2         |

### 4.3 Reglas de lectura

- Longitud maxima de linea: **65-75 caracteres** para texto de lectura.
- Line-height: **1.5-1.75** para cuerpo, **1.25-1.35** para titulos.
- Padding lateral minimo en contenedores de texto: **16px** en movil, **24px** en desktop.
- Contenido religioso (Biblia, Misal, Oraciones): usar fuente serif para lectura prolongada.

---

## 5. Espaciado y layout

### 5.1 Escala de espaciado

Base **4px**, escala: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

| Token      | Rem  | Px  | Uso tipico                        |
| ---------- | ---- | --- | --------------------------------- |
| `space-1`  | 0.25 | 4   | Gap entre icono y texto           |
| `space-2`  | 0.5  | 8   | Padding interno de badges         |
| `space-3`  | 0.75 | 12  | Gap entre elementos de formulario |
| `space-4`  | 1.0  | 16  | Padding de cards, gap de grid     |
| `space-5`  | 1.25 | 20  | Espaciado entre secciones         |
| `space-6`  | 1.5  | 24  | Padding de contenedores           |
| `space-8`  | 2.0  | 32  | Margen entre secciones            |
| `space-10` | 2.5  | 40  | Separación de bloques             |
| `space-12` | 3.0  | 48  | Espaciado de pagina               |
| `space-16` | 4.0  | 64  | Hero spacing                      |

### 5.2 Grid y layout

| Aspecto                       | Valor                                                                |
| ----------------------------- | -------------------------------------------------------------------- |
| **Grid web**                  | 12 columnas; gutter 24px desktop, 16px movil                         |
| **Ancho maximo de contenido** | `max-w-7xl` (1280px) para paginas, `max-w-prose` (65ch) para lectura |
| **Container padding**         | `px-4` movil, `px-6` tablet, `px-8` desktop                          |

### 5.3 Breakpoints

| Token | Min-width | Uso               | Tailwind |
| ----- | --------- | ----------------- | -------- |
| `sm`  | 640px     | Movil grande      | `sm:`    |
| `md`  | 768px     | Tablet            | `md:`    |
| `lg`  | 1024px    | Desktop pequeno   | `lg:`    |
| `xl`  | 1280px    | Desktop           | `xl:`    |
| `2xl` | 1536px    | Pantallas grandes | `2xl:`   |

### 5.4 Z-index scale

| Token        | Valor | Uso                    |
| ------------ | ----- | ---------------------- |
| `z-base`     | 0     | Contenido base         |
| `z-dropdown` | 10    | Dropdowns, menus       |
| `z-sticky`   | 20    | Headers sticky         |
| `z-overlay`  | 30    | Backdrops, overlays    |
| `z-modal`    | 40    | Modales, dialogs       |
| `z-toast`    | 50    | Notificaciónes, toasts |

### 5.5 Areas tactiles

- **Minimo 44x44px** en botones, enlaces, iconos interactivos (WCAG 2.5.5).
- En Tailwind: `min-h-[44px] min-w-[44px]` o `p-3` con contenido suficiente.
- Espaciado entre targets tactiles: minimo **8px**.

---

## 6. Componentes y patrones

### 6.1 Botones

| Variante        | Fondo            | Texto                                      | Borde                | Uso                           |
| --------------- | ---------------- | ------------------------------------------ | -------------------- | ----------------------------- |
| **Primario**    | `bg-accent`      | `text-white` (dark) / `text-white` (light) | `border-transparent` | Accion principal de la pagina |
| **Secundario**  | `bg-transparent` | `text-accent`                              | `border-accent`      | Acciones alternativas         |
| **Terciario**   | `bg-transparent` | `text-accent`                              | `border-transparent` | Acciones menores, links       |
| **Destructivo** | `bg-error`       | `text-white`                               | `border-transparent` | Eliminar, acciones peligrosas |
| **Disabled**    | `bg-gray-400/50` | `text-gray-500`                            | `border-transparent` | No interactivo                |

**Estados:**

- **Hover**: ligera variación de luminosidad (`hover:bg-accent-hover`, `transition-colors duration-200`).
- **Focus**: `focus:ring-2 focus:ring-accent focus:ring-offset-2`.
- **Active**: `active:scale-[0.98]` (solo si no causa layout shift).
- **Disabled**: `opacity-50 cursor-not-allowed pointer-events-none`.

**Reglas:**

- Un solo boton primario por vista.
- Texto del boton: maximo 3 palabras, verbo de accion.
- `cursor-pointer` en todos los botones.
- Loading state: spinner inline + `disabled`.

### 6.2 Enlaces

- Color de enfasis en estado normal.
- Hover: subrayado (`hover:underline`) o cambio de opacidad.
- Focus: `focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2`.
- Enlaces externos: indicar con icono externo (Lucide `ExternalLink`).

### 6.3 Cards y superficies

- Fondo: `bg-surface` con borde sutil `border border-border`.
- Border-radius: `rounded-lg` (8px) estandar, `rounded-xl` (12px) para cards destacadas.
- Sombra: `shadow-sm` en reposo, `shadow-md` en hover.
- Padding interno: `p-4` minimo, `p-6` para contenido denso.
- Hover interactivo: `hover:shadow-md hover:border-accent/30 transition-all duration-200 cursor-pointer`.

### 6.4 Formularios

| Elemento           | Especificación                                                                   |
| ------------------ | -------------------------------------------------------------------------------- |
| **Labels**         | Visibles siempre, asociados con `for/id`. No usar placeholders como labels.      |
| **Inputs**         | `border border-border rounded-md px-3 py-2` con `focus:ring-2 focus:ring-accent` |
| **Error**          | Borde `border-error` + mensaje texto debajo + icono de error (SVG)               |
| **Exito**          | Borde `border-success` + icono de check (SVG)                                    |
| **Placeholder**    | `text-secondary` con opacidad reducida, nunca unico indicador del campo          |
| **Textarea**       | Mismo estilo que input, `min-h-[100px]`, resize vertical                         |
| **Select**         | Mismo estilo que input con icono de chevron                                      |
| **Checkbox/Radio** | `min-w-[44px] min-h-[44px]` area tactil, label asociado                          |

### 6.5 Navegación

- **Header común**: identidad Fósforo (logo + nombre), menu principal, selector de tema (claro/oscuro), acceso a cuenta.
- **Breadcrumbs**: cuando la jerarquia tenga 3+ niveles.
- **Sidebar**: en apps con muchas secciones (Formación, Biblia, Misal).
- **Bottom nav** (mobile): maximo 5 items con icono + label.
- El usuario debe reconocer que esta dentro del mismo ecosistema al cambiar de aplicación.

### 6.6 Estados de interfaz

| Estado       | Patron                         | Elementos                                          |
| ------------ | ------------------------------ | -------------------------------------------------- |
| **Cargando** | Skeleton screens preferidos    | Skeleton con `animate-pulse`, no spinner full-page |
| **Vacio**    | Ilustración + mensaje + accion | Icono SVG, texto explicativo, boton de accion      |
| **Error**    | Icono + mensaje + reintento    | Icono error, descripcion, boton reintentar         |
| **Exito**    | Icono + mensaje breve          | Icono check, confirmación, accion siguiente        |

**Reglas:**

- No bloquear toda la pantalla con spinner cuando sea posible.
- Skeleton debe reflejar la forma del contenido final.
- Estados vacios deben ofrecer una accion clara (no solo "no hay datos").

### 6.7 Modales y dialogs

- Backdrop: `bg-black/50` (dark) / `bg-black/30` (light).
- Contenido: `bg-surface` con `rounded-xl`, `shadow-xl`, `max-w-lg`.
- Cierre: boton X, click en backdrop, tecla Escape.
- Focus trap dentro del modal.
- Titulo obligatorio + descripcion + acciones (cancelar/confirmar).

### 6.8 Tablas de datos

- Header: `bg-elevated` con texto `text-secondary` uppercase `text-xs font-medium`.
- Filas: `border-b border-border`, hover `bg-elevated/50`.
- Padding de celda: `px-4 py-3`.
- Responsive: scroll horizontal en movil o cards apiladas.
- Accesibilidad: `scope="col"` en headers, `aria-sort` si es ordenable.

---

## 7. Iconografia e imagenes

### 7.1 Iconos

| Aspecto          | Especificación                                                   |
| ---------------- | ---------------------------------------------------------------- |
| **Set**          | Lucide Icons (consistente, open source, compatible con licencia) |
| **Estilo**       | Outline, stroke-width 1.5-2px                                    |
| **Tamano base**  | 24x24px (w-6 h-6)                                                |
| **Tamano small** | 16x16px (w-4 h-4) para badges, metadata                          |
| **Tamano large** | 32x32px (w-8 h-8) para hero icons                                |
| **Color**        | Heredar del contexto (`currentColor`)                            |
| **Interactivos** | `cursor-pointer` + hover color change                            |

**Prohibido:**

- Usar emojis como iconos de interfaz.
- Mezclar sets de iconos diferentes.
- Íconos con tamaños inconsistentes.

### 7.2 Imágenes

- Formato: **WebP** preferido, fallback a JPEG/PNG.
- Lazy loading: `loading="lazy"` en imágenes below-the-fold.
- `alt` descriptivo obligatorio para imágenes con significado.
- `alt=""` para imágenes decorativas.
- Proporciones comúnes: 16:9 (hero), 4:3 (cards), 1:1 (avatars).
- Border-radius consistente: `rounded-lg` (8px).

---

## 8. Animaciónes y microinteracciones

| Aspecto            | Especificación                                            |
| ------------------ | --------------------------------------------------------- |
| **Duración**       | 150-300ms para micro-interacciones (hover, focus, toggle) |
| **Duración modal** | 200-400ms para modales, drawers, overlays                 |
| **Easing**         | `ease-out` para entradas, `ease-in` para salidas          |
| **Transform**      | Usar `transform` y `opacity`, NO `width`/`height`/`top`   |
| **Reduced motion** | Respetar `prefers-reduced-motion: reduce`                 |

**Implementación Tailwind:**

```css
/* Transiciones estándar */
.transition-colors {
  transition-property: color, background-color, border-color;
}
.duration-200 {
  transition-duration: 200ms;
}
.ease-out {
  transition-timing-function: ease-out;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Prohibido:**

- Rebotes excesivos (solo si es patrón definido del producto).
- Animaciónes que causan layout shift.
- Autoplay de video/audio sin control del usuario.

---

## 9. TailwindCSS: mapeo de tokens

### 9.1 Configuración de colores (tailwind.config)

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        border: "var(--border)",
      },
    },
  },
};
```

### 9.2 Patrones comúnes

| Patrón                | Clases Tailwind                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Card base**         | `bg-surface border border-border rounded-lg shadow-sm`                                                                                                                               |
| **Card hover**        | `hover:shadow-md hover:border-accent/30 transition-all duration-200 cursor-pointer`                                                                                                  |
| **Botón primario**    | `bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-hover focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors duration-200 cursor-pointer min-h-[44px]`      |
| **Input base**        | `border border-border rounded-md px-3 py-2 bg-primary text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-colors duration-200 min-h-[44px]` |
| **Contenedor pagina** | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`                                                                                                                                             |
| **Contenido lectura** | `max-w-prose mx-auto`                                                                                                                                                                |

---

## 10. Como validar el cumplimiento

Una aplicación cumple esta guia cuando:

1. Ofrece modo oscuro y modo claro con la paleta definida.
2. Usa los tokens de color, tipografia y espaciado (o equivalentes documentados).
3. Los componentes interactivos tienen area tactil >= 44px y foco visible.
4. Los ratios de contraste de texto cumplen WCAG AA (4.5:1 texto normal, 3:1 texto grande).
5. Los estados (loading, vacio, error, exito) estan contemplados y son claros.
6. La navegación permite reconocer el ecosistema Fósforo.
7. No se usan emojis como iconos de interfaz.
8. Las animaciónes respetan `prefers-reduced-motion`.
9. Los formularios tienen labels asociados y mensajes de error con texto + icono.
10. Las imágenes tienen atributo `alt` apropiado.

---

## 11. Próximos pasos

- [ ] Publicar tokens en `src/packages/tailwind-config` y referenciarlo desde todas las apps.
- [ ] Crear biblioteca de componentes en `src/packages/ui` que implemente esta guia.
- [ ] Incluir esta guía como referencia en los PRDs y especificaciónes de cada aplicación.
- [ ] Revisar tonos con usuarios reales y ajustar hex tras pruebas de contraste y usabilidad.
- [ ] Crear página de demostración visual con todos los componentes del design system.

---

## Navegación

- **Arriba**: [[01-Índice General|Índice General]]
- **Proyecto**: [[../README|Índice de documentación]]
