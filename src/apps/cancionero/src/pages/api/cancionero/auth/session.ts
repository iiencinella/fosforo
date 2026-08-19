import type { APIRoute } from "astro";
import { jsonOk } from "@repo/api-utils";
import {
  canContribute,
  canModerate,
  getSessionFromRequest,
  resolveAppRole,
} from "@/lib/auth";
import { log } from "@/lib/log";

export const GET: APIRoute = async ({ request }) => {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return jsonOk({
        data: {
          authenticated: false,
          user: null,
          profile: null,
          appRole: "invitado",
          canContribute: false,
          canModerate: false,
        },
      });
    }

    const appRole = resolveAppRole(session.profile.roleSlug);

    return jsonOk({
      data: {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email ?? session.profile.email,
        },
        profile: {
          id: session.profile.id,
          name: session.profile.name,
          email: session.profile.email,
          avatarUrl: session.profile.avatarUrl,
          roleSlug: session.profile.roleSlug,
        },
        appRole,
        canContribute: canContribute(appRole),
        canModerate: canModerate(appRole),
      },
    });
  } catch (error) {
    log.warn("Session check failed");
    throw error;
  }
};

export const prerender = false;
