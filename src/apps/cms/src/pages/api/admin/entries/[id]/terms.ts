import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { z } from "zod";
import { CMS_APP_SLUG, requireAppPermission } from "@/lib/authz";
import { createTaxonomiesRepository } from "@/lib/taxonomies-repository";

const termsSchema = z.object({
  term_ids: z.array(z.uuid()).max(50),
});

/**
 * Asociacion N:M entrada <-> terminos (FR-CMS-003, UC-CMS-002).
 * POST: reemplaza el set completo de terminos de la entrada
 * (editor/admin; el revisor no edita, RB-CMS-004). JSON y form-data
 * (checkboxes name="term_ids" en el panel).
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
  if (role !== "editor" && role !== "admin") {
    return jsonError("CMS_ROLE_FORBIDDEN", 403);
  }

  const contentTypeHeader = request.headers.get("content-type") ?? "";
  const isFormData = !contentTypeHeader.includes("application/json");

  let termIds: string[];
  if (isFormData) {
    const formData = await request.formData();
    termIds = formData
      .getAll("term_ids")
      .filter((value): value is string => typeof value === "string");
  } else {
    const raw = await request.json().catch(() => null);
    const parsed = termsSchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? "CMS_INVALID_PAYLOAD",
        422,
      );
    }
    termIds = parsed.data.term_ids;
  }

  const repository = createTaxonomiesRepository();
  try {
    const assigned = await repository.setEntryTerms(
      session.token,
      entryId,
      termIds,
      {
        actorId: session.user.id,
      },
    );

    if (isFormData) {
      return new Response(null, {
        status: 303,
        headers: {
          location: `/admin/entries/${entryId}?ok=terms`,
        },
      });
    }

    return jsonOk({ termIds: assigned });
  } catch {
    return jsonError("CMS_TERMS_UPDATE_FAILED", 500);
  }
};

export const prerender = false;
