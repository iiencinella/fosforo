import { z } from "zod";
import {
  getUserProfileById,
  isPlatformRoleSlug,
  type PlatformRoleSlug,
} from "@repo/auth";
import { getSupabaseClient, getSupabaseServiceClient } from "@/lib/supabase";

/**
 * Helpers de identidad de la app logueo sobre Supabase Auth + el modelo
 * RBAC compartido (FR-AUTH-001/002/006). Es un modulo de integracion: se
 * cubre en E2E contra Supabase real.
 */

export const loginSchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  password: z.string().min(8, "Credenciales invalidas").max(72),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Nombre invalido").max(80),
});

export type UserRole = PlatformRoleSlug | null;

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  email: string;
  role: UserRole;
};

export type RegisterResult = {
  needsEmailConfirmation: boolean;
  session: LoginResult | null;
};

async function resolveUserRole(
  userId: string,
  accessToken: string,
): Promise<UserRole> {
  try {
    const profile = await getUserProfileById(userId, accessToken);
    return isPlatformRoleSlug(profile.roleSlug) ? profile.roleSlug : null;
  } catch {
    // Sin perfil el usuario entra igual: la app logueo es para todo el
    // ecosistema, el rol es informativo (FR-AUTH-002).
    return null;
  }
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const supabase = getSupabaseClient();
  const parsed = loginSchema.parse(input);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error || !data.session || !data.user) {
    throw new Error("LOGUEO_INVALID_CREDENTIALS");
  }

  const role = await resolveUserRole(data.user.id, data.session.access_token);

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
    userId: data.user.id,
    email: data.user.email ?? parsed.email,
    role,
  };
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<RegisterResult> {
  const supabase = getSupabaseClient();
  const parsed = registerSchema.parse(input);

  const { data, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    options: {
      data: { name: parsed.name },
    },
  });

  if (error) {
    throw new Error("LOGUEO_REGISTER_FAILED");
  }

  // Si el proyecto exige confirmacion por email, la sesion viene vacia y
  // el perfil se crea con el trigger on_auth_user_created al confirmar.
  if (!data.session || !data.user) {
    return { needsEmailConfirmation: true, session: null };
  }

  const role = await resolveUserRole(data.user.id, data.session.access_token);

  return {
    needsEmailConfirmation: false,
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      userId: data.user.id,
      email: data.user.email ?? parsed.email,
      role,
    },
  };
}

export async function getSessionFromToken(token: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("LOGUEO_SESSION_EXPIRED");
  }

  const role = await resolveUserRole(data.user.id, token);

  return {
    user: data.user,
    role,
  };
}

export type LogoutScope = "local" | "global";

/**
 * Revoca la sesion del token. local = solo el refresh token de esta
 * sesion; global = todas las sesiones del usuario (FR-AUTH-006).
 */
export async function revokeSession(
  accessToken: string,
  scope: LogoutScope,
): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.auth.admin.signOut(
    accessToken,
    scope === "global" ? "global" : undefined,
  );
  if (error) {
    throw new Error("LOGUEO_LOGOUT_FAILED");
  }
}
