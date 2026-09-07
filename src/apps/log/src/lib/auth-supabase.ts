import { z } from "zod";
import {
  getUserProfileById,
  isPlatformRoleSlug,
  type PlatformRoleSlug,
} from "@repo/auth";
import { getSupabaseClient } from "@/lib/supabase";

export type UserRole = PlatformRoleSlug | null;

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
  role: UserRole;
};

/**
 * Resuelve el rol de plataforma del usuario desde el modelo RBAC compartido
 * (profiles.role_id -> roles.slug). Devuelve null si el usuario no tiene un
 * rol de plataforma o si el perfil no existe.
 */
async function resolvePlatformRole(
  userId: string,
  accessToken: string,
): Promise<UserRole> {
  try {
    const profile = await getUserProfileById(userId, accessToken);
    return isPlatformRoleSlug(profile.roleSlug) ? profile.roleSlug : null;
  } catch {
    return null;
  }
}

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

  const role = await resolvePlatformRole(
    data.user.id,
    data.session.access_token,
  );

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

  const role = await resolvePlatformRole(data.user.id, token);

  return {
    user: data.user,
    role,
  };
}
