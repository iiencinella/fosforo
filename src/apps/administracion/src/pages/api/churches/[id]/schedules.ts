import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { createAuditLog } from "@/lib/admin-data";
import { requireApiAuth } from "@/lib/auth";
import {
  scheduleInputToRow,
  scheduleRowToUi,
  scheduleSchema,
} from "@/lib/validators";
import { supabase } from "@/db/supabase";
import { randomUUID } from "node:crypto";

export const GET: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const churchId = params.id;
  if (!churchId) return jsonError("Missing church id", 400);

  const { data, error } = await supabase
    .from("horarios_celebrations")
    .select("*")
    .eq("temple_id", churchId);

  if (error) return jsonError(error.message, 500);

  const schedules = (data ?? [])
    .map((row) => scheduleRowToUi(row))
    .sort(
      (a, b) =>
        a.weekday - b.weekday || a.start_time.localeCompare(b.start_time),
    );

  return jsonOk({ schedules });
};

export const POST: APIRoute = async ({ request, params, redirect }) => {
  const auth = await requireApiAuth(request, ["admin", "editor"]);
  if (!auth.ok) return auth.response;

  const churchId = params.id;
  if (!churchId) return jsonError("Missing church id", 400);

  const isForm =
    request.headers
      .get("content-type")
      ?.includes("application/x-www-form-urlencoded") ||
    request.headers.get("content-type")?.includes("multipart/form-data");

  let payload: Record<string, unknown> | null;
  if (isForm) {
    const form = await request.formData();
    payload = {
      celebration_type: form.get("celebration_type"),
      weekday: Number(form.get("weekday")),
      start_time: form.get("start_time"),
      duration_min: form.get("duration_min")
        ? Number(form.get("duration_min"))
        : undefined,
      notes: form.get("notes") || null,
    };
  } else {
    payload = await parseJsonBody<Record<string, unknown>>(request);
  }

  if (!payload) return jsonError("Invalid payload", 400);

  const parsed = scheduleSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Validation error", 422);

  const row = scheduleInputToRow(parsed.data, randomUUID(), churchId);

  const { data: collision } = await supabase
    .from("horarios_celebrations")
    .select("id")
    .eq("temple_id", churchId)
    .eq("weekday", row.weekday)
    .eq("start_time", row.start_time)
    .limit(1)
    .maybeSingle();

  if (collision) return jsonError("Schedule overlap for this day/hour", 409);

  const { data, error } = await supabase
    .from("horarios_celebrations")
    .insert(row)
    .select("id")
    .single();

  if (error || !data)
    return jsonError(error?.message ?? "Cannot create schedule", 500);

  await createAuditLog({
    userId: auth.session.userId,
    action: "create",
    resourceType: "schedule",
    resourceId: data.id,
    details: { templeId: churchId },
  });

  if (isForm) {
    return redirect(`/admin/iglesias/${churchId}`);
  }

  return jsonOk({ id: data.id }, 201);
};
