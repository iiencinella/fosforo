import { getSupabaseServiceClient } from "@/lib/supabase";

/**
 * Repositorio de la API de lectura publica (FR-CMS-005, RB-CMS-005).
 * Consulta SOLO entradas published con el cliente service_role (la API
 * publica no tiene sesion de usuario). Sin fallback en memoria: un fallo
 * de DB en la API publica debe propagarse como error real (la app
 * consumidora tiene su propio cache por TTL).
 */

export type PublishedRow = {
  id: string;
  slug: string;
  data: Record<string, unknown>;
  published_at: string | null;
  updated_at: string;
  content_types: {
    slug: string;
    name: string;
    fields: ContentFieldForRender[];
  } | null;
  content_entry_terms: Array<{
    content_terms: { slug: string; name: string } | null;
  }> | null;
};

type ContentFieldForRender = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};

export type PublishedEntry = {
  id: string;
  contentType: string;
  contentTypeName: string;
  slug: string;
  title: string;
  publishedAt: string | null;
  updatedAt: string;
  data: Record<string, unknown>;
  rendered: Record<string, string>;
  terms: Array<{ slug: string; name: string }>;
};

export type ContentApiKeyRow = {
  id: string;
  appName: string;
};

const READ_SELECT =
  "id, slug, data, published_at, updated_at, content_types!inner(slug, name, fields), content_entry_terms(content_terms(slug, name))";

function extractTitle(
  fields: ContentFieldForRender[],
  data: Record<string, unknown>,
  slug: string,
): string {
  const titleField = fields.find(
    (field) =>
      field.type === "text" &&
      ["titulo", "title", "nombre", "name"].includes(field.name),
  );
  const value = titleField ? data[titleField.name] : undefined;
  return typeof value === "string" && value.length > 0 ? value : slug;
}

export function mapPublishedEntry(row: PublishedRow): PublishedEntry {
  const contentType = row.content_types ?? { slug: "", name: "", fields: [] };
  const data = row.data ?? {};
  const rendered: Record<string, string> = {};

  // El render (marked + sanitize-html) se inyecta por el llamador para
  // mantener este modulo sin dependencias de DOM/servidor de Markdown.

  return {
    id: row.id,
    contentType: contentType.slug,
    contentTypeName: contentType.name,
    slug: row.slug,
    title: extractTitle(contentType.fields, data, row.slug),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    data,
    rendered,
    terms: (row.content_entry_terms ?? [])
      .map((entry) => entry.content_terms)
      .filter((term): term is { slug: string; name: string } => term !== null)
      .map((term) => ({ slug: term.slug, name: term.name })),
  };
}

/** Nombres de campos markdown de un content type (para render externo). */
export function markdownFieldNames(fields: ContentFieldForRender[]): string[] {
  return fields
    .filter((field) => field.type === "markdown")
    .map((field) => field.name);
}

async function listPublishedFromDb(
  contentTypeSlug: string,
  options: { term?: string; page: number; limit: number },
): Promise<{
  data: PublishedRow[];
  total: number;
  page: number;
  limit: number;
} | null> {
  const supabase = getSupabaseServiceClient();

  let query = supabase
    .from("content_entries")
    .select(READ_SELECT, { count: "exact" })
    .eq("content_types.slug", contentTypeSlug)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (options.term) {
    // Filtro por termino via la relacion N:M (patron del paso 6).
    const { data: termRows, error: termError } = await supabase
      .from("content_entry_terms")
      .select("entry_id, content_terms!inner(slug)")
      .eq("content_terms.slug", options.term);
    if (termError) {
      throw termError;
    }
    const ids = ((termRows ?? []) as Array<{ entry_id: string }>).map(
      (row) => row.entry_id,
    );
    if (ids.length === 0) {
      return { data: [], total: 0, page: options.page, limit: options.limit };
    }
    query = query.in("id", ids);
  }

  const from = (options.page - 1) * options.limit;
  const { data, error, count } = await query.range(
    from,
    from + options.limit - 1,
  );

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  // content type inexistente: el embed !inner devuelve sin filas y sin
  // poder distinguir de "no hay publicaciones". Se consulta el tipo.
  if ((data ?? []).length === 0) {
    const { data: typeRow, error: typeError } = await supabase
      .from("content_types")
      .select("id")
      .eq("slug", contentTypeSlug)
      .maybeSingle<{ id: string }>();
    if (typeError) {
      throw typeError;
    }
    if (!typeRow) {
      return null; // content type inexistente -> 404
    }
  }

  return {
    data: (data ?? []) as unknown as PublishedRow[],
    total: count ?? 0,
    page: options.page,
    limit: options.limit,
  };
}

async function getPublishedFromDb(
  contentTypeSlug: string,
  slug: string,
): Promise<PublishedRow | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("content_entries")
    .select(READ_SELECT)
    .eq("content_types.slug", contentTypeSlug)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<PublishedRow>();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ?? null;
}

async function verifyApiKeyFromDb(
  apiKeyHash: string,
): Promise<ContentApiKeyRow | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("content_api_keys")
    .select("id, app_name, is_active")
    .eq("key_hash", apiKeyHash)
    .maybeSingle<{ id: string; app_name: string; is_active: boolean }>();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data || !data.is_active) {
    return null;
  }
  return { id: data.id, appName: data.app_name };
}

async function checkRateLimitFromDb(
  apiKeyId: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.rpc(
    "check_content_api_key_rate_limit",
    {
      p_api_key_id: apiKeyId,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    },
  );
  if (error) {
    // Fail-open como el rate limit de log/rum: un problema transitorio del
    // contador no debe tumbar la API de lectura (SLO-CMS-001).
    console.warn(`[cms] rate limit check failed: ${String(error)}`);
    return true;
  }
  return data === true;
}

async function touchLastUsedFromDb(apiKeyId: string): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient();
    await supabase
      .from("content_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyId);
  } catch (error) {
    console.warn(`[cms] last_used_at update failed: ${String(error)}`);
  }
}

export type ContentReadRepository = {
  listPublished(
    contentTypeSlug: string,
    options: { term?: string; page: number; limit: number },
  ): Promise<{
    data: PublishedRow[];
    total: number;
    page: number;
    limit: number;
  } | null>;
  getPublished(
    contentTypeSlug: string,
    slug: string,
  ): Promise<PublishedRow | null>;
  verifyApiKey(apiKeyHash: string): Promise<ContentApiKeyRow | null>;
  checkRateLimit(
    apiKeyId: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean>;
  touchLastUsed(apiKeyId: string): Promise<void>;
};

export function createContentReadRepository(): ContentReadRepository {
  return {
    listPublished: (contentTypeSlug, options) =>
      listPublishedFromDb(contentTypeSlug, options),
    getPublished: (contentTypeSlug, slug) =>
      getPublishedFromDb(contentTypeSlug, slug),
    verifyApiKey: (apiKeyHash) => verifyApiKeyFromDb(apiKeyHash),
    checkRateLimit: (apiKeyId, limit, windowSeconds) =>
      checkRateLimitFromDb(apiKeyId, limit, windowSeconds),
    touchLastUsed: (apiKeyId) => touchLastUsedFromDb(apiKeyId),
  };
}
