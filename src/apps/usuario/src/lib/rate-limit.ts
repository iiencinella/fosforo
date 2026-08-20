type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function consumeAuthRateLimit(scope: string, key: string): boolean {
  const now = Date.now();
  const bucketKey = `${scope}:${key}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_ATTEMPTS) return false;
  current.count += 1;
  return true;
}

export function resetAuthRateLimitForTests(): void {
  buckets.clear();
}
