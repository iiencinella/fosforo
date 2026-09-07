import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import {
  CMS_APP_SLUG,
  requireAdminSession,
  requireAppPermission,
} from "@/lib/authz";
import { contentTypeCreateSchema } from "@/lib/content-types";
import { createContentTypesRepository } from "@/lib/content-types-repository";

/**
 * Content types (FR-CMS-001, UC-CMS-001).
 * GET: listar (admin, editor, revisor). POST: crear (solo admin,
 * RB-CMS-004/SEC-CMS-002). Acepta JSON y form-data (panel SSR).
 */
export const GET: APIRoute = async ({ request }) => {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const repository = createContentTypesRepository();
  const contentTypes = await repository.list(session.token);

  return jsonOk({ contentTypes });
};

async function handleCreate(request: Request): Promise<Response> {
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
      name: formData.get("name"),
      slug: formData.get("slug"),
      fields: formData.get("fields"),
    };
  } else {
    raw = await parseJsonBody(request);
    if (!raw) {
      return jsonError("CMS_INVALID_JSON", 400);
    }
  }

  // En form-data los fields viajan como JSON en un textarea.
  if (isFormData && typeof (raw as { fields?: unknown }).fields === "string") {
    try {
      (raw as { fields: unknown }).fields = JSON.parse(
        (raw as { fields: string }).fields,
      );
    } catch {
      return jsonError("CMS_FIELDS_INVALID_JSON", 422);
    }
  }

  const parsed = contentTypeCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "CMS_INVALID_PAYLOAD",
      422,
    );
  }

  const repository = createContentTypesRepository();
  try {
    const contentType = await repository.create(session.token, parsed.data, {
      action: "content_type_created",
      actorId: session.user.id,
      metadata: { name: parsed.data.name, slug: parsed.data.slug },
    });

    if (isFormData) {
      return new Response(null, {
        status: 303,
        headers: {
          location: `/admin/content-types?ok=${encodeURIComponent(contentType.slug)}`,
        },
      });
    }

    return jsonOk({ contentType }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "CMS_001_SLUG_DUPLICADO") {
      if (isFormData) {
        return new Response(null, {
          status: 303,
          headers: {
            location: `/admin/content-types?error=${encodeURIComponent("CMS-001: Slug de content type duplicado")}`,
          },
        });
      }
      return jsonError("CMS_001_SLUG_DUPLICADO", 409);
    }
    return jsonError("CMS_CONTENT_TYPE_CREATE_FAILED", 500);
  }
}

export const POST: APIRoute = async ({ request }) => {
  return handleCreate(request);
};

export const prerender = false;
