import { z } from "zod";

/**
 * Content types del CMS: definicion de campos personalizados con
 * validacion Zod dinamica (FR-CMS-001, ADR-CMS-003).
 *
 * RB-CMS-008: el slug es inmutable tras la creacion — el schema de
 * creacion lo acepta y no existe schema de edicion de slug.
 */

export const CONTENT_FIELD_TYPES = [
  "text",
  "number",
  "date",
  "markdown",
  "reference",
  "media",
] as const;

export type ContentFieldType = (typeof CONTENT_FIELD_TYPES)[number];

export const contentSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug invalido: solo minusculas, numeros y guiones",
  );

export const contentFieldOptionsSchema = z
  .object({
    /** Para type=reference: slug del content type destino. */
    ref_content_type: contentSlugSchema.optional(),
    /** Para reference/media: permite varios valores. */
    multiple: z.boolean().optional(),
    /** Ayuda para el editor. */
    help_text: z.string().max(300).optional(),
    /** Tope de caracteres para text/markdown. */
    max_length: z.number().int().min(1).max(200_000).optional(),
  })
  .strict();

export type ContentFieldOptions = z.infer<typeof contentFieldOptionsSchema>;

export const contentFieldSchema = z
  .object({
    /** Nombre de la clave jsonb en data (snake_case). */
    name: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z_][a-z0-9_]*$/, "Nombre de campo invalido: snake_case"),
    label: z.string().trim().min(1).max(120),
    type: z.enum(CONTENT_FIELD_TYPES),
    required: z.boolean().default(false),
    options: contentFieldOptionsSchema.optional(),
  })
  .strict();

export type ContentField = z.infer<typeof contentFieldSchema>;

export const contentTypeCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Nombre requerido").max(120),
    slug: contentSlugSchema,
    fields: z.array(contentFieldSchema).min(1).max(50),
  })
  .strict()
  .refine(
    (input) =>
      new Set(input.fields.map((field) => field.name)).size ===
      input.fields.length,
    { message: "Nombres de campo duplicados" },
  );

export type ContentTypeCreateInput = z.infer<typeof contentTypeCreateSchema>;

export type ContentTypeRecord = {
  id: string;
  name: string;
  slug: string;
  fields: ContentField[];
  createdAt: string;
  updatedAt: string;
};

/** Errores del catalogo (03-FRD §4). */
export const CMS_001_SLUG_DUPLICADO = "CMS_001_SLUG_DUPLICADO";

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function isoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

/**
 * Genera el schema Zod que valida el jsonb `data` de una entrada contra
 * los campos definidos por el content type (ADR-CMS-003: la validacion
 * vive en la capa de aplicacion). Modo estricto: rechaza claves no
 * declaradas.
 */
export function buildEntryDataSchema(
  fields: readonly ContentField[],
): z.ZodType<Record<string, unknown>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let base: z.ZodTypeAny;
    switch (field.type) {
      case "text":
        base = z.string().max(field.options?.max_length ?? 5_000);
        break;
      case "number":
        base = z.number();
        break;
      case "date":
        base = z.string().refine(isoDate, "Fecha invalida (YYYY-MM-DD)");
        break;
      case "markdown":
        base = z.string().max(field.options?.max_length ?? 100_000);
        break;
      case "reference":
        base = z.string().max(200);
        break;
      case "media":
        base = z.string().max(500);
        break;
    }

    const supportsMultiple =
      field.type === "reference" || field.type === "media";
    if (supportsMultiple && field.options?.multiple === true) {
      base = z.array(base).min(1).max(20);
    }

    shape[field.name] = field.required ? base : base.optional();
  }

  return z.strictObject(shape);
}

/**
 * Valida los campos requeridos de una entrada y devuelve los faltantes
 * para el error CMS_002 (03-FRD §4).
 */
export function findMissingRequiredFields(
  fields: readonly ContentField[],
  data: Record<string, unknown>,
): string[] {
  return fields
    .filter((field) => {
      if (!field.required) return false;
      const value = data[field.name];
      if (Array.isArray(value)) return value.length === 0;
      return value === undefined || value === null || value === "";
    })
    .map((field) => field.name);
}
