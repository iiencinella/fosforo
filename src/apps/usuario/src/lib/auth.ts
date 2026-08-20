import { z } from "zod";
import { getSupabaseAuthClient } from "@repo/auth";
import { log } from "./log";

export const registerSchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña supera el maximo permitido"),
  name: z.string().min(2, "Nombre demasiado corto").max(80),
});

export const loginSchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  password: z.string().min(8, "Credenciales invalidas").max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

type RegisterResult = {
  userId: string;
  email: string;
  message: string;
};

type LoginResult = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  email: string;
};

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña supera el maximo permitido");

export async function registerUser(
  input: RegisterInput,
): Promise<RegisterResult> {
  const supabase = getSupabaseAuthClient();
  const parsed = registerSchema.parse(input);

  const { data, error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
    options: {
      data: {
        name: parsed.name,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      log.error("Auth service error", { error });
      throw new Error("USERS_DUPLICATE_EMAIL");
    }
    log.error("Auth service error", { error });
    throw error;
  }

  if (!data.user) {
    log.error("Auth service error", {
      error: new Error("USERS_REGISTER_FAILED"),
    });
    throw new Error("USERS_REGISTER_FAILED");
  }

  return {
    userId: data.user.id,
    email: parsed.email,
    message: "Cuenta creada correctamente.",
  };
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const supabase = getSupabaseAuthClient();
  const parsed = loginSchema.parse(input);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error || !data.session || !data.user) {
    log.error("Auth service error", { error });
    throw new Error("USERS_INVALID_CREDENTIALS");
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
    userId: data.user.id,
    email: data.user.email ?? parsed.email,
  };
}

export async function logoutUser(accessToken: string): Promise<void> {
  if (!accessToken) {
    log.error("Auth service error", {
      error: new Error("USERS_LOGOUT_FAILED"),
    });
    throw new Error("USERS_LOGOUT_FAILED");
  }

  const supabase = getSupabaseAuthClient({ accessToken });
  const { error } = await supabase.auth.signOut();
  if (error) {
    log.error("Auth service error", { error });
    throw new Error("USERS_LOGOUT_FAILED");
  }
}

export async function getSessionFromToken(token: string) {
  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    log.error("Auth service error", { error });
    throw new Error("USERS_SESSION_EXPIRED");
  }

  return data.user;
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const supabase = getSupabaseAuthClient();
  const parsedEmail = z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido")
    .parse(email);
  const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail, {
    redirectTo,
  });

  if (error) {
    log.error("Auth service error", { error: "reset_password_failed" });
    throw new Error("USERS_RESET_PASSWORD_FAILED");
  }

  return {
    message: "Te enviamos un enlace para recuperar tu contraseña.",
  };
}

export async function updatePassword(accessToken: string, password: string) {
  const parsedPassword = passwordSchema.parse(password);
  if (!accessToken) throw new Error("USERS_SESSION_EXPIRED");

  const supabase = getSupabaseAuthClient({ accessToken });
  const { error } = await supabase.auth.updateUser({
    password: parsedPassword,
  });

  if (error) {
    log.error("Auth service error", { error: "update_password_failed" });
    throw new Error("USERS_UPDATE_PASSWORD_FAILED");
  }

  return { message: "Contraseña actualizada correctamente." };
}
