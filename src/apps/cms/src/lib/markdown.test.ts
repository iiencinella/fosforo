import { describe, expect, it } from "vitest";
import { renderMarkdownSafe } from "@/lib/markdown";

describe("renderMarkdownSafe (SEC-CMS-007, TC-CMS render)", () => {
  it("renderiza encabezados, negritas y listas", () => {
    const html = renderMarkdownSafe(
      "# Titulo\n\n**negrita** y lista:\n\n- uno\n- dos",
    );
    expect(html).toContain("<h1");
    expect(html).toContain("<strong>negrita</strong>");
    expect(html).toContain("<li>uno</li>");
  });

  it("elimina scripts y handlers inline (XSS)", () => {
    const html = renderMarkdownSafe(
      'Hola <script>alert("xss")</script> <img src="x" onerror="alert(1)">',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
  });

  it("elimina esquemas peligrosos en enlaces e imagenes", () => {
    const html = renderMarkdownSafe(
      "[link](javascript:alert(1)) ![x](javascript:alert(2))",
    );
    expect(html).not.toContain("javascript:");
  });

  it("conserva enlaces https y les agrega rel noopener", () => {
    const html = renderMarkdownSafe("[Fosforo](https://fosforo.app)");
    expect(html).toContain('href="https://fosforo.app"');
    expect(html).toContain("rel=");
  });

  it("conserva img http/https (medios del CMS)", () => {
    const html = renderMarkdownSafe(
      "![Padre](https://cms.fosforo.app/media/padre.webp)",
    );
    expect(html).toContain('src="https://cms.fosforo.app/media/padre.webp"');
  });
});
