const ACCESS_COOKIE_NAME = "fosforo_access_token";
const REFRESH_COOKIE_NAME = "fosforo_refresh_token";

export function buildSessionCookies(
  expiresInSeconds: number,
  accessToken: string,
  refreshToken: string,
) {
  const isProduction = process.env.NODE_ENV === "production";
  const common = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return [
    `${ACCESS_COOKIE_NAME}=${encodeURIComponent(accessToken)}; Max-Age=${expiresInSeconds}; ${common}`,
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}; Max-Age=${60 * 60 * 24 * 30}; ${common}`,
  ];
}

export function clearSessionCookies() {
  const isProduction = process.env.NODE_ENV === "production";
  const common = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return [
    `${ACCESS_COOKIE_NAME}=; Max-Age=0; ${common}`,
    `${REFRESH_COOKIE_NAME}=; Max-Age=0; ${common}`,
  ];
}
