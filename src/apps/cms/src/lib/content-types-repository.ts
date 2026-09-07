import { getSupabaseAuthClient } from "@repo/auth";
import {
  CMS_001_SLUG_DUPLICADO,
  type ContentTypeCreateInput,
  type ContentTypeRecord,
  type ContentField,
} from "@/lib/content-types";
import { getSupabaseServiceClient } from "@/lib/supabase";

/**
 * Repositorio de content types. Las operaciones corren con el cliente del
 * token del usuario: la RLS del paso 2 (policies content_types_write_admin
 * y select_cms) hace cumplir que solo admin escriba y que los roles del
 * cms lean. El fallback en memoria existe solo para desarrollo local.
 */

type ContentTypeRow = {
  id: string;
  name: string;
  slug: string;
  fields: ContentField[];
  created_at: string;
  updated_at: string;
};

export type ContentTypeAuditInput = {
  action: string;
  actorId: string;
  metadata: Record<string, unknown>;
};

function mapRow(row: ContentTypeRow): ContentTypeRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    fields: row.fields,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// El fallback en memoria existe solo para desarrollo local sin DB.
// En produccion un fallo de DB debe propagarse como error real.
const allowMemoryFallback = !import.meta.env.PROD;

let warnedFallback = false;

function warnFallbackOnce(message: string) {
  if (!allowMemoryFallback || warnedFallback) {
    return;
  }
  warnedFallback = true;
  console.warn(`[cms] ${message}`);
}

function mapUniqueViolation(error: { code?: string } | null): Error | null {
  if (error?.code === "23505") {
    return new Error(CMS_001_SLUG_DUPLICADO);
  }
  return null;
}

async function listFromDb(accessToken: string): Promise<ContentTypeRecord[]> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_types")
    .select("id, name, slug, fields, created_at, updated_at")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ContentTypeRow[]).map(mapRow);
}

async function getBySlugFromDb(
  accessToken: string,
  slug: string,
): Promise<ContentTypeRecord | null> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_types")
    .select("id, name, slug, fields, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle<ContentTypeRow>();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data ? mapRow(data) : null;
}

async function createInDb(
  accessToken: string,
  input: ContentTypeCreateInput,
  audit: ContentTypeAuditInput,
): Promise<ContentTypeRecord> {
  const supabase = getSupabaseAuthClient({ accessToken });

  const { data, error } = await supabase
    .from("content_types")
    .insert({
      name: input.name,
      slug: input.slug,
      fields: input.fields,
    })
    .select("id, name, slug, fields, created_at, updated_at")
    .single<ContentTypeRow>();

  const uniqueError = mapUniqueViolation(error);
  if (uniqueError) {
    throw uniqueError;
  }
  if (error || !data) {
    throw error ?? new Error("CMS_CONTENT_TYPE_CREATE_FAILED");
  }

  // RB-CMS-007: auditoria de operaciones editoriales.
  const { error: auditError } = await supabase
    .from("content_audit_log")
    .insert({
      entry_id: null,
      action: audit.action,
      actor_id: audit.actorId,
      metadata: audit.metadata,
    });

  if (auditError) {
    // La auditoria no debe romper la operacion principal.
    console.warn(`[cms] auditoria fallida: ${String(auditError)}`);
  }

  return mapRow(data);
}

function createFallbackRepository() {
  const memory: ContentTypeRecord[] = [];
  return {
    async list(): Promise<ContentTypeRecord[]> {
      return [...memory].sort((a, b) => a.name.localeCompare(b.name));
    },
    async getBySlug(slug: string): Promise<ContentTypeRecord | null> {
      return memory.find((item) => item.slug === slug) ?? null;
    },
    async create(input: ContentTypeCreateInput): Promise<ContentTypeRecord> {
      if (memory.some((item) => item.slug === input.slug)) {
        throw new Error(CMS_001_SLUG_DUPLICADO);
      }
      const now = new Date().toISOString();
      const record: ContentTypeRecord = {
        id: crypto.randomUUID(),
        name: input.name,
        slug: input.slug,
        fields: input.fields,
        createdAt: now,
        updatedAt: now,
      };
      memory.push(record);
      return record;
    },
  };
}

export type ContentTypesRepository = {
  list(accessToken: string): Promise<ContentTypeRecord[]>;
  getBySlug(
    accessToken: string,
    slug: string,
  ): Promise<ContentTypeRecord | null>;
  create(
    accessToken: string,
    input: ContentTypeCreateInput,
    audit: ContentTypeAuditInput,
  ): Promise<ContentTypeRecord>;
};

export function createContentTypesRepository(): ContentTypesRepository {
  return {
    async list(accessToken) {
      try {
        return await listFromDb(accessToken);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB list content types failed: ${String(error)}`);
        return createFallbackRepository().list();
      }
    },
    async getBySlug(accessToken, slug) {
      try {
        return await getBySlugFromDb(accessToken, slug);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB get content type failed: ${String(error)}`);
        return createFallbackRepository().getBySlug(slug);
      }
    },
    async create(accessToken, input, audit) {
      try {
        return await createInDb(accessToken, input, audit);
      } catch (error) {
        // No enmascarar errores de negocio (slug duplicado).
        if (
          error instanceof Error &&
          error.message === CMS_001_SLUG_DUPLICADO
        ) {
          throw error;
        }
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB create content type failed: ${String(error)}`);
        return createFallbackRepository().create(input);
      }
    },
  };
}

/**
 * Marca un content type como usado (para validar referencias en campos
 * type=reference). Lectura via service client: se usa en endpoints que ya
 * validaron sesion.
 */
export async function contentTypeExists(
  accessToken: string,
  slug: string,
): Promise<boolean> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_types")
    .select("id")
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw error;
  }
  return data !== null;
}

// Utilidad para pruebas de integracion con service role (sin RLS).
export async function listContentTypesService(): Promise<
  Array<{ id: string; slug: string }>
> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("content_types")
    .select("id, slug");
  if (error) {
    throw error;
  }
  return (data ?? []) as Array<{ id: string; slug: string }>;
}
