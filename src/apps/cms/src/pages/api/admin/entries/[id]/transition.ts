import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { CMS_APP_SLUG, requireAppPermission } from "@/lib/authz";
import { createEntriesRepository } from "@/lib/entries-repository";
import { queuePublishNotifications } from "@/lib/webhooks-dispatch";
import {
  CMS_003_NOT_IN_REVIEW,
  CMS_REASON_REQUIRED,
  CMS_TRANSITION_INVALID,
  entryTransitionSchema,
  type EditorialRole,
} from "@/lib/entries";

const EDITORIAL_ROLES: EditorialRole[] = ["admin", "editor", "revisor"];

function errorStatus(message: string): number {
  if (message === CMS_REASON_REQUIRED) return 422;
  if (message === CMS_TRANSITION_INVALID) return 403;
  if (message === CMS_003_NOT_IN_REVIEW) return 409;
  if (message === "CMS_ENTRY_NOT_FOUND") return 404;
  return 500;
}

/**
 * Transicion de estado (FR-CMS-004, UC-CMS-004/005/006, RB-CMS-007).
 * La maquina de estados se valida en la app (workflow) y en RLS
 * (migracion del paso 2). Cada transicion queda en content_audit_log.
 */
export const POST: APIRoute = async ({ request, params }) => {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const entryId = params.id;
  if (!entryId) {
    return jsonError("CMS_ENTRY_NOT_FOUND", 404);
  }

  const role = session.profile.roleSlug;
  if (!EDITORIAL_ROLES.includes(role as EditorialRole)) {
    return jsonError("CMS_ROLE_FORBIDDEN", 403);
  }

  const contentTypeHeader = request.headers.get("content-type") ?? "";
  const isFormData = !contentTypeHeader.includes("application/json");

  let raw: unknown;
  if (isFormData) {
    const formData = await request.formData();
    raw = {
      action: formData.get("action"),
      reason: formData.get("reason") || undefined,
    };
  } else {
    raw = await request.json().catch(() => null);
    if (!raw) {
      return jsonError("CMS_INVALID_JSON", 400);
    }
  }

  const parsed = entryTransitionSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "CMS_INVALID_PAYLOAD",
      422,
    );
  }

  const repository = createEntriesRepository();
  try {
    const entry = await repository.transition(
      session.token,
      entryId,
      parsed.data.action,
      parsed.data.reason,
      session.user.id,
      role as EditorialRole,
    );

    // FR-CMS-010 / RB-CMS-010: al publicar se disparan (fire-and-forget)
    // la invalidacion de cache, los webhooks firmados y el evento RUM.
    if (parsed.data.action === "approve") {
      queuePublishNotifications({
        contentTypeSlug: entry.contentTypeSlug,
        slug: entry.slug,
      });
    }

    if (isFormData) {
      return new Response(null, {
        status: 303,
        headers: {
          location: `/admin/entries/${entryId}?ok=${parsed.data.action}`,
        },
      });
    }

    return jsonOk({ entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const known = [
      "CMS_ENTRY_NOT_FOUND",
      CMS_003_NOT_IN_REVIEW,
      CMS_TRANSITION_INVALID,
      CMS_REASON_REQUIRED,
    ];
    if (known.includes(message)) {
      return jsonError(message, errorStatus(message));
    }
    return jsonError("CMS_TRANSITION_FAILED", 500);
  }
};

export const prerender = false;
