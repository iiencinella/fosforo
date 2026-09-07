import { getAccessTokenFromRequest } from "@repo/auth";
import { requireAppPermission, CMS_APP_SLUG } from "@/lib/authz";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PREFIXES = ["/api/", "/_astro/", "/acceso-denegado"];

function isPublic(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Secure headers (SEC-CMS-010). CSP permite estilos inline (Astro inyecta
// <style> y atributos style) y conecta solo al proyecto Supabase
// configurado.
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

/**
 * Redirect al login de la app logueo (IR-CMS-001) conservando el destino.
 */
function redirectToLogueo(pathname: string): Response {
  const logueoUrl = process.env.PUBLIC_LOGUEO_URL;
  if (!logueoUrl) {
    return new Response(null, {
      status: 303,
      headers: { location: "/acceso-denegado?error=logueo_no_configurado" },
    });
  }
  const base = logueoUrl.replace(/\/$/, "");
  return new Response(null, {
    status: 303,
    headers: {
      location: `${base}/login?return_to=${encodeURIComponent(pathname)}`,
    },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const securityHeaders = buildSecurityHeaders();
  const pathname = context.url.pathname;

  if (isPublic(pathname)) {
    const response = await next();
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  const token = getAccessTokenFromRequest(context.request);
  if (!token) {
    return redirectToLogueo(pathname);
  }

  try {
    // Sesion valida + permiso de app cms (admin bypasea) — FR-CMS-005.
    await requireAppPermission(context.request, CMS_APP_SLUG);
  } catch {
    return context.redirect("/acceso-denegado", 303);
  }

  const response = await next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
});
