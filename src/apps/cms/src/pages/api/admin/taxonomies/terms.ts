import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { requireAdminSession } from "@/lib/authz";
import { createTaxonomiesRepository } from "@/lib/taxonomies-repository";
import { termCreateSchema } from "@/lib/taxonomies";

/**
 * Terminos de una taxonomia (FR-CMS-003, UC-CMS-010).
 * POST: crear termino (solo admin, RB-CMS-004). JSON y form-data.
 */
export const POST: APIRoute = async ({ request }) => {
  let session;
  try {
    session = await requireAdminSession(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("SESSION_EXPIRED")) {
      return jsonError("CMS_SESSION_EXPIRED", 401);
    }
    return jsonError("CMS_ADMIN_REQUIRED", 403);
  }

  const contentTypeHeader = request.headers.get("content-type") ?? "";
  const isFormData = !contentTypeHeader.includes("application/json");

  let raw: unknown;
  if (isFormData) {
    const formData = await request.formData();
    raw = {
      taxonomy_id: formData.get("taxonomy_id"),
      name: formData.get("name"),
      slug: formData.get("slug"),
    };
  } else {
    raw = await request.json().catch(() => null);
    if (!raw) {
      return jsonError("CMS_INVALID_JSON", 400);
    }
  }

  const parsed = termCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "CMS_INVALID_PAYLOAD",
      422,
    );
  }

  const repository = createTaxonomiesRepository();
  try {
    const term = await repository.createTerm(session.token, parsed.data, {
      actorId: session.user.id,
    });

    if (isFormData) {
      return new Response(null, {
        status: 303,
        headers: {
          location: `/admin/taxonomies?ok=${encodeURIComponent(term.slug)}`,
        },
      });
    }

    return jsonOk({ term }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "CMS_TERM_DUPLICADO") {
      return jsonError(message, 409);
    }
    if (message === "CMS_TAXONOMY_NOT_FOUND") {
      return jsonError(message, 404);
    }
    return jsonError("CMS_TAXONOMY_CREATE_FAILED", 500);
  }
};

export const prerender = false;
