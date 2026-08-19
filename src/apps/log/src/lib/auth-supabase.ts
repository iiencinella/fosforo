import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";

type UserRole = "dev" | "ops";

export const loginSchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  password: z.string().min(8, "Credenciales invalidas").max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;

type LoginResult = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  email: string;
  role: UserRole | null;
};

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const supabase = getSupabaseClient();
  const parsed = loginSchema.parse(input);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error || !data.session || !data.user) {
    throw new Error("LOG_INVALID_CREDENTIALS");
  }

  const appRole = data.user.app_metadata?.role;
  const role = appRole === "dev" || appRole === "ops" ? appRole : null;

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
    userId: data.user.id,
    email: data.user.email ?? parsed.email,
    role,
  };
}

export async function getSessionFromToken(token: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("LOG_SESSION_EXPIRED");
  }

  const appRole = data.user.app_metadata?.role;
  const role = appRole === "dev" || appRole === "ops" ? appRole : null;

  return {
    user: data.user,
    role,
  };
}
