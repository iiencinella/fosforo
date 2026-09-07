import { describe, expect, it } from "vitest";
import {
  extractVariables,
  newTemplateVersion,
  publishTemplate,
  renderTemplate,
  TemplateRenderError,
  validateTemplateDefinition,
} from "./templates.js";

const definition = {
  id: "misal-daily-reminder",
  name: "Recordatorio diario de Misal",
  channel: "email" as const,
  category: "liturgical" as const,
  subject: "Lecturas del dia {{fecha}}",
  body: "Hola {{nombre}}: las lecturas de {{fecha}} estan listas.",
};

describe("plantillas versionadas (TC-NOTIF, FR-NOTIF-001)", () => {
  it("extractVariables encuentra variables en subject y body", () => {
    expect(extractVariables(definition.subject)).toEqual(["fecha"]);
    expect(extractVariables(definition.body)).toEqual(["fecha", "nombre"]);
  });

  it("publishTemplate asigna version incremental y variables requeridas", () => {
    const published = publishTemplate(definition, 2);
    expect(published.version).toBe(3);
    expect(published.requiredVariables).toEqual(["fecha", "nombre"]);
  });

  it("las plantillas publicadas son readonly (no se pueden mutar)", () => {
    const published = publishTemplate(definition, 0);
    expect(() => {
      (published as { subject: string }).subject = "cambiado";
    }).toThrow();
  });

  it("newTemplateVersion deriva una version nueva sin editar la anterior", () => {
    const v1 = publishTemplate(definition, 0);
    const v2 = newTemplateVersion(v1, {
      body: "Hola {{nombre}}: oracion del dia {{fecha}} y {{salmo}}.",
    });

    expect(v1.version).toBe(1);
    expect(v1.body).not.toContain("salmo");
    expect(v2.version).toBe(2);
    expect(v2.requiredVariables).toEqual(["fecha", "nombre", "salmo"]);
  });

  it("validateTemplateDefinition valida estructura completa", () => {
    expect(validateTemplateDefinition(definition)).toBe(true);
    expect(validateTemplateDefinition({ id: "x" })).toBe(false);
    expect(validateTemplateDefinition(null)).toBe(false);
    expect(validateTemplateDefinition({ ...definition, channel: "fax" })).toBe(
      false,
    );
    expect(
      validateTemplateDefinition({ ...definition, category: "marketing" }),
    ).toBe(false);
  });
});

describe("render estricto (RB-NOTIF-005)", () => {
  const published = publishTemplate(definition, 0);

  it("reemplaza todas las variables", () => {
    const rendered = renderTemplate(published, {
      fecha: "2026-09-06",
      nombre: "Ana",
    });
    expect(rendered.subject).toBe("Lecturas del dia 2026-09-06");
    expect(rendered.body).toBe(
      "Hola Ana: las lecturas de 2026-09-06 estan listas.",
    );
  });

  it("lanza TemplateRenderError con la lista completa de faltantes", () => {
    try {
      renderTemplate(published, { nombre: "Ana" });
      expect.unreachable("deberia lanzar");
    } catch (error) {
      expect(error).toBeInstanceOf(TemplateRenderError);
      const renderError = error as TemplateRenderError;
      expect(renderError.missingVariables).toEqual(["fecha"]);
    }
  });

  it("no parcializa el render ante variables faltantes", () => {
    try {
      renderTemplate(published, {});
      expect.unreachable("deberia lanzar");
    } catch {
      // sin render parcial: nada sale con placeholders sin resolver
    }
  });
});
