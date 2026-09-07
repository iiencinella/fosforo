import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { extractApiKey, hashApiKey } from "@/lib/content-cache";
import { CMS_007_QUERY_TOO_SHORT, searchQuerySchema } from "@/lib/media";
import { searchEntries } from "@/lib/search-repository";
import { createContentReadRepository } from "@/lib/content-read-repository";

export const RATE_LIMIT_PER_MINUTE = 100;
export const RATE_LIMIT_WINDOW_SECONDS = 60;

/**
 * GET /api/content/search?q=... — busqueda publica (FR-CMS-009, CMS-007).
 * Misma auth y rate limit que la API de lectura. Solo entradas published
 * (statuses=['published'] con service_role).
 */
export const GET: APIRoute = async ({ request, url }) => {
  const repository = createContentReadRepository();

  const apiKey = extractApiKey(request);
  if (!apiKey) {
    return jsonError("CMS_005_API_KEY_INVALIDA", 401);
  }

  const keyRow = await repository.verifyApiKey(hashApiKey(apiKey));
  if (!keyRow) {
    return jsonError("CMS_005_API_KEY_INVALIDA", 401);
  }

  const allowed = await repository.checkRateLimit(
    keyRow.id,
    RATE_LIMIT_PER_MINUTE,
    RATE_LIMIT_WINDOW_SECONDS,
  );
  if (!allowed) {
    return new Response(
      JSON.stringify({ ok: false, error: "CMS_006_RATE_LIMITED" }),
      {
        status: 429,
        headers: { "content-type": "application/json", "retry-after": "60" },
      },
    );
  }

  await repository.touchLastUsed(keyRow.id);

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
      statuses: ["published"],
      limit,
      scope: "service",
    });
    return jsonOk({ query: parsed.data, total: results.length, results });
  } catch {
    return jsonError("CMS_SEARCH_FAILED", 500);
  }
};

export const prerender = false;
