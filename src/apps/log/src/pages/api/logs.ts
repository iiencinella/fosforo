import type { APIRoute } from "astro";
import { jsonError, parseJsonBody } from "@repo/api-utils";
import {
  apiKeySchema,
  logIngestPayloadSchema,
  logLevelSchema,
} from "@/lib/log-data";
import { createLogRepository } from "@/lib/log-repository";
import { hashApiKey } from "@/lib/hash";
import { requireRole } from "@/lib/authz";

function parsePagination(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const GET: APIRoute = async ({ request, url }) => {
  try {
    await requireRole(request, ["dev", "ops"]);
  } catch {
    return jsonError("LOG_ACCESS_DENIED", 403);
  }

  const levelParam = url.searchParams.get("level");
  const level = levelParam
    ? logLevelSchema.safeParse(levelParam).data
    : undefined;

  const page = parsePagination(url.searchParams.get("page"), 1);
  const limit = parsePagination(url.searchParams.get("limit"), 50);

  const repository = createLogRepository();
  const result = await repository.list({
    page,
    limit,
    level,
    app: url.searchParams.get("app") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    since: url.searchParams.get("since") ?? undefined,
    until: url.searchParams.get("until") ?? undefined,
  });

  return new Response(JSON.stringify({ ok: true, ...result }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const rawKey = request.headers.get("x-api-key");
  const parsedKey = apiKeySchema.safeParse(rawKey);
  if (!parsedKey.success) {
    return jsonError("Invalid or missing API key", 401);
  }

  const apiKeyHash = hashApiKey(parsedKey.data);

  const repository = createLogRepository();
  const apiKey = await repository.verifyApiKey(apiKeyHash);
  if (!apiKey || !apiKey.is_active) {
    return jsonError("Invalid or missing API key", 401);
  }

  const payload = await parseJsonBody<unknown>(request);
  if (!payload) {
    return jsonError("Invalid JSON payload", 400);
  }

  const parsedPayload = logIngestPayloadSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return jsonError(
      parsedPayload.error.issues[0]?.message ?? "Invalid payload",
      422,
    );
  }

  const entry = await repository.insert(parsedPayload.data, apiKeyHash);

  return new Response(JSON.stringify({ ok: true, id: entry.id }), {
    status: 201,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
};

export const prerender = false;
