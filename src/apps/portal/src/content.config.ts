import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const appsCatalog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/apps-catalog" }),
  schema: ({ image }) =>
    z.object({
      slug: z.string().min(2),
      name: z.string().min(2),
      resume: z.string().min(10),
      category: z.string().min(2),
      status: z.enum(["disponible", "en-desarrollo", "proximamente"]),
      visible: z.boolean().default(true),
      image: image().optional(),
      url: z.union([z.string().url(), z.literal("")]).optional(),
    }),
});

const novedades = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/novedades" }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string().min(4),
      slug: z.string().min(3),
      image: image().optional(),
      autor: z.string().min(2),
      fecha_creación: z.coerce.date(),
      fecha_modificación: z.coerce.date(),
      tags: z.array(z.string()).default([]),
    }),
});

const paginas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/paginas" }),
  schema: z.object({
    title: z.string().min(4),
    slug: z.string().min(3),
    description: z.string().min(10),
    updatedAt: z.coerce.date(),
  }),
});

export const collections = { appsCatalog, novedades, paginas };
