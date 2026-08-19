function parseCookieHeader(
  cookieHeader: string | null,
): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  const parts = cookieHeader.split(";");
  const cookies: Record<string, string> = {};

  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey || rest.length === 0) {
      continue;
    }

    cookies[rawKey] = decodeURIComponent(rest.join("="));
  }

  return cookies;
}

export function getAccessTokenFromRequest(request: Request): string {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookieHeader(cookieHeader);
  return cookies.fosforo_access_token ?? "";
}
