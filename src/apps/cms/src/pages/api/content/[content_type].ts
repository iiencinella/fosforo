import type { APIRoute } from "astro";
import { jsonError } from "@repo/api-utils";
import {
  cacheKeyFor,
  defaultCacheTtlMs,
  extractApiKey,
  getFromCache,
  hashApiKey,
  setInCache,
} from "@/lib/content-cache";
import {
  createContentReadRepository,
  mapPublishedEntry,
  markdownFieldNames,
  type PublishedRow,
} from "@/lib/content-read-repository";
import { renderMarkdownSafe } from "@/lib/markdown";

export const RATE_LIMIT_PER_MINUTE = 100;
export const RATE_LIMIT_WINDOW_SECONDS = 60;

const CACHE_HEADERS: Record<string, string> = {
  "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
  "content-type": "application/json",
};

function buildResponse(
  payload: unknown,
  cacheHeader: "HIT" | "MISS",
  status = 200,
) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CACHE_HEADERS,
      "x-cache": cacheHeader,
    },
  });
}

function renderEntry(row: PublishedRow) {
  const entry = mapPublishedEntry(row);
  const names = markdownFieldNames((row.content_types?.fields ?? []) as never);
  for (const name of names) {
    const value = entry.data[name];
    if (typeof value === "string") {
      entry.rendered[name] = renderMarkdownSafe(value);
    }
  }
  return entry;
}

/**
 * GET /api/content/{content_type} — API de lectura publica (FR-CMS-006,
 * UC-CMS-008, ADR-CMS-007). Solo entradas published (RB-CMS-005).
 * Auth: API key por app consumidora (SEC-CMS-006, rate limit 100/min).
 * Cache: en memoria por instancia (TTL <= 5 min, ADR-CMS-004) + edge
 * s-maxage=300 (NFR-CMS-002: p95 < 50ms hit / < 200ms miss).
 *
 * Query: ?slug= (una entrada) · ?term= (taxonomia) · ?page= · ?limit=
 */
export const GET: APIRoute = async ({ request, url, params }) => {
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
        headers: {
          "content-type": "application/json",
          "retry-after": "60",
        },
      },
    );
  }

  await repository.touchLastUsed(keyRow.id);

  const contentTypeSlug = params.content_type ?? "";
  const slug = url.searchParams.get("slug") ?? undefined;
  const term = url.searchParams.get("term") ?? undefined;
  const page = Number(url.searchParams.get("page") ?? 1) || 1;
  const limit = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get("limit") ?? 20) || 20),
  );

  const key = cacheKeyFor(contentTypeSlug, { slug, term, page, limit });
  const cached = getFromCache<unknown>(key);
  if (cached !== null) {
    return buildResponse(cached, "HIT");
  }

  const ttlMs = defaultCacheTtlMs();

  if (slug) {
    const row = await repository.getPublished(contentTypeSlug, slug);
    if (!row) {
      return jsonError("CMS_ENTRY_NOT_FOUND", 404);
    }
    const payload = { ok: true, entry: renderEntry(row) };
    setInCache(key, payload, ttlMs);
    return buildResponse(payload, "MISS");
  }

  const result = await repository.listPublished(contentTypeSlug, {
    term,
    page,
    limit,
  });

  if (!result) {
    return jsonError("CMS_CONTENT_TYPE_NOT_FOUND", 404);
  }

  const payload = {
    ok: true,
    total: result.total,
    page: result.page,
    limit: result.limit,
    data: result.data.map(renderEntry),
  };
  setInCache(key, payload, ttlMs);
  return buildResponse(payload, "MISS");
};

export const prerender = false;
