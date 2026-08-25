type RateState = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

const rateStore = new Map<string, RateState>();

export function getIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}

/**
 * Limitador en memoria por instancia (5 req/min por IP).
 * Nota: en serverless cada instancia mantiene su propio contador; el
 * limitador distribuido queda como pendiente documentado del MVP.
 */
export function isRateLimited(ip: string, now = Date.now()): boolean {
  if (!ip || ip === "unknown") {
    return false;
  }

  const current = rateStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return true;
  }

  current.count += 1;
  rateStore.set(ip, current);
  return false;
}
