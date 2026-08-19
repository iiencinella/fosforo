import { defineMiddleware } from "astro:middleware";
import {
  CANCIONERO_ROLE_LEVEL,
  canAccessPage,
  canContribute,
  canModerate,
  getMinimumRoleForPath,
  getSessionFromRequest,
  resolveAppRole,
} from "@/lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;

  if (
    path.startsWith("/api/") ||
    path.startsWith("/auth/") ||
    path === "/404"
  ) {
    return next();
  }

  const session = await getSessionFromRequest(context.request);
  const role = session ? resolveAppRole(session.profile.roleSlug) : "invitado";

  context.locals.session = session;
  context.locals.appRole = role;
  context.locals.canContribute = canContribute(role);
  context.locals.canModerate = canModerate(role);

  const minimumRole = getMinimumRoleForPath(path);
  if (minimumRole && !canAccessPage(role, path)) {
    if (
      role === "invitado" &&
      CANCIONERO_ROLE_LEVEL[minimumRole] < CANCIONERO_ROLE_LEVEL["invitado"]
    ) {
      return context.redirect(`/auth/login?next=${encodeURIComponent(path)}`);
    }
    return context.rewrite("/404");
  }

  return next();
});
