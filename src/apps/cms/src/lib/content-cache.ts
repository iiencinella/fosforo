import { createHash } from "node:crypto";

/**
 * Cache en memoria para la API de lectura (FR-CMS-007, ADR-CMS-004).
 * TTL configurable con tope de 5 minutos (RB-CMS-010). Por instancia de
 * servidor; el cache de borde lo aporta Vercel via s-maxage en las
 * respuestas. La invalidacion por content type la usa el webhook de
 * publicacion (paso 9, RB-CMS-010).
 */

export const CACHE_TTL_MAX_MS = 5 * 60_000;

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const store = new Map<string, CacheEntry>();

/** TTL por defecto; el tope de 5 min se aplica en setInCache. */
export function defaultCacheTtlMs(): number {
  const envValue = Number(process.env.CMS_CACHE_TTL_SECONDS ?? 300);
  if (!Number.isFinite(envValue) || envValue <= 0) {
    return CACHE_TTL_MAX_MS;
  }
  return Math.min(envValue, 300) * 1000;
}

export function cacheKeyFor(
  contentTypeSlug: string,
  options: { slug?: string; term?: string; page?: number; limit?: number } = {},
): string {
  const term = options.term ?? "*";
  if (options.slug) {
    return `cms:${contentTypeSlug}:slug:${options.slug}`;
  }
  return `cms:${contentTypeSlug}:list:${term}:p${options.page ?? 1}:l${options.limit ?? 20}`;
}

export function getFromCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setInCache(key: string, value: unknown, ttlMs: number): void {
  // RB-CMS-010/NFR: el TTL nunca supera los 5 minutos.
  const clamped = Math.min(Math.max(ttlMs, 1_000), CACHE_TTL_MAX_MS);
  store.set(key, { value, expiresAt: Date.now() + clamped });
}

/** Invalida todas las claves de un content type (publicacion/archivado). */
export function invalidateContentType(contentTypeSlug: string): number {
  const prefix = `cms:${contentTypeSlug}:`;
  let removed = 0;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
      removed += 1;
    }
  }
  return removed;
}

export function clearCacheForTests(): void {
  store.clear();
}

export function extractApiKey(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/** Errores del catalogo de la API de lectura (03-FRD §4). */
export const CMS_005_API_KEY_INVALIDA = "CMS_005_API_KEY_INVALIDA";
export const CMS_006_RATE_LIMITED = "CMS_006_RATE_LIMITED";
export const CMS_CONTENT_TYPE_NOT_FOUND = "CMS_CONTENT_TYPE_NOT_FOUND";
