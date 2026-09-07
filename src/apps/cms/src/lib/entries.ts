import { z } from "zod";
import { contentSlugSchema } from "@/lib/content-types";

/**
 * Entradas y flujo editorial (FR-CMS-002/004, RB-CMS-002..007).
 *
 * La maquina de estados se aplica EN LA APP (workflow) y TAMBIEN en RLS
 * (migracion del paso 2). Transiciones:
 *   draft -> review     (editor, admin)          accion "submit"
 *   review -> published (revisor, admin)         accion "approve"
 *   review -> draft     (revisor, admin, motivo) accion "reject"
 *   published -> archived (admin)                accion "archive"
 *   archived -> draft   (admin, RB-CMS-006)      accion "restore"
 */

export const ENTRY_ACTIONS = [
  "submit",
  "approve",
  "reject",
  "archive",
  "restore",
] as const;

export type EntryAction = (typeof ENTRY_ACTIONS)[number];

export type EntryStatus = "draft" | "review" | "published" | "archived";

export type EditorialRole = "admin" | "editor" | "revisor";

/** Errores del catalogo y del flujo (03-FRD §4). */
export const CMS_002_MISSING_FIELDS = "CMS_002_MISSING_FIELDS";
export const CMS_003_NOT_IN_REVIEW = "CMS_003_NOT_IN_REVIEW";
export const CMS_ENTRY_SLUG_DUPLICADO = "CMS_ENTRY_SLUG_DUPLICADO";
export const CMS_ENTRY_NOT_FOUND = "CMS_ENTRY_NOT_FOUND";
export const CMS_TRANSITION_INVALID = "CMS_TRANSITION_INVALID";
export const CMS_REASON_REQUIRED = "CMS_REASON_REQUIRED";
export const CMS_CONFLICT_STALE_UPDATE = "CMS_CONFLICT_STALE_UPDATE";

export const entryCreateSchema = z
  .object({
    content_type_slug: contentSlugSchema,
    slug: contentSlugSchema,
    data: z.record(z.string(), z.unknown()),
  })
  .strict();

export type EntryCreateInput = z.infer<typeof entryCreateSchema>;

export const entryUpdateSchema = z
  .object({
    data: z.record(z.string(), z.unknown()),
    /** Optimistic locking (ERM-CMS-001): updated_at que vio el editor. */
    expected_updated_at: z.string().min(1),
  })
  .strict();

export type EntryUpdateInput = z.infer<typeof entryUpdateSchema>;

export const entryTransitionSchema = z
  .object({
    action: z.enum(ENTRY_ACTIONS),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export type EntryTransitionInput = z.infer<typeof entryTransitionSchema>;

/**
 * Maquina de estados por rol (RB-CMS-002/004). Devuelve el motivo del
 * rechazo cuando la transicion no es valida; null si es valida.
 */
export function transitionError(
  status: EntryStatus,
  action: EntryAction,
  role: EditorialRole,
  reason?: string,
): string | null {
  if (action === "reject" && !reason) {
    return CMS_REASON_REQUIRED;
  }

  const allowed: Record<
    EntryAction,
    { from: EntryStatus[]; roles: EditorialRole[] }
  > = {
    submit: { from: ["draft"], roles: ["editor", "admin"] },
    approve: { from: ["review"], roles: ["revisor", "admin"] },
    reject: { from: ["review"], roles: ["revisor", "admin"] },
    archive: { from: ["published"], roles: ["admin"] },
    restore: { from: ["archived"], roles: ["admin"] },
  };

  const rule = allowed[action];
  if (!rule.roles.includes(role)) {
    return action === "approve" && status === "review"
      ? CMS_003_NOT_IN_REVIEW
      : CMS_TRANSITION_INVALID;
  }
  if (!rule.from.includes(status)) {
    return action === "approve"
      ? CMS_003_NOT_IN_REVIEW
      : CMS_TRANSITION_INVALID;
  }
  return null;
}

/** Estado destino de cada accion. */
export function targetStatus(action: EntryAction): EntryStatus {
  switch (action) {
    case "submit":
      return "review";
    case "approve":
      return "published";
    case "reject":
      return "draft";
    case "archive":
      return "archived";
    case "restore":
      return "draft";
  }
}

/** Acciones disponibles para un rol sobre una entrada en un estado. */
export function availableActions(
  status: EntryStatus,
  role: EditorialRole,
): EntryAction[] {
  return ENTRY_ACTIONS.filter(
    (action) => transitionError(status, action, role, "motivo") === null,
  );
}

export type EntryRecord = {
  id: string;
  contentTypeSlug: string;
  contentTypeName: string;
  slug: string;
  status: EntryStatus;
  data: Record<string, unknown>;
  authorId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RevisionRecord = {
  id: string;
  revisionNumber: number;
  status: EntryStatus;
  data: Record<string, unknown>;
  authorId: string;
  createdAt: string;
};

export type EntryListFilters = {
  page?: number;
  limit?: number;
  contentTypeSlug?: string;
  status?: EntryStatus;
};

/**
 * Paginacion y filtros en memoria (patron de log): clamp 1..50 y corte
 * por pagina. La version DB delega en range() + count exact.
 */
export function paginate<T>(
  items: T[],
  filters: EntryListFilters,
): { data: T[]; total: number; page: number; limit: number } {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
}
