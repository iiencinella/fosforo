import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { z } from "zod";
import { CMS_APP_SLUG, requireAppPermission } from "@/lib/authz";
import { renderMarkdownSafe } from "@/lib/markdown";

const previewSchema = z.object({
  markdown: z.string().max(100_000),
});

/**
 * POST /api/admin/preview — render Markdown -> HTML sanitizado para la
 * vista previa del editor (SEC-CMS-007). Solo usuarios del cms.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    await requireAppPermission(request, CMS_APP_SLUG);
  } catch {
    return jsonError("CMS_ACCESS_DENIED", 403);
  }

  const body = await parseJsonBody(request);
  if (!body) {
    return jsonError("CMS_INVALID_JSON", 400);
  }

  const parsed = previewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("CMS_INVALID_PAYLOAD", 422);
  }

  return jsonOk({ html: renderMarkdownSafe(parsed.data.markdown) });
};

export const prerender = false;
