import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { CMS_APP_SLUG, requireAppPermission } from "@/lib/authz";
import { createEntriesRepository } from "@/lib/entries-repository";
import { entryUpdateSchema } from "@/lib/entries";

/**
 * Detalle y edicion de una entrada (FR-CMS-002, UC-CMS-003).
 * GET: entrada + revisiones. PUT: nueva revision con locking optimista
 * (JSON). POST: lo mismo en form-data para el panel SSR.
 */
export const GET: APIRoute = async ({ request, params }) => {
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

  const repository = createEntriesRepository();
  const entry = await repository.getById(session.token, entryId);
  if (!entry) {
    return jsonError("CMS_ENTRY_NOT_FOUND", 404);
  }

  const revisions = await repository.listRevisions(session.token, entryId);

  return jsonOk({ entry, revisions });
};

async function handleUpdate(
  request: Request,
  entryId: string | undefined,
): Promise<Response> {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  if (!entryId) {
    return jsonError("CMS_ENTRY_NOT_FOUND", 404);
  }

  const contentTypeHeader = request.headers.get("content-type") ?? "";
  const isFormData = !contentTypeHeader.includes("application/json");

  let raw: unknown;
  if (isFormData) {
    const formData = await request.formData();
    raw = {
      data: formData.get("data"),
      expected_updated_at: formData.get("expected_updated_at"),
    };
    const dataValue = (raw as { data?: unknown }).data;
    if (typeof dataValue === "string") {
      try {
        (raw as { data: unknown }).data = JSON.parse(dataValue);
      } catch {
        return jsonError("CMS_DATA_INVALID_JSON", 422);
      }
    }
  } else {
    raw = await request.json().catch(() => null);
    if (!raw) {
      return jsonError("CMS_INVALID_JSON", 400);
    }
  }

  const parsed = entryUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "CMS_INVALID_PAYLOAD",
      422,
    );
  }

  const repository = createEntriesRepository();
  try {
    const entry = await repository.update(
      session.token,
      entryId,
      {
        data: parsed.data.data,
        expectedUpdatedAt: parsed.data.expected_updated_at,
      },
      session.user.id,
    );

    if (isFormData) {
      return new Response(null, {
        status: 303,
        headers: {
          location: `/admin/entries/${entryId}?ok=saved`,
        },
      });
    }

    return jsonOk({ entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "CMS_ENTRY_NOT_FOUND") {
      return jsonError(message, 404);
    }
    if (message === "CMS_CONFLICT_STALE_UPDATE") {
      return jsonError(message, 409);
    }
    if (
      message.startsWith("CMS_002_MISSING_FIELDS") ||
      message.startsWith("CMS_DATA_INVALID")
    ) {
      return jsonError(message, 422);
    }
    return jsonError("CMS_ENTRY_UPDATE_FAILED", 500);
  }
}

export const PUT: APIRoute = async ({ request, params }) => {
  return handleUpdate(request, params.id);
};

export const POST: APIRoute = async ({ request, params }) => {
  return handleUpdate(request, params.id);
};

export const prerender = false;
