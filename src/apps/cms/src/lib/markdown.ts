import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

/**
 * Render de Markdown con sanitizacion obligatoria (SEC-CMS-007,
 * ADR-CMS-005). El HTML resultante es seguro para incrustar en paginas
 * publicas: se permiten solo etiquetas y atributos de contenido.
 */
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "img",
    "h1",
    "h2",
    "figure",
    "figcaption",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "loading"],
    a: ["href", "name", "target", "rel", "title"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

export function renderMarkdownSafe(markdown: string): string {
  const html = marked.parse(markdown, { async: false });
  return sanitizeHtml(html, sanitizeOptions);
}
