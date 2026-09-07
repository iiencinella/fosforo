import { z } from "zod";
import { contentSlugSchema } from "@/lib/content-types";

/**
 * Taxonomias y terminos del CMS (FR-CMS-003, UC-CMS-010, RB-CMS-008).
 * Solo admin crea taxonomias y terminos (RLS del paso 2 + guard del
 * endpoint). Los slugs son inmutables tras la creacion.
 */

export const taxonomyCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Nombre requerido").max(120),
    slug: contentSlugSchema,
  })
  .strict();

export type TaxonomyCreateInput = z.infer<typeof taxonomyCreateSchema>;

export const termCreateSchema = z
  .object({
    taxonomy_id: z.uuid(),
    name: z.string().trim().min(1, "Nombre requerido").max(120),
    slug: contentSlugSchema,
  })
  .strict();

export type TermCreateInput = z.infer<typeof termCreateSchema>;

/** Codigo de error del catalogo adaptado a taxonomias/terminos. */
export const CMS_TAXONOMY_SLUG_DUPLICADO = "CMS_TAXONOMY_SLUG_DUPLICADO";
export const CMS_TERM_DUPLICADO = "CMS_TERM_DUPLICADO";
export const CMS_TAXONOMY_NOT_FOUND = "CMS_TAXONOMY_NOT_FOUND";

export type TaxonomyRecord = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  terms: TermRecord[];
};

export type TermRecord = {
  id: string;
  taxonomyId: string;
  taxonomySlug: string;
  taxonomyName: string;
  name: string;
  slug: string;
};

/** Aplana los terminos de varias taxonomias (para selects y filtros). */
export function flattenTerms(
  taxonomies: readonly TaxonomyRecord[],
): TermRecord[] {
  return taxonomies.flatMap((taxonomy) => taxonomy.terms);
}
