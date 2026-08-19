import type { APIRoute } from "astro";
import { jsonError, jsonOk } from "@repo/api-utils";
import { listLiturgicalTimes } from "@/lib/server/repository";
import { log } from "@/lib/log";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const payload = await listLiturgicalTimes();
    return jsonOk(payload);
  } catch (error) {
    log.error("Failed to fetch tiempos", { error });
    return jsonError("No se pudieron cargar los tiempos litúrgicos", 500);
  }
};
