import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { buildRumClientKey, hashUserAgent } from "@/lib/rum-client";
import { createRumRepository } from "@/lib/rum-repository";
import {
  METADATA_MAX_BYTES,
  findPiiViolations,
  rumEventPayloadSchema,
  samplingAllows,
} from "@/lib/rum-data";

const textEncoder = new TextEncoder();

/**
 * POST /api/rum — Ingesta publica anonima de eventos de producto
 * (FR-LOG-RUM-002). Sin API key; proteccion por rate limit (SEC-LOG-RUM-003),
 * taxonomia whitelist (ADR-LOG-RUM-007), anti-PII (SEC-LOG-RUM-001/004) y
 * sampling configurable (FR-LOG-RUM-007).
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

  const parsed = rumEventPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("RUM_INVALID_PAYLOAD", 422);
  }

  const payload = parsed.data;

  // Sin consentimiento el evento se descarta silenciosamente
  // (SEC-LOG-RUM-002, RB-LOG-RUM-005).
  if (payload.has_consent === false) {
    return jsonOk({ dropped: "no_consent" as const }, 200);
  }

  if (
    payload.metadata &&
    textEncoder.encode(JSON.stringify(payload.metadata)).length >
      METADATA_MAX_BYTES
  ) {
    return jsonError("RUM_METADATA_TOO_LARGE", 422);
  }

  const violations = findPiiViolations(payload.metadata);
  if (violations.length > 0) {
    return jsonError("RUM_PII_DETECTED", 422);
  }

  const sampling = await repository.getSamplingConfig(payload.app);
  if (!samplingAllows(sampling, payload.event_name)) {
    return jsonOk({ dropped: "sampling" as const }, 200);
  }

  const userAgentHash = hashUserAgent(request);

  const id = await repository.insertEvent(payload, userAgentHash);

  // El conteo de sesion es secundario: nunca rompe la ingesta del evento.
  await repository.upsertSession({
    app: payload.app,
    sessionId: payload.session_id_anon,
    pagePath: payload.page_path ?? null,
    eventName: payload.event_name,
  });

  return jsonOk({ id }, 201);
};

export const prerender = false;
