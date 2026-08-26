import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { createAuditLog } from "@/lib/admin-data";
import { requireApiAuth } from "@/lib/auth";
import { scheduleInputToRow, scheduleSchema } from "@/lib/validators";
import { supabase } from "@/db/supabase";
import { log } from "@/lib/log";

export const PUT: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin", "editor"]);
  if (!auth.ok) return auth.response;

  const id = params.id;
  if (!id) return jsonError("Missing id", 400);

  const payload = await parseJsonBody<Record<string, unknown>>(request);
  if (!payload) return jsonError("Invalid payload", 400);

  const parsed = scheduleSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Validation error", 422);

  // El id y el templo asociado son estables en un update.
  const row = scheduleInputToRow(parsed.data, id);

  const { data, error } = await supabase
    .from("horarios_celebrations")
    .update(row)
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) {
    log.error("Fallo actualizando horario", { error: error?.message, id });
    return jsonError(error?.message ?? "Cannot update schedule", 500);
  }

  await createAuditLog({
    userId: auth.session.userId,
    action: "update",
    resourceType: "schedule",
    resourceId: id,
  });

  return jsonOk({ id: data.id });
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin"]);
  if (!auth.ok) return auth.response;

  const id = params.id;
  if (!id) return jsonError("Missing id", 400);

  const { error } = await supabase
    .from("horarios_celebrations")
    .delete()
    .eq("id", id);
  if (error) {
    log.error("Fallo eliminando horario", { error: error.message, id });
    return jsonError(error.message, 500);
  }

  await createAuditLog({
    userId: auth.session.userId,
    action: "delete",
    resourceType: "schedule",
    resourceId: id,
  });

  return jsonOk({ id });
};
