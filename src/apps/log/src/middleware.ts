import { getAccessTokenFromRequest } from "@/lib/auth";
import { getSessionFromToken } from "@/lib/auth-supabase";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PATHS = new Set(["/login"]);

const PUBLIC_PREFIXES = ["/api/", "/_astro/"];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Secure headers (SEC-0105-LOG-009).
// CSP permite estilos inline (Astro inyecta <style> y atributos style) y
// conecta solo al proyecto Supabase configurado.
function buildSecurityHeaders(): Record<string, string> {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
  const connectSrc = supabaseUrl
    ? `'self' ${supabaseUrl}`
    : "'self' https://*.supabase.co";

  return {
    "content-security-policy": [
      "default-src 'self'",
      `connect-src ${connectSrc}`,
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-frame-options": "DENY",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    ...(import.meta.env.PROD
      ? { "strict-transport-security": "max-age=31536000; includeSubDomains" }
      : {}),
  };
}

export const onRequest = defineMiddleware(async (context, next) => {
  const securityHeaders = buildSecurityHeaders();

  if (isPublic(context.url.pathname)) {
    const response = await next();
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  const token = getAccessTokenFromRequest(context.request);

  if (!token) {
    return context.redirect("/login", 303);
  }

  try {
    await getSessionFromToken(token);
  } catch {
    return context.redirect("/login", 303);
  }

  const response = await next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
});
