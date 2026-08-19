import { getAccessTokenFromRequest } from "@/lib/auth";
import { getSessionFromToken } from "@/lib/auth-supabase";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PATHS = new Set(["/login"]);

const PUBLIC_PREFIXES = ["/api/", "/_astro/"];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (isPublic(context.url.pathname)) {
    return next();
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

  return next();
});
