import type { APIRoute } from "astro";
import { jsonError, jsonOk, parseJsonBody } from "@repo/api-utils";
import { createAuditLog } from "@/lib/admin-data";
import { requireApiAuth } from "@/lib/auth";
import { churchSchema } from "@/lib/validators";
import { supabase } from "@/db/supabase";

export const GET: APIRoute = async ({ request, url }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const q = (url.searchParams.get("q") ?? "").trim();

  let query = supabase
    .from("churches")
    .select("id, name, city, province, country, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,city.ilike.%${q}%,province.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);
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
      address: form.get("address") || null,
      city: form.get("city"),
      province: form.get("province") || null,
      country: form.get("country") || null,
      latitude: maybeNumber(form.get("latitude")),
      longitude: maybeNumber(form.get("longitude")),
      phone: form.get("phone") || null,
      email: form.get("email") || null,
      website: form.get("website") || null,
      status: "active",
    };
  } else {
    payload = await parseJsonBody<Record<string, unknown>>(request);
  }

  if (!payload) return jsonError("Invalid payload", 400);

  const parsed = churchSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Validation error", 422);

  const { data: duplicate } = await supabase
    .from("churches")
    .select("id")
    .eq("name", parsed.data.name)
    .eq("city", parsed.data.city)
    .limit(1)
    .maybeSingle();

  if (duplicate) return jsonError("Church already exists in this city", 409);

  const { data, error } = await supabase
    .from("churches")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data)
    return jsonError(error?.message ?? "Cannot create church", 500);

  await createAuditLog({
    userId: auth.session.userId,
    action: "create",
    resourceType: "church",
    resourceId: data.id,
    details: { name: parsed.data.name, city: parsed.data.city },
  });

  if (isForm) {
    return redirect(`/admin/iglesias/${data.id}`);
  }

  return jsonOk({ id: data.id }, 201);
};
