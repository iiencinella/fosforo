import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { buildRumClientKey } from "@/lib/rum-client";
import { createRumRepository } from "@/lib/rum-repository";
import { findPiiViolations, rumVitalPayloadSchema } from "@/lib/rum-data";

/**
 * POST /api/rum/vitals — Ingesta publica anonima de Web Vitals
 * (FR-LOG-RUM-003, IR-LOG-RUM-003). Sin API key; rate limit y anti-PII
 * identicos a POST /api/rum. Los Web Vitals no aplican sampling
 * (volumen acotado: una metrica por pagina).
 */
export const POST: APIRoute = async ({ request }) => {
  const repository = createRumRepository();

  const allowed = await repository.checkRateLimit(buildRumClientKey(request));
  if (!allowed) {
    return new Response(
      JSON.stringify({ ok: false, error: "RUM_RATE_LIMITED" }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": "60",
        },
      },
    );
  }

  const body = await parseJsonBody(request);
  if (!body) {
    return jsonError("RUM_INVALID_JSON", 400);
  }

  const parsed = rumVitalPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("RUM_INVALID_PAYLOAD", 422);
  }

  const payload = parsed.data;

  const violations = findPiiViolations({
    page_url: payload.page_url,
    page_path: payload.page_path,
  });
  if (violations.length > 0) {
    return jsonError("RUM_PII_DETECTED", 422);
  }

  const id = await repository.insertVital(payload);

  return jsonOk({ id }, 201);
};

export const prerender = false;
