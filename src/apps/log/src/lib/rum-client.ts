import { createHash } from "node:crypto";

/**
 * Clave de cliente para rate limit anonimo: SHA-256 de IP + User-Agent.
 * Nunca se almacena la IP cruda (SEC-LOG-RUM-009), solo el hash combinado.
 */
export function buildRumClientKey(request: Request): string {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return createHash("sha256").update(`${ip}|${userAgent}`).digest("hex");
}

/**
 * Hash del User-Agent para fingerprinting anonimo de rum_events.
 * Nunca se persiste el User-Agent en texto plano.
 */
export function hashUserAgent(request: Request): string | null {
  const userAgent = request.headers.get("user-agent");
  if (!userAgent) {
    return null;
  }
  return createHash("sha256").update(userAgent).digest("hex");
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) {
      return first.trim();
    }
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
