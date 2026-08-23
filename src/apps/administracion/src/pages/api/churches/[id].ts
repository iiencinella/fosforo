import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { createAuditLog } from "@/lib/admin-data";
import { requireApiAuth } from "@/lib/auth";
import { churchSchema, patchChurchStatusSchema } from "@/lib/validators";
import { supabase } from "@/db/supabase";
import { log } from "@/lib/log";

export const GET: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const id = params.id;
  if (!id) return jsonError("Missing id", 400);

  const { data, error } = await supabase
    .from("churches")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    log.error("Fallo obteniendo iglesia", { error: error.message, id });
    return jsonError(error.message, 500);
  }
  if (!data) return jsonError("Church not found", 404);
  return jsonOk({ church: data });
};

export const PUT: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin", "editor"]);
  if (!auth.ok) return auth.response;

  const id = params.id;
  if (!id) return jsonError("Missing id", 400);

  const payload = await parseJsonBody<Record<string, unknown>>(request);
  if (!payload) return jsonError("Invalid payload", 400);

  const parsed = churchSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Validation error", 422);

  const { data, error } = await supabase
    .from("churches")
    .update(parsed.data)
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) {
    log.error("Fallo actualizando iglesia", {
      error: error?.message,
      id,
    });
    return jsonError(error?.message ?? "Cannot update church", 500);
  }

  await createAuditLog({
    userId: auth.session.userId,
    action: "update",
    resourceType: "church",
    resourceId: id,
  });

  return jsonOk({ id: data.id });
};

export const PATCH: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const id = params.id;
  if (!id) return jsonError("Missing id", 400);

  const payload = await parseJsonBody<Record<string, unknown>>(request);
  if (!payload) return jsonError("Invalid payload", 400);

  const parsed = patchChurchStatusSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Validation error", 422);

  const { data, error } = await supabase
    .from("churches")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) {
    log.error("Fallo cambiando estado de iglesia", {
      error: error?.message,
      id,
      status: parsed.data.status,
    });
    return jsonError(error?.message ?? "Cannot change status", 500);
  }

  await createAuditLog({
    userId: auth.session.userId,
    action: "status_change",
    resourceType: "church",
    resourceId: id,
    details: { status: parsed.data.status },
  });

  return jsonOk({ id: data.id, status: parsed.data.status });
};
