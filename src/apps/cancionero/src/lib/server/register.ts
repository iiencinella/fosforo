import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseFullEnv } from "@repo/env";
import { log } from "../log";

export const REGISTERABLE_ROLES = ["musico"] as const;
export type RegisterableRole = (typeof REGISTERABLE_ROLES)[number];

export const registerPayloadSchema = z.object({
  email: z
    .string()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72, "La contraseña supera el maximo permitido"),
  name: z.string().min(2, "Nombre demasiado corto").max(80),
  roleSlug: z.enum(REGISTERABLE_ROLES).default("musico"),
});

export type RegisterPayload = z.infer<typeof registerPayloadSchema>;

let cachedServiceClient: ReturnType<typeof createClient> | null = null;

function getServiceClient() {
  if (cachedServiceClient) return cachedServiceClient;
  const { url, serviceRoleKey } = getSupabaseFullEnv();
  cachedServiceClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedServiceClient;
}

export type RegisteredUser = {
  userId: string;
  email: string;
  roleSlug: RegisterableRole;
  message: string;
};

export async function registerUserWithRole(
  payload: RegisterPayload,
): Promise<RegisteredUser> {
  const parsed = registerPayloadSchema.parse(payload);
  const supabase = getServiceClient();

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: { name: parsed.name },
    });

  if (createError || !created.user) {
    const message = (createError?.message ?? "").toLowerCase();
    if (message.includes("already") || message.includes("duplicate")) {
      throw new Error("CANCIONERO_DUPLICATE_EMAIL");
    }
    throw new Error("CANCIONERO_REGISTER_FAILED");
  }

  const userId = created.user.id;
  const email = created.user.email ?? parsed.email;
  const name = parsed.name;

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("id, slug")
    .eq("slug", parsed.roleSlug)
    .single<{ id: number; slug: string }>();

  if (roleError || !roleRow) {
    throw new Error("CANCIONERO_ROLE_NOT_FOUND");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    name,
    role_id: roleRow.id,
  } as never);

  if (profileError) {
    throw new Error("CANCIONERO_PROFILE_CREATE_FAILED");
  }

  const { error: userRoleError } = await supabase.from("user_roles").insert({
    user_id: userId,
    role_id: roleRow.id,
    assigned_by: null,
  } as never);

  if (
    userRoleError &&
    !userRoleError.message.toLowerCase().includes("duplicate")
  ) {
    throw new Error("CANCIONERO_PROFILE_CREATE_FAILED");
  }

  const { error: auditError } = await supabase.from("audit_log").insert({
    user_id: userId,
    action: "user_created",
    metadata: {
      source: "cancionero_register",
      role: roleRow.slug,
    },
  } as never);

  if (auditError) {
    log.warn("Cancionero register: audit_log insert failed", {
      error: auditError,
    });
  }

  return {
    userId,
    email,
    roleSlug: parsed.roleSlug,
    message: "Cuenta creada correctamente. Ahora podés iniciar sesión.",
  };
}
