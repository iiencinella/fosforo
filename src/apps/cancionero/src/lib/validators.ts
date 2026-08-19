import { z } from "zod";

const liturgicalLabel = z
  .string()
  .trim()
  .min(2, "Debe seleccionar un valor válido")
  .max(100, "El valor seleccionado es demasiado largo");

export const searchEngine = z.enum(["A", "B", "C"]);
export type SearchEngine = z.infer<typeof searchEngine>;

export const searchQuerySchema = z
  .object({
    motor: searchEngine.optional(),
    q: z.string().trim().max(120).optional(),
    tiempo: z.string().trim().max(60).optional(),
    momento: z.string().trim().max(100).optional(),
  })
  .superRefine((value, ctx) => {
    const motor: SearchEngine = value.motor ?? "A";
    const q = value.q?.trim() ?? "";

    if (motor === "A" && q.length > 0 && q.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["q"],
        message: "Ingrese al menos 2 caracteres para buscar",
      });
    }
  });

export const songTagSchema = z.object({
  tiempoLiturgico: liturgicalLabel,
  momentoMisa: liturgicalLabel,
});

const chordNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre del acorde no puede estar vacío")
  .max(12, "El nombre del acorde es demasiado largo")
  .regex(
    /^[A-Za-z0-9#/+\-()\s]+$/,
    "El nombre del acorde contiene caracteres no permitidos",
  );

const chordPositionSchema = z.object({
  linea: z
    .number()
    .int("La línea debe ser un número entero")
    .min(0, "La línea no puede ser negativa"),
  posicion: z
    .number()
    .int("La posición debe ser un número entero")
    .min(0, "La posición no puede ser negativa"),
  nombre: chordNameSchema,
});

export const contributionSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(1, "El título de la canción es obligatorio")
      .max(200, "El título no puede superar los 200 caracteres"),
    letra: z.string().trim().min(1, "La letra de la canción es obligatoria"),
    acordes: z
      .array(chordPositionSchema)
      .max(2000, "La canción tiene demasiados acordes"),
    observaciones: z
      .string()
      .trim()
      .max(1000, "Las observaciones no pueden superar los 1000 caracteres")
      .optional()
      .or(z.literal("")),
    pdfUrl: z
      .string()
      .trim()
      .check(z.url({ error: "El PDF debe ser una URL válida" }))
      .optional()
      .or(z.literal("")),
    youtubeUrl: z
      .string()
      .trim()
      .check(z.url({ error: "YouTube debe ser una URL válida" }))
      .optional()
      .or(z.literal("")),
    etiquetas: z.array(songTagSchema).max(50).default([]),
  })
  .superRefine((value, ctx) => {
    const lineLengths = value.letra.split(/\r?\n/).map((line) => line.length);
    value.acordes.forEach((acorde, index) => {
      const lineLength = lineLengths[acorde.linea];
      if (lineLength === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["acordes", index, "linea"],
          message: "La línea indicada no existe en la letra",
        });
        return;
      }
      if (acorde.posicion > lineLength) {
        ctx.addIssue({
          code: "custom",
          path: ["acordes", index, "posicion"],
          message: "La posición del acorde excede la longitud de la línea",
        });
      }
    });
  });

export const moderationSchema = z
  .object({
    accion: z.enum(["aprobar", "rechazar", "corregir_etiquetas"]),
    motivo: z.string().trim().max(280).optional(),
    etiquetas: z.array(songTagSchema).max(50).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      (value.accion === "aprobar" || value.accion === "corregir_etiquetas") &&
      (!value.etiquetas || value.etiquetas.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["etiquetas"],
        message:
          "Debe seleccionar al menos un tiempo litúrgico y un momento de misa para aprobar",
      });
    }
  });
