import type { APIRoute } from "astro";
import { jsonOk } from "@repo/api-utils";
import { getDashboardMetrics } from "@/lib/admin-data";
import { requireApiAuth } from "@/lib/auth";

export const GET: APIRoute = async ({ request }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  const metrics = await getDashboardMetrics();
  return jsonOk(metrics);
};
