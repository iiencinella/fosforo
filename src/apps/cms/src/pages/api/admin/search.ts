import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { CMS_APP_SLUG, requireAppPermission } from "@/lib/authz";
import { CMS_007_QUERY_TOO_SHORT, searchQuerySchema } from "@/lib/media";
import { searchEntries } from "@/lib/search-repository";

/**
 * Busqueda del panel (FR-CMS-009, UC-CMS-007). RPC security invoker con
 * el token del usuario: la RLS del paso 2 filtra los estados por rol.
 * Minimo 3 caracteres (CMS-007).
 */
export const GET: APIRoute = async ({ request, url }) => {
  let session;
  try {
    session = await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const query = url.searchParams.get("q") ?? "";
  const parsed = searchQuerySchema.safeParse(query);
  if (!parsed.success) {
    return jsonError(CMS_007_QUERY_TOO_SHORT, 422);
  }

  const contentTypeParam = url.searchParams.get("content_type");
  const limit = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get("limit") ?? 20) || 20),
  );

  try {
    const results = await searchEntries({
      query: parsed.data,
      contentTypeSlug: contentTypeParam ?? undefined,
      statuses: null, // RLS filtra por rol (security invoker)
      limit,
      scope: "user",
      accessToken: session.token,
    });
    return jsonOk({ query: parsed.data, results });
  } catch {
    return jsonError("CMS_SEARCH_FAILED", 500);
  }
};

export const prerender = false;
