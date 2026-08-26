import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { createAuditLog } from "@/lib/admin-data";
import { requireApiAuth } from "@/lib/auth";
import { templeInputToRow, templeSchema } from "@/lib/validators";
import { supabase } from "@/db/supabase";
import { log } from "@/lib/log";

const UNIQUE_VIOLATION = "23505";

export const GET: APIRoute = async ({ request, url }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const q = (url.searchParams.get("q") ?? "").trim();

  let query = supabase
    .from("horarios_temples")
    .select("id, name, city, province, country, status, is_active, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,city.ilike.%${q}%,province.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    log.error("Fallo listando iglesias", {
      error: error.message,
      search: q,
    });
    return jsonError(error.message, 500);
  }
  return jsonOk({ churches: data ?? [] });
};

export const POST: APIRoute = async ({ request, redirect }) => {
  const auth = await requireApiAuth(request, ["admin", "editor"]);
  if (!auth.ok) return auth.response;

  const isForm =
    request.headers
      .get("content-type")
      ?.includes("application/x-www-form-urlencoded") ||
    request.headers.get("content-type")?.includes("multipart/form-data");

  let payload: Record<string, unknown> | null = null;

  if (isForm) {
    const form = await request.formData();
    const maybeNumber = (value: FormDataEntryValue | null) => {
      const text = typeof value === "string" ? value.trim() : "";
      if (!text) return null;
      const num = Number(text);
      return Number.isNaN(num) ? null : num;
    };
    payload = {
      name: form.get("name"),
      address: form.get("address"),
      city: form.get("city"),
      province: form.get("province"),
      country: form.get("country"),
      latitude: maybeNumber(form.get("latitude")),
      longitude: maybeNumber(form.get("longitude")),
      phone: form.get("phone"),
      email: form.get("email"),
      website: form.get("website"),
      notes: form.get("notes"),
    };
  } else {
    payload = await parseJsonBody<Record<string, unknown>>(request);
  }

  if (!payload) return jsonError("Invalid payload", 400);

  const parsed = templeSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Validation error", 422);

  const row = templeInputToRow(parsed.data);

  const insert = async (templeId: string) =>
    supabase
      .from("horarios_temples")
      .insert({ ...row, id: templeId })
      .select("id")
      .single();

  // Resuelve colisiones de slug agregando sufijos -2, -3, ...
  let data: { id: string } | null = null;
  let lastError: string | null = null;
  for (let attempt = 1; attempt <= 5 && !data; attempt += 1) {
    const candidate = attempt === 1 ? row.id : `${row.id}-${attempt}`;
    const { data: inserted, error } = await insert(candidate);

    if (!error && inserted) {
      data = inserted;
      break;
    }

    lastError = error?.message ?? "unknown_error";
    if (error?.code !== UNIQUE_VIOLATION) {
      break;
    }
  }

  if (!data) {
    log.error("Fallo creando iglesia", {
      error: lastError,
      name: parsed.data.name,
      city: parsed.data.city,
    });
    return jsonError(lastError ?? "Cannot create church", 500);
  }

  await createAuditLog({
    userId: auth.session.userId,
    action: "create",
    resourceType: "temple",
    resourceId: data.id,
    details: { name: parsed.data.name, city: parsed.data.city },
  });

  if (isForm) {
    return redirect(`/admin/iglesias/${data.id}`);
  }

  return jsonOk({ id: data.id }, 201);
};
