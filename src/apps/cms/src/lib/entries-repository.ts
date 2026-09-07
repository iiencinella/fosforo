import { getSupabaseAuthClient } from "@repo/auth";
import {
  buildEntryDataSchema,
  findMissingRequiredFields,
  type ContentField,
} from "@/lib/content-types";
import {
  CMS_002_MISSING_FIELDS,
  CMS_CONFLICT_STALE_UPDATE,
  CMS_ENTRY_SLUG_DUPLICADO,
  type EditorialRole,
  type EntryAction,
  type EntryListFilters,
  type EntryRecord,
  type EntryStatus,
  type RevisionRecord,
  paginate,
  targetStatus,
  transitionError,
} from "@/lib/entries";
import { getSupabaseServiceClient } from "@/lib/supabase";

/**
 * Repositorio de entradas con flujo editorial. Operaciones con el cliente
 * del token del usuario: las policies RLS del paso 2 aplican las
 * transiciones por rol (editor draft/review, revisor review->published|
 * draft, admin full) y el workflow de la app duplica la validacion con
 * mensajes del catalogo. Fallback en memoria solo para desarrollo local.
 */

type EntryRow = {
  id: string;
  slug: string;
  status: EntryStatus;
  data: Record<string, unknown>;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  content_types: { slug: string; name: string } | null;
};

type RevisionRow = {
  id: string;
  revision_number: number;
  status: EntryStatus;
  data: Record<string, unknown>;
  author_id: string;
  created_at: string;
};

const allowMemoryFallback = !import.meta.env.PROD;

let warnedFallback = false;

function warnFallbackOnce(message: string) {
  if (!allowMemoryFallback || warnedFallback) return;
  warnedFallback = true;
  console.warn(`[cms] ${message}`);
}

function mapEntryRow(row: EntryRow): EntryRecord {
  return {
    id: row.id,
    contentTypeSlug: row.content_types?.slug ?? "",
    contentTypeName: row.content_types?.name ?? "",
    slug: row.slug,
    status: row.status,
    data: row.data,
    authorId: row.author_id,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRevisionRow(row: RevisionRow): RevisionRecord {
  return {
    id: row.id,
    revisionNumber: row.revision_number,
    status: row.status,
    data: row.data,
    authorId: row.author_id,
    createdAt: row.created_at,
  };
}

function mapUniqueViolation(error: { code?: string } | null): Error | null {
  if (error?.code === "23505") {
    return new Error(CMS_ENTRY_SLUG_DUPLICADO);
  }
  return null;
}

export type AuditInput = {
  action: string;
  actorId: string;
  metadata: Record<string, unknown>;
};

async function insertAudit(
  accessToken: string,
  entryId: string | null,
  audit: AuditInput,
): Promise<void> {
  try {
    const supabase = getSupabaseAuthClient({ accessToken });
    const { error } = await supabase.from("content_audit_log").insert({
      entry_id: entryId,
      action: audit.action,
      actor_id: audit.actorId,
      metadata: audit.metadata,
    });
    if (error) {
      console.warn(`[cms] auditoria fallida: ${String(error)}`);
    }
  } catch (error) {
    console.warn(`[cms] auditoria fallida: ${String(error)}`);
  }
}

/** Valida data contra los campos del content type (CMS_002). */
export function validateEntryData(
  fields: ContentField[],
  data: Record<string, unknown>,
): void {
  const missing = findMissingRequiredFields(fields, data);
  if (missing.length > 0) {
    throw new Error(`${CMS_002_MISSING_FIELDS}: ${missing.join(", ")}`);
  }
  const parsed = buildEntryDataSchema(fields).safeParse(data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(
      `CMS_DATA_INVALID: ${issue?.path.join(".") ?? ""} ${issue?.message ?? ""}`.trim(),
    );
  }
}

async function listFromDb(accessToken: string, filters: EntryListFilters) {
  const supabase = getSupabaseAuthClient({ accessToken });
  let query = supabase
    .from("content_entries")
    .select(
      "id, slug, status, data, author_id, published_at, created_at, updated_at, content_types(slug, name)",
      {
        count: "exact",
      },
    )
    .order("updated_at", { ascending: false });

  if (filters.contentTypeSlug) {
    query = query.eq("content_types.slug", filters.contentTypeSlug);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
  const from = (page - 1) * limit;

  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) {
    throw error;
  }

  const rows = ((data ?? []) as unknown as EntryRow[]).map(mapEntryRow);
  return { data: rows, total: count ?? rows.length, page, limit };
}

async function getByIdFromDb(
  accessToken: string,
  id: string,
): Promise<EntryRecord | null> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_entries")
    .select(
      "id, slug, status, data, author_id, published_at, created_at, updated_at, content_types(slug, name)",
    )
    .eq("id", id)
    .maybeSingle<EntryRow>();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? mapEntryRow(data) : null;
}

async function listRevisionsFromDb(
  accessToken: string,
  entryId: string,
): Promise<RevisionRecord[]> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_revisions")
    .select("id, revision_number, status, data, author_id, created_at")
    .eq("entry_id", entryId)
    .order("revision_number", { ascending: false });

  if (error) {
    throw error;
  }
  return ((data ?? []) as RevisionRow[]).map(mapRevisionRow);
}

async function nextRevisionNumber(
  accessToken: string,
  entryId: string,
): Promise<number> {
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data } = await supabase
    .from("content_revisions")
    .select("revision_number")
    .eq("entry_id", entryId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle<{ revision_number: number }>();

  return (data?.revision_number ?? 0) + 1;
}

async function createInDb(
  accessToken: string,
  input: {
    contentTypeId: string;
    slug: string;
    data: Record<string, unknown>;
    fields: ContentField[];
  },
  actorId: string,
): Promise<EntryRecord> {
  validateEntryData(input.fields, input.data);

  const supabase = getSupabaseAuthClient({ accessToken });
  const { data, error } = await supabase
    .from("content_entries")
    .insert({
      content_type_id: input.contentTypeId,
      slug: input.slug,
      status: "draft",
      data: input.data,
      author_id: actorId,
    })
    .select(
      "id, slug, status, data, author_id, published_at, created_at, updated_at, content_types(slug, name)",
    )
    .single<EntryRow>();

  const uniqueError = mapUniqueViolation(error);
  if (uniqueError) throw uniqueError;
  if (error || !data) {
    throw error ?? new Error("CMS_ENTRY_CREATE_FAILED");
  }

  const revisionNumber = await nextRevisionNumber(accessToken, data.id);
  const { error: revisionError } = await supabase
    .from("content_revisions")
    .insert({
      entry_id: data.id,
      revision_number: revisionNumber,
      data: input.data,
      author_id: actorId,
      status: "draft",
    });
  if (revisionError) {
    throw revisionError;
  }

  await insertAudit(accessToken, data.id, {
    action: "entry_created",
    actorId,
    metadata: { slug: input.slug, revision: revisionNumber },
  });

  return mapEntryRow(data);
}

async function updateInDb(
  accessToken: string,
  entryId: string,
  input: { data: Record<string, unknown>; expectedUpdatedAt: string },
  actorId: string,
): Promise<EntryRecord> {
  const current = await getByIdFromDb(accessToken, entryId);
  if (!current) {
    throw new Error("CMS_ENTRY_NOT_FOUND");
  }

  // Optimistic locking (ERM-CMS-001).
  if (current.updatedAt !== input.expectedUpdatedAt) {
    throw new Error(CMS_CONFLICT_STALE_UPDATE);
  }

  // Campos del content type para validar (embed del join).
  const supabase = getSupabaseAuthClient({ accessToken });
  const { data: typeRow, error: typeError } = await supabase
    .from("content_entries")
    .select("content_types(fields)")
    .eq("id", entryId)
    .maybeSingle<{ content_types: { fields: ContentField[] } | null }>();

  if (typeError || !typeRow?.content_types) {
    throw typeError ?? new Error("CMS_ENTRY_NOT_FOUND");
  }

  validateEntryData(typeRow.content_types.fields, input.data);

  const revisionNumber = await nextRevisionNumber(accessToken, entryId);
  const { error: revisionError } = await supabase
    .from("content_revisions")
    .insert({
      entry_id: entryId,
      revision_number: revisionNumber,
      data: input.data,
      author_id: actorId,
      status: current.status,
    });
  if (revisionError) {
    throw revisionError;
  }

  const { data, error } = await supabase
    .from("content_entries")
    .update({ data: input.data })
    .eq("id", entryId)
    .select(
      "id, slug, status, data, author_id, published_at, created_at, updated_at, content_types(slug, name)",
    )
    .single<EntryRow>();

  if (error || !data) {
    throw error ?? new Error("CMS_ENTRY_UPDATE_FAILED");
  }

  await insertAudit(accessToken, entryId, {
    action: "entry_updated",
    actorId,
    metadata: { revision: revisionNumber },
  });

  return mapEntryRow(data);
}

async function transitionInDb(
  accessToken: string,
  entryId: string,
  action: EntryAction,
  reason: string | undefined,
  actorId: string,
  role: EditorialRole,
): Promise<EntryRecord> {
  const current = await getByIdFromDb(accessToken, entryId);
  if (!current) {
    throw new Error("CMS_ENTRY_NOT_FOUND");
  }

  const invalid = transitionError(current.status, action, role, reason);
  if (invalid) {
    throw new Error(invalid);
  }

  const nextStatus = targetStatus(action);
  const supabase = getSupabaseAuthClient({ accessToken });

  const update: Record<string, unknown> = { status: nextStatus };
  if (action === "approve" && !current.publishedAt) {
    update.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("content_entries")
    .update(update)
    .eq("id", entryId)
    .select(
      "id, slug, status, data, author_id, published_at, created_at, updated_at, content_types(slug, name)",
    )
    .single<EntryRow>();

  if (error || !data) {
    throw error ?? new Error("CMS_TRANSITION_FAILED");
  }

  // RB-CMS-003: al publicar, la revision publicada anterior queda
  // registrada en auditoria como reemplazada.
  let previousPublished: number | null = null;
  if (action === "approve") {
    const revisions = await listRevisionsFromDb(accessToken, entryId);
    previousPublished =
      revisions.find(
        (revision) =>
          revision.status === "published" &&
          revision.revisionNumber !== undefined,
      )?.revisionNumber ?? null;
  }

  await insertAudit(accessToken, entryId, {
    action: `entry_${action}`,
    actorId,
    metadata: {
      from: current.status,
      to: nextStatus,
      ...(reason ? { reason } : {}),
      ...(previousPublished !== null
        ? { previous_published_revision: previousPublished }
        : {}),
    },
  });

  return mapEntryRow(data);
}

function createFallbackRepository() {
  const entries: EntryRecord[] = [];

  return {
    async list(filters: EntryListFilters) {
      let filtered = [...entries];
      if (filters.contentTypeSlug) {
        filtered = filtered.filter(
          (item) => item.contentTypeSlug === filters.contentTypeSlug,
        );
      }
      if (filters.status) {
        filtered = filtered.filter((item) => item.status === filters.status);
      }
      return paginate(filtered, filters);
    },
    async getById(id: string) {
      return entries.find((item) => item.id === id) ?? null;
    },
    async listRevisions(): Promise<RevisionRecord[]> {
      return [];
    },
    async create(input: {
      contentTypeId: string;
      contentTypeSlug: string;
      contentTypeName: string;
      slug: string;
      data: Record<string, unknown>;
      fields: ContentField[];
    }) {
      if (entries.some((item) => item.slug === input.slug)) {
        throw new Error(CMS_ENTRY_SLUG_DUPLICADO);
      }
      validateEntryData(input.fields, input.data);
      const now = new Date().toISOString();
      const record: EntryRecord = {
        id: crypto.randomUUID(),
        contentTypeSlug: input.contentTypeSlug,
        contentTypeName: input.contentTypeName,
        slug: input.slug,
        status: "draft",
        data: input.data,
        authorId: "dev-author",
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      entries.push(record);
      return record;
    },
    async update(entryId: string, input: { data: Record<string, unknown> }) {
      const entry = entries.find((item) => item.id === entryId);
      if (!entry) throw new Error("CMS_ENTRY_NOT_FOUND");
      entry.data = input.data;
      entry.updatedAt = new Date().toISOString();
      return entry;
    },
    async transition(
      entryId: string,
      action: EntryAction,
      role: EditorialRole,
      reason?: string,
    ) {
      const entry = entries.find((item) => item.id === entryId);
      if (!entry) throw new Error("CMS_ENTRY_NOT_FOUND");
      const invalid = transitionError(entry.status, action, role, reason);
      if (invalid) throw new Error(invalid);
      entry.status = targetStatus(action);
      if (entry.status === "published" && !entry.publishedAt) {
        entry.publishedAt = new Date().toISOString();
      }
      return entry;
    },
  };
}

export type EntriesRepository = {
  list(
    accessToken: string,
    filters: EntryListFilters,
  ): Promise<{
    data: EntryRecord[];
    total: number;
    page: number;
    limit: number;
  }>;
  getById(accessToken: string, id: string): Promise<EntryRecord | null>;
  listRevisions(
    accessToken: string,
    entryId: string,
  ): Promise<RevisionRecord[]>;
  create(
    accessToken: string,
    input: {
      contentTypeId: string;
      contentTypeSlug: string;
      contentTypeName: string;
      slug: string;
      data: Record<string, unknown>;
      fields: ContentField[];
    },
    actorId: string,
  ): Promise<EntryRecord>;
  update(
    accessToken: string,
    entryId: string,
    input: { data: Record<string, unknown>; expectedUpdatedAt: string },
    actorId: string,
  ): Promise<EntryRecord>;
  transition(
    accessToken: string,
    entryId: string,
    action: EntryAction,
    reason: string | undefined,
    actorId: string,
    role: EditorialRole,
  ): Promise<EntryRecord>;
};

export function createEntriesRepository(): EntriesRepository {
  return {
    async list(accessToken, filters) {
      try {
        return await listFromDb(accessToken, filters);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB list entries failed: ${String(error)}`);
        return createFallbackRepository().list(filters);
      }
    },
    async getById(accessToken, id) {
      try {
        return await getByIdFromDb(accessToken, id);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB get entry failed: ${String(error)}`);
        return createFallbackRepository().getById(id);
      }
    },
    async listRevisions(accessToken, entryId) {
      try {
        return await listRevisionsFromDb(accessToken, entryId);
      } catch (error) {
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB list revisions failed: ${String(error)}`);
        return createFallbackRepository().listRevisions();
      }
    },
    async create(accessToken, input, actorId) {
      try {
        return await createInDb(accessToken, input, actorId);
      } catch (error) {
        if (
          error instanceof Error &&
          [
            "CMS_ENTRY_SLUG_DUPLICADO",
            "CMS_002_MISSING_FIELDS",
            "CMS_DATA_INVALID",
          ].includes(error.message)
        ) {
          throw error;
        }
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB create entry failed: ${String(error)}`);
        return createFallbackRepository().create(input);
      }
    },
    async update(accessToken, entryId, input, actorId) {
      try {
        return await updateInDb(accessToken, entryId, input, actorId);
      } catch (error) {
        if (
          error instanceof Error &&
          [
            "CMS_ENTRY_NOT_FOUND",
            "CMS_CONFLICT_STALE_UPDATE",
            "CMS_002_MISSING_FIELDS",
            "CMS_DATA_INVALID",
          ].includes(error.message)
        ) {
          throw error;
        }
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB update entry failed: ${String(error)}`);
        return createFallbackRepository().update(entryId, input);
      }
    },
    async transition(accessToken, entryId, action, reason, actorId, role) {
      try {
        return await transitionInDb(
          accessToken,
          entryId,
          action,
          reason,
          actorId,
          role,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          [
            "CMS_ENTRY_NOT_FOUND",
            "CMS_003_NOT_IN_REVIEW",
            "CMS_TRANSITION_INVALID",
            "CMS_REASON_REQUIRED",
          ].includes(error.message)
        ) {
          throw error;
        }
        if (!allowMemoryFallback) throw error;
        warnFallbackOnce(`DB transition failed: ${String(error)}`);
        return createFallbackRepository().transition(
          entryId,
          action,
          role,
          reason,
        );
      }
    },
  };
}

/**
 * Render del HTML de una entrada (para la API publica, paso 7) usando el
 * cliente service: los campos markdown se sanitizan.
 */
export async function getPublishedEntryService(
  contentTypeSlug: string,
  slug: string,
): Promise<EntryRecord | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("content_entries")
    .select(
      "id, slug, status, data, author_id, published_at, created_at, updated_at, content_types!inner(slug, name)",
    )
    .eq("content_types.slug", contentTypeSlug)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<EntryRow>();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? mapEntryRow(data) : null;
}
