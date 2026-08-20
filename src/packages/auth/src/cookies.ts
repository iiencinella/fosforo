const ACCESS_COOKIE_NAME = "fosforo_access_token";
const REFRESH_COOKIE_NAME = "fosforo_refresh_token";

function parseCookies(cookieHeader: string | null) {
  const values = new Map<string, string>();
  if (!cookieHeader) return values;

  for (const pair of cookieHeader.split(";")) {
    const [rawKey, ...rawValue] = pair.trim().split("=");
    if (!rawKey) continue;
    values.set(rawKey, decodeURIComponent(rawValue.join("=")));
  }

  return values;
}

export function getAccessTokenFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  return cookies.get(ACCESS_COOKIE_NAME) || "";
}

export function getRefreshTokenFromRequest(request: Request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  return cookies.get(REFRESH_COOKIE_NAME) || "";
}

export function getAccessCookieName() {
  return ACCESS_COOKIE_NAME;
}

export function getRefreshCookieName() {
  return REFRESH_COOKIE_NAME;
}

function buildCookieAttributes() {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  const common = [
    "Path=/",
    cookieDomain ? `Domain=${cookieDomain}` : "",
    "HttpOnly",
    "SameSite=Lax",
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return common;
}

export function buildSessionCookies(
  expiresInSeconds: number,
  accessToken: string,
  refreshToken: string,
) {
  const common = buildCookieAttributes();

  return [
    `${ACCESS_COOKIE_NAME}=${encodeURIComponent(accessToken)}; Max-Age=${expiresInSeconds}; ${common}`,
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}; Max-Age=${60 * 60 * 24 * 30}; ${common}`,
  ];
}

export function clearSessionCookies() {
  const common = buildCookieAttributes();

  return [
    `${ACCESS_COOKIE_NAME}=; Max-Age=0; ${common}`,
    `${REFRESH_COOKIE_NAME}=; Max-Age=0; ${common}`,
  ];
}
