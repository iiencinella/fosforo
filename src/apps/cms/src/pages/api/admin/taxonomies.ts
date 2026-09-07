import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import {
  CMS_APP_SLUG,
  requireAdminSession,
  requireAppPermission,
} from "@/lib/authz";
import { createTaxonomiesRepository } from "@/lib/taxonomies-repository";
import { taxonomyCreateSchema } from "@/lib/taxonomies";

/**
 * Taxonomias (FR-CMS-003, UC-CMS-010).
 * GET: listar con terminos (roles del cms). POST: crear (solo admin,
 * RB-CMS-004). Acepta JSON y form-data (panel SSR).
 */
export const GET: APIRoute = async ({ request }) => {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const repository = createTaxonomiesRepository();
  const taxonomies = await repository.list(session.token);

  return jsonOk({ taxonomies });
};

function mapWriteError(
  message: string,
): { error: string; status: number } | null {
  if (message === "CMS_TAXONOMY_SLUG_DUPLICADO") {
    return { error: "CMS_TAXONOMY_SLUG_DUPLICADO", status: 409 };
  }
  if (message === "CMS_TERM_DUPLICADO") {
    return { error: "CMS_TERM_DUPLICADO", status: 409 };
  }
  if (message === "CMS_TAXONOMY_NOT_FOUND") {
    return { error: "CMS_TAXONOMY_NOT_FOUND", status: 404 };
  }
  if (message === "CMS_TAXONOMY_WRITE_FAILED") {
    return { error: "CMS_TAXONOMY_WRITE_FAILED", status: 500 };
  }
  return null;
}

async function handleCreateTaxonomy(request: Request): Promise<Response> {
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
    };
  } else {
    raw = await request.json().catch(() => null);
    if (!raw) {
      return jsonError("CMS_INVALID_JSON", 400);
    }
  }

  const parsed = taxonomyCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "CMS_INVALID_PAYLOAD",
      422,
    );
  }

  const repository = createTaxonomiesRepository();
  try {
    const taxonomy = await repository.createTaxonomy(
      session.token,
      parsed.data,
      {
        actorId: session.user.id,
      },
    );

    if (isFormData) {
      return new Response(null, {
        status: 303,
        headers: {
          location: `/admin/taxonomies?ok=${encodeURIComponent(taxonomy.slug)}`,
        },
      });
    }

    return jsonOk({ taxonomy }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const mapped = mapWriteError(message);
    if (mapped) {
      if (isFormData) {
        const label =
          mapped.error === "CMS_TAXONOMY_SLUG_DUPLICADO"
            ? "CMS-001: Slug de taxonomia duplicado"
            : mapped.error;
        return new Response(null, {
          status: 303,
          headers: {
            location: `/admin/taxonomies?error=${encodeURIComponent(label)}`,
          },
        });
      }
      return jsonError(mapped.error, mapped.status);
    }
    return jsonError("CMS_TAXONOMY_CREATE_FAILED", 500);
  }
}

export const POST: APIRoute = async ({ request }) => {
  return handleCreateTaxonomy(request);
};

export const prerender = false;
