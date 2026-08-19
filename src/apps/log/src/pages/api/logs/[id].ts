import type { APIRoute } from "astro";
import { jsonError } from "@repo/api-utils";
import { createLogRepository } from "@/lib/log-repository";
import { requireRole } from "@/lib/authz";

export const GET: APIRoute = async ({ request, params }) => {
  try {
    await requireRole(request, ["dev", "ops"]);
  } catch {
    return jsonError("LOG_ACCESS_DENIED", 403);
  }

  const id = params.id;
  if (!id) {
    return jsonError("Invalid log ID format", 400);
  }

  const repository = createLogRepository();
  const entry = await repository.getById(id);
  if (!entry) {
    return jsonError("Log not found", 404);
  }

  return new Response(JSON.stringify({ ok: true, entry }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
};

export const prerender = false;
