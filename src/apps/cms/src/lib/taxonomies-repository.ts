import { getSupabaseAuthClient } from "@repo/auth";
import {
  CMS_TAXONOMY_SLUG_DUPLICADO,
  CMS_TERM_DUPLICADO,
  type TaxonomyCreateInput,
  type TaxonomyRecord,
  type TermCreateInput,
  type TermRecord,
} from "@/lib/taxonomies";

/**
 * Repositorio de taxonomias y terminos + asignacion N:M a entradas
 * (FR-CMS-003, UC-CMS-010). Operaciones con el cliente del token del
 * usuario: la RLS del paso 2 hace cumplir que solo admin escriba
 * taxonomias/terminos y que editor/admin asocie terminos a entradas.
 */

type TaxonomyRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  content_terms: Array<{ id: string; name: string; slug: string }>;
};

type TermFlatRow = {
  id: string;
  name: string;
  slug: string;
  taxonomy_id: string;
  content_taxonomies: { id: string; name: string; slug: string } | null;
};

function mapTaxonomyRow(row: TaxonomyRow): TaxonomyRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    terms: (row.content_terms ?? []).map((term) => ({
      id: term.id,
      taxonomyId: row.id,
      taxonomySlug: row.slug,
      taxonomyName: row.name,
      name: term.name,
      slug: term.slug,
    })),
  };
}

function mapUniqueViolation(
  error: { code?: string } | null,
  fallback: string,
): Error {
  if (error?.code === "23505") {
    return new Error(fallback);
  }
  return new Error("CMS_TAXONOMY_WRITE_FAILED");
}

const allowMemoryFallback = !import.meta.env.PROD;

let warnedFallback = false;

function warnFallbackOnce(message: string) {
  if (!allowMemoryFallback || warnedFallback) return;
  warnedFallback = true;
  console.warn(`[cms] ${message}`);
}

async function listFromDb(accessToken: string): Promise<TaxonomyRecord[]> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_taxonomies")
    .select(
      "id, name, slug, created_at, updated_at, content_terms(id, name, slug)",
    )
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as TaxonomyRow[]).map(mapTaxonomyRow);
}

async function createTaxonomyInDb(
  accessToken: string,
  input: TaxonomyCreateInput,
  audit: { actorId: string },
): Promise<TaxonomyRecord> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_taxonomies")
    .insert({ name: input.name, slug: input.slug })
    .select(
      "id, name, slug, created_at, updated_at, content_terms(id, name, slug)",
    )
    .single<TaxonomyRow>();

  if (error) {
    throw mapUniqueViolation(error, CMS_TAXONOMY_SLUG_DUPLICADO);
  }

  try {
    await supabase.from("content_audit_log").insert({
      entry_id: null,
      action: "taxonomy_created",
      actor_id: audit.actorId,
      metadata: { name: input.name, slug: input.slug },
    });
  } catch (error) {
    console.warn(`[cms] auditoria fallida: ${String(error)}`);
  }

  return mapTaxonomyRow(data);
}

async function createTermInDb(
  accessToken: string,
  input: TermCreateInput,
  audit: { actorId: string },
): Promise<TermRecord> {
  const supabase = getSupabaseAuthClient({ accessToken });

  const { data: taxonomy, error: taxonomyError } = await supabase
    .from("content_taxonomies")
    .select("id, name, slug")
    .eq("id", input.taxonomy_id)
    .maybeSingle<{ id: string; name: string; slug: string }>();

  if (taxonomyError) {
    throw taxonomyError;
  }
  if (!taxonomy) {
    throw new Error("CMS_TAXONOMY_NOT_FOUND");
  }

  const { error } = await supabase.from("content_terms").insert({
    taxonomy_id: input.taxonomy_id,
    name: input.name,
    slug: input.slug,
  });

  if (error) {
    throw mapUniqueViolation(error, CMS_TERM_DUPLICADO);
  }

  try {
    await supabase.from("content_audit_log").insert({
      entry_id: null,
      action: "term_created",
      actor_id: audit.actorId,
      metadata: { taxonomy: taxonomy.slug, name: input.name, slug: input.slug },
    });
  } catch (error) {
    console.warn(`[cms] auditoria fallida: ${String(error)}`);
  }

  return {
    id: crypto.randomUUID(),
    taxonomyId: taxonomy.id,
    taxonomySlug: taxonomy.slug,
    taxonomyName: taxonomy.name,
    name: input.name,
    slug: input.slug,
  };
}

async function getEntryTermIdsFromDb(
  accessToken: string,
  entryId: string,
): Promise<string[]> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_entry_terms")
    .select("term_id")
    .eq("entry_id", entryId);

  if (error) {
    throw error;
  }
  return ((data ?? []) as Array<{ term_id: string }>).map((row) => row.term_id);
}

/** Reemplaza todos los terminos de la entrada (set completo, N:M). */
async function setEntryTermsInDb(
  accessToken: string,
  entryId: string,
  termIds: string[],
  audit: { actorId: string },
): Promise<string[]> {
  const supabase = getSupabaseAuthClient({ accessToken });

  const { error: deleteError } = await supabase
    .from("content_entry_terms")
    .delete()
    .eq("entry_id", entryId);

  if (deleteError) {
    throw deleteError;
  }

  if (termIds.length > 0) {
    const { error } = await supabase
      .from("content_entry_terms")
      .insert(
        termIds.map((termId) => ({ entry_id: entryId, term_id: termId })),
      );
    if (error) {
      throw error;
    }
  }

  try {
    await supabase.from("content_audit_log").insert({
      entry_id: entryId,
      action: "entry_terms_updated",
      actor_id: audit.actorId,
      metadata: { terms: termIds.length },
    });
  } catch (error) {
    console.warn(`[cms] auditoria fallida: ${String(error)}`);
  }

  return termIds;
}

/** Ids de entradas que tienen un termino (para filtros del panel/API). */
async function listEntryIdsByTermSlugFromDb(
  accessToken: string,
  termSlug: string,
): Promise<string[]> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_entry_terms")
    .select("entry_id, content_terms!inner(slug)")
    .eq("content_terms.slug", termSlug);

  if (error) {
    throw error;
  }
  return ((data ?? []) as Array<{ entry_id: string }>).map(
    (row) => row.entry_id,
  );
}

function createFallbackRepository() {
  const taxonomies: TaxonomyRecord[] = [];

  return {
    async list() {
      return [...taxonomies];
    },
    async createTaxonomy(input: TaxonomyCreateInput) {
      if (taxonomies.some((item) => item.slug === input.slug)) {
        throw new Error(CMS_TAXONOMY_SLUG_DUPLICADO);
      }
      const now = new Date().toISOString();
      const record: TaxonomyRecord = {
        id: crypto.randomUUID(),
        name: input.name,
        slug: input.slug,
        createdAt: now,
        updatedAt: now,
        terms: [],
      };
      taxonomies.push(record);
      return record;
    },
    async createTerm(input: TermCreateInput) {
      const taxonomy = taxonomies.find((item) => item.id === input.taxonomy_id);
      if (!taxonomy) {
        throw new Error("CMS_TAXONOMY_NOT_FOUND");
      }
      if (
        taxonomy.terms.some(
          (term) => term.slug === input.slug || term.name === input.name,
        )
      ) {
        throw new Error(CMS_TERM_DUPLICADO);
      }
      const term: TermRecord = {
        id: crypto.randomUUID(),
        taxonomyId: taxonomy.id,
        taxonomySlug: taxonomy.slug,
        taxonomyName: taxonomy.name,
        name: input.name,
        slug: input.slug,
      };
      taxonomy.terms.push(term);
      return term;
    },
    async getEntryTermIds() {
      return [];
    },
    async setEntryTerms(_entryId: string, termIds: string[]) {
      return termIds;
    },
    async listEntryIdsByTermSlug() {
      return [];
    },
  };
}

export type TaxonomiesRepository = {
  list(accessToken: string): Promise<TaxonomyRecord[]>;
  createTaxonomy(
    accessToken: string,
    input: TaxonomyCreateInput,
    audit: { actorId: string },
  ): Promise<TaxonomyRecord>;
  createTerm(
    accessToken: string,
    input: TermCreateInput,
    audit: { actorId: string },
  ): Promise<TermRecord>;
  getEntryTermIds(accessToken: string, entryId: string): Promise<string[]>;
  setEntryTerms(
    accessToken: string,
    entryId: string,
    termIds: string[],
    audit: { actorId: string },
  ): Promise<string[]>;
  listEntryIdsByTermSlug(
    accessToken: string,
    termSlug: string,
  ): Promise<string[]>;
};

export function createTaxonomiesRepository(): TaxonomiesRepository {
  return {
    async list(accessToken) {
      try {
        return await listFromDb(accessToken);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB list taxonomies failed: ${String(error)}`);
        return createFallbackRepository().list();
      }
    },
    async createTaxonomy(accessToken, input, audit) {
      try {
        return await createTaxonomyInDb(accessToken, input, audit);
      } catch (error) {
        if (
          error instanceof Error &&
          [CMS_TAXONOMY_SLUG_DUPLICADO, "CMS_TAXONOMY_WRITE_FAILED"].includes(
            error.message,
          )
        ) {
          throw error;
        }
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB create taxonomy failed: ${String(error)}`);
        return createFallbackRepository().createTaxonomy(input);
      }
    },
    async createTerm(accessToken, input, audit) {
      try {
        return await createTermInDb(accessToken, input, audit);
      } catch (error) {
        if (
          error instanceof Error &&
          [
            CMS_TERM_DUPLICADO,
            "CMS_TAXONOMY_NOT_FOUND",
            "CMS_TAXONOMY_WRITE_FAILED",
          ].includes(error.message)
        ) {
          throw error;
        }
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB create term failed: ${String(error)}`);
        return createFallbackRepository().createTerm(input);
      }
    },
    async getEntryTermIds(accessToken, entryId) {
      try {
        return await getEntryTermIdsFromDb(accessToken, entryId);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB get entry terms failed: ${String(error)}`);
        return createFallbackRepository().getEntryTermIds();
      }
    },
    async setEntryTerms(accessToken, entryId, termIds, audit) {
      try {
        return await setEntryTermsInDb(accessToken, entryId, termIds, audit);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB set entry terms failed: ${String(error)}`);
        return createFallbackRepository().setEntryTerms(entryId, termIds);
      }
    },
    async listEntryIdsByTermSlug(accessToken, termSlug) {
      try {
        return await listEntryIdsByTermSlugFromDb(accessToken, termSlug);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB entries by term failed: ${String(error)}`);
        return createFallbackRepository().listEntryIdsByTermSlug();
      }
    },
  };
}

// Flat helper en @/lib/taxonomies (flattenTerms); aqui no se duplica.

export type { TermFlatRow };
