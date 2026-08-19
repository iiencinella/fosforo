import type { APIRoute } from "astro";
import { clearAdminSessionCookie } from "@/lib/auth";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  clearAdminSessionCookie(cookies);
  return redirect("/login");
};
