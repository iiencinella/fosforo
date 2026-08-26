import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { requireApiAuth } from "@/lib/auth";
import { listPeople } from "@/lib/roles";
import { log } from "@/lib/log";

export const GET: APIRoute = async ({ request, url }) => {
  const auth = await requireApiAuth(request, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;

  try {
    const result = await listPeople(auth.session.token, {
      search: url.searchParams.get("search") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });
    return jsonOk({ data: result });
  } catch (error) {
    log.error("Fallo listando personas", { error });
    return jsonError("ADMIN_PEOPLE_LIST_FAILED", 500);
  }
};
