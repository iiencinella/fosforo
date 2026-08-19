import type { APIRoute } from "astro";
import { loginSchema } from "@/lib/validators";
import { setAdminSessionCookie, clearAdminSessionCookie } from "@/lib/auth";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const parseResult = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parseResult.success) {
    clearAdminSessionCookie(cookies);
    return redirect("/login?error=Credenciales%20inválidas");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parseResult.data.email,
    password: parseResult.data.password,
  });

  if (error || !data.session?.access_token || !data.user) {
    clearAdminSessionCookie(cookies);
    return redirect("/login?error=No%20se%20pudo%20iniciar%20sesión");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("user_id", data.user.id)
    .eq("active", true)
    .maybeSingle();

  if (!adminUser) {
    clearAdminSessionCookie(cookies);
    return redirect("/login?error=Acceso%20no%20autorizado");
  }

  setAdminSessionCookie(cookies, data.session.access_token);
  return redirect("/admin/dashboard");
};
