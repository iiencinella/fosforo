import { describe, expect, it } from "vitest";
import {
  buildEntryDataSchema,
  CMS_001_SLUG_DUPLICADO,
  contentFieldSchema,
  contentTypeCreateSchema,
  contentSlugSchema,
  type ContentField,
  findMissingRequiredFields,
  slugify,
} from "@/lib/content-types";

describe("contentSlugSchema", () => {
  it("acepta slugs kebab-case", () => {
    expect(contentSlugSchema.safeParse("oracion").success).toBe(true);
    expect(contentSlugSchema.safeParse("padre-nuestro").success).toBe(true);
    expect(contentSlugSchema.safeParse("blog-2026").success).toBe(true);
  });

  it("rechaza mayusculas, espacios, guiones dobles y bordes", () => {
    expect(contentSlugSchema.safeParse("Oracion").success).toBe(false);
    expect(contentSlugSchema.safeParse("mi oracion").success).toBe(false);
    expect(contentSlugSchema.safeParse("-oracion-").success).toBe(false);
    expect(contentSlugSchema.safeParse("ora--cion").success).toBe(false);
    expect(contentSlugSchema.safeParse("").success).toBe(false);
  });
});

describe("contentFieldSchema (FR-CMS-001)", () => {
  it("acepta los seis tipos de campo", () => {
    for (const type of [
      "text",
      "number",
      "date",
      "markdown",
      "reference",
      "media",
    ]) {
      const parsed = contentFieldSchema.safeParse({
        name: "campo",
        label: "Campo",
        type,
      });
      expect(parsed.success).toBe(true);
    }
  });

  it("aplica required=false por defecto y rechaza tipos desconocidos", () => {
    const parsed = contentFieldSchema.safeParse({
      name: "campo",
      label: "Campo",
      type: "text",
    });
    if (parsed.success) {
      expect(parsed.data.required).toBe(false);
    }
    expect(
      contentFieldSchema.safeParse({
        name: "campo",
        label: "Campo",
        type: "wysiwyg",
      }).success,
    ).toBe(false);
  });

  it("exige nombre snake_case y rechaza claves con guiones", () => {
    expect(
      contentFieldSchema.safeParse({
        name: "cuerpo_largo",
        label: "x",
        type: "text",
      }).success,
    ).toBe(true);
    expect(
      contentFieldSchema.safeParse({
        name: "cuerpo-largo",
        label: "x",
        type: "text",
      }).success,
    ).toBe(false);
    expect(
      contentFieldSchema.safeParse({ name: "1campo", label: "x", type: "text" })
        .success,
    ).toBe(false);
  });

  it("valida options estrictas (ref_content_type, multiple, max_length)", () => {
    expect(
      contentFieldSchema.safeParse({
        name: "oracion_ref",
        label: "Oracion",
        type: "reference",
        options: { ref_content_type: "oracion", multiple: true },
      }).success,
    ).toBe(true);
    expect(
      contentFieldSchema.safeParse({
        name: "oracion_ref",
        label: "Oracion",
        type: "reference",
        options: { unknown: true },
      }).success,
    ).toBe(false);
  });
});

describe("contentTypeCreateSchema (UC-CMS-001)", () => {
  const validBase = {
    name: "Oracion",
    slug: "oracion",
    fields: [
      { name: "cuerpo", label: "Cuerpo", type: "markdown", required: true },
    ],
  };

  it("acepta un content type valido", () => {
    expect(contentTypeCreateSchema.safeParse(validBase).success).toBe(true);
  });

  it("rechaza nombres de campo duplicados", () => {
    const parsed = contentTypeCreateSchema.safeParse({
      ...validBase,
      fields: [
        { name: "cuerpo", label: "A", type: "text" },
        { name: "cuerpo", label: "B", type: "text" },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rechaza listas de campos vacias o gigantes", () => {
    expect(
      contentTypeCreateSchema.safeParse({ ...validBase, fields: [] }).success,
    ).toBe(false);
    const fiftyOne = Array.from({ length: 51 }, (_, index) => ({
      name: `campo_${index}`,
      label: `Campo ${index}`,
      type: "text",
    }));
    expect(
      contentTypeCreateSchema.safeParse({ ...validBase, fields: fiftyOne })
        .success,
    ).toBe(false);
  });
});

describe("buildEntryDataSchema (ADR-CMS-003, TC-CMS-001)", () => {
  const fields: ContentField[] = [
    {
      name: "titulo",
      label: "Titulo",
      type: "text",
      required: true,
      options: { max_length: 120 },
    },
    { name: "cuerpo", label: "Cuerpo", type: "markdown", required: true },
    { name: "anio", label: "Anio", type: "number", required: false },
    { name: "fecha", label: "Fecha", type: "date", required: true },
    { name: "autor", label: "Autor", type: "reference", required: false },
    {
      name: "imagen",
      label: "Imagen",
      type: "media",
      required: false,
      options: { multiple: true },
    },
  ];

  const dataSchema = buildEntryDataSchema(fields);

  it("acepta data valida con todos los tipos", () => {
    const parsed = dataSchema.safeParse({
      titulo: "Padre Nuestro",
      cuerpo: "# Padre nuestro...",
      fecha: "2026-09-07",
      imagen: ["cms-media/2026/padre.jpg"],
    });
    expect(parsed.success).toBe(true);
  });

  it("rechaza campos requeridos faltantes (CMS_002)", () => {
    const parsed = dataSchema.safeParse({ anio: 2026 });
    expect(parsed.success).toBe(false);
  });

  it("rechaza claves no declaradas (strict)", () => {
    const parsed = dataSchema.safeParse({
      titulo: "x",
      cuerpo: "y",
      fecha: "2026-09-07",
      extra: "no permitido",
    });
    expect(parsed.success).toBe(false);
  });

  it("valida formato de fecha e incluye arrays para multiple", () => {
    const badDate = dataSchema.safeParse({
      titulo: "x",
      cuerpo: "y",
      fecha: "07/09/2026",
    });
    expect(badDate.success).toBe(false);

    const good = dataSchema.safeParse({
      titulo: "x",
      cuerpo: "y",
      fecha: "2026-09-07",
      imagen: ["cms-media/a.webp", "cms-media/b.webp"],
    });
    expect(good.success).toBe(true);
  });
});

describe("findMissingRequiredFields (CMS_002)", () => {
  const fields: ContentField[] = [
    {
      name: "titulo",
      label: "T",
      type: "text",
      required: true,
      options: undefined,
    },
    {
      name: "anio",
      label: "A",
      type: "number",
      required: false,
      options: undefined,
    },
  ];

  it("devuelve solo los requeridos vacios", () => {
    expect(findMissingRequiredFields(fields, { titulo: "x", anio: 1 })).toEqual(
      [],
    );
    expect(findMissingRequiredFields(fields, { anio: 1 })).toEqual(["titulo"]);
    expect(findMissingRequiredFields(fields, { titulo: "", anio: 1 })).toEqual([
      "titulo",
    ]);
    expect(
      findMissingRequiredFields(fields, { titulo: null, anio: 1 }),
    ).toEqual(["titulo"]);
  });
});

describe("slugify", () => {
  it("normaliza acentos, espacios y mayusculas", () => {
    expect(slugify("Oración")).toBe("oracion");
    expect(slugify("Vida de Misionero")).toBe("vida-de-misionero");
    expect(slugify("  Misal 2026! ")).toBe("misal-2026");
  });
});

describe("constantes de error", () => {
  it("expone el codigo del catalogo CMS_001", () => {
    expect(CMS_001_SLUG_DUPLICADO).toBe("CMS_001_SLUG_DUPLICADO");
  });
});
