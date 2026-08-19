import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { createAuditLog } from "@/lib/admin-data";
import { requireApiAuth } from "@/lib/auth";
import { scheduleSchema } from "@/lib/validators";
import { supabase } from "@/db/supabase";

export const GET: APIRoute = async ({ request, params }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const churchId = params.id;
  if (!churchId) return jsonError("Missing church id", 400);

  const { data, error } = await supabase
    .from("celebration_schedules")
    .select("*")
    .eq("church_id", churchId)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return jsonError(error.message, 500);
  return jsonOk({ schedules: data ?? [] });
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
      valid_from: form.get("valid_from") || null,
      valid_to: form.get("valid_to") || null,
      notes: form.get("notes") || null,
    };
  } else {
    payload = await parseJsonBody<Record<string, unknown>>(request);
  }

  if (!payload) return jsonError("Invalid payload", 400);

  const parsed = scheduleSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Validation error", 422);

  const { data: collision } = await supabase
    .from("celebration_schedules")
    .select("id")
    .eq("church_id", churchId)
    .eq("weekday", parsed.data.weekday)
    .eq("start_time", parsed.data.start_time)
    .limit(1)
    .maybeSingle();

  if (collision) return jsonError("Schedule overlap for this day/hour", 409);

  const { data, error } = await supabase
    .from("celebration_schedules")
    .insert({
      ...parsed.data,
      church_id: churchId,
      created_by: auth.session.userId,
    })
    .select("id")
    .single();

  if (error || !data)
    return jsonError(error?.message ?? "Cannot create schedule", 500);

  await createAuditLog({
    userId: auth.session.userId,
    action: "create",
    resourceType: "schedule",
    resourceId: data.id,
    details: { churchId },
  });

  if (isForm) {
    return redirect(`/admin/iglesias/${churchId}`);
  }

  return jsonOk({ id: data.id }, 201);
};
