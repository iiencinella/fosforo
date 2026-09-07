import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { CMS_APP_SLUG, requireAppPermission } from "@/lib/authz";
import { mediaUploadSchema } from "@/lib/media";
import { deleteMedia, listMedia, uploadMedia } from "@/lib/media-repository";

/**
 * Medios (FR-CMS-008, UC-CMS-009). POST: subir imagen webp/jpeg <= 2MB
 * asociada a una entrada (editor/admin, RB-CMS-009); con _method=delete
 * elimina (override para forms HTML). GET: listar medios de una entrada.
 */
export const POST: APIRoute = async ({ request, url }) => {
  const methodOverride = url.searchParams.get("_method");
  if (methodOverride === "delete") {
    return handleDelete(request, url);
  }
  return handleUpload(request);
};

async function handleUpload(request: Request): Promise<Response> {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const role = session.profile.roleSlug;
  if (role !== "editor" && role !== "admin") {
    return jsonError("CMS_ROLE_FORBIDDEN", 403);
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return jsonError("CMS_INVALID_PAYLOAD", 400);
  }

  const parsed = mediaUploadSchema.safeParse({
    entry_id: formData.get("entry_id"),
  });
  if (!parsed.success) {
    return jsonError("CMS_INVALID_PAYLOAD", 422);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError("CMS_004_MEDIA_INVALIDA", 422);
  }

  try {
    const media = await uploadMedia(session.token, parsed.data.entry_id, {
      bytes: await file.arrayBuffer(),
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });

    // El formulario del panel envia return_to y recibe 303; la API
    // (multipart sin return_to) recibe 201 JSON.
    const returnTo = formData.get("return_to");
    if (typeof returnTo === "string" && returnTo.length > 0) {
      return new Response(null, {
        status: 303,
        headers: {
          location: `${returnTo}?ok=media`,
        },
      });
    }

    return jsonOk({ media }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "CMS_004_MEDIA_INVALIDA") {
      return jsonError(message, 422);
    }
    if (message === "CMS_ENTRY_NOT_FOUND") {
      return jsonError(message, 404);
    }
    return jsonError("CMS_MEDIA_UPLOAD_FAILED", 500);
  }
}

export const GET: APIRoute = async ({ request, url }) => {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const entryId = url.searchParams.get("entry_id");
  if (!entryId) {
    return jsonError("CMS_INVALID_PAYLOAD", 422);
  }

  try {
    const media = await listMedia(session.token, entryId);
    return jsonOk({ media });
  } catch {
    return jsonError("CMS_MEDIA_LIST_FAILED", 500);
  }
};

async function handleDelete(request: Request, url: URL): Promise<Response> {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const role = session.profile.roleSlug;
  if (role !== "editor" && role !== "admin") {
    return jsonError("CMS_ROLE_FORBIDDEN", 403);
  }

  const mediaId = url.searchParams.get("media_id");
  const returnTo = url.searchParams.get("return_to");
  if (!mediaId) {
    return jsonError("CMS_INVALID_PAYLOAD", 422);
  }

  try {
    await deleteMedia(session.token, mediaId);
    if (returnTo) {
      return new Response(null, {
        status: 303,
        headers: { location: `${returnTo}?ok=media_deleted` },
      });
    }
    return jsonOk({ deleted: mediaId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "CMS_MEDIA_NOT_FOUND") {
      return jsonError(message, 404);
    }
    return jsonError("CMS_MEDIA_DELETE_FAILED", 500);
  }
}

export const DELETE: APIRoute = async ({ request, url }) => {
  return handleDelete(request, url);
};

export const prerender = false;
