import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { CMS_APP_SLUG, requireAppPermission } from "@/lib/authz";
import { createContentTypesRepository } from "@/lib/content-types-repository";
import { createEntriesRepository } from "@/lib/entries-repository";
import { entryCreateSchema } from "@/lib/entries";

/**
 * Entradas (FR-CMS-002, UC-CMS-002).
 * GET: listado editorial con paginacion y filtros (roles del cms).
 * POST: crear borrador (editor/admin; el revisor no crea, RB-CMS-004).
 * Acepta JSON y form-data (panel SSR).
 */
export const GET: APIRoute = async ({ request, url }) => {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const repository = createEntriesRepository();
  const result = await repository.list(session.token, {
    page: Number(url.searchParams.get("page") ?? 1) || 1,
    limit: Number(url.searchParams.get("limit") ?? 20) || 20,
    contentTypeSlug: url.searchParams.get("content_type") ?? undefined,
    status: (url.searchParams.get("status") ?? undefined) as
      "draft" | "review" | "published" | "archived" | undefined,
  });

  return jsonOk(result);
};

async function parseCreateInput(
  request: Request,
): Promise<
  | { ok: true; raw: unknown; isFormData: boolean }
  | { ok: false; response: Response }
> {
  const contentTypeHeader = request.headers.get("content-type") ?? "";
  const isFormData = !contentTypeHeader.includes("application/json");

  let raw: unknown;
  if (isFormData) {
    const formData = await request.formData();
    raw = {
      content_type_slug: formData.get("content_type_slug"),
      slug: formData.get("slug"),
      data: formData.get("data"),
    };
    const dataValue = (raw as { data?: unknown }).data;
    if (typeof dataValue === "string") {
      try {
        (raw as { data: unknown }).data = JSON.parse(dataValue);
      } catch {
        return {
          ok: false,
          response: jsonError("CMS_DATA_INVALID_JSON", 422),
        };
      }
    }
  } else {
    raw = await request.json().catch(() => null);
    if (!raw) {
      return { ok: false, response: jsonError("CMS_INVALID_JSON", 400) };
    }
  }

  return { ok: true, raw, isFormData };
}

async function handleCreate(request: Request): Promise<Response> {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const role = session.profile.roleSlug;
  // RB-CMS-004: solo editor y admin crean entradas.
  if (role !== "editor" && role !== "admin") {
    return jsonError("CMS_ROLE_FORBIDDEN", 403);
  }

  const parsedInput = await parseCreateInput(request);
  if (!parsedInput.ok) {
    return parsedInput.response;
  }

  const parsed = entryCreateSchema.safeParse(parsedInput.raw);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "CMS_INVALID_PAYLOAD",
      422,
    );
  }

  const contentTypesRepository = createContentTypesRepository();
  const contentType = await contentTypesRepository.getBySlug(
    session.token,
    parsed.data.content_type_slug,
  );
  if (!contentType) {
    return jsonError("CMS_CONTENT_TYPE_NOT_FOUND", 404);
  }

  const repository = createEntriesRepository();
  try {
    const entry = await repository.create(
      session.token,
      {
        contentTypeId: contentType.id,
        contentTypeSlug: contentType.slug,
        contentTypeName: contentType.name,
        slug: parsed.data.slug,
        data: parsed.data.data,
        fields: contentType.fields,
      },
      session.user.id,
    );

    if (parsedInput.isFormData) {
      return new Response(null, {
        status: 303,
        headers: { location: `/admin/entries/${entry.id}?ok=created` },
      });
    }

    return jsonOk({ entry }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "CMS_ENTRY_SLUG_DUPLICADO") {
      return jsonError("CMS_ENTRY_SLUG_DUPLICADO", 409);
    }
    if (message.startsWith("CMS_002_MISSING_FIELDS")) {
      return jsonError(message, 422);
    }
    if (message.startsWith("CMS_DATA_INVALID")) {
      return jsonError(message, 422);
    }
    return jsonError("CMS_ENTRY_CREATE_FAILED", 500);
  }
}

export const POST: APIRoute = async ({ request }) => {
  return handleCreate(request);
};

export const prerender = false;
