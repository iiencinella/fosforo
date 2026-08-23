import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY;
const enabled = process.env.USUARIO_RUN_INTEGRATION === "true";
const integration = describe.skipIf(!enabled || !url || !anonKey);

integration("Usuarios Supabase integration", () => {
  const getClient = (accessToken?: string) =>
    createClient(url as string, anonKey as string, {
      global: accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
      auth: { persistSession: false, autoRefreshToken: false },
    });

  it("does not expose roles or profiles to the anonymous role", async () => {
    const client = getClient();
    const roles = await client.from("roles").select("id");
    const profiles = await client.from("profiles").select("id");

    expect(roles.error).toBeNull();
    expect(roles.data).toEqual([]);
    expect(profiles.error).toBeNull();
    expect(profiles.data).toEqual([]);
  });

  it("allows an authenticated token to read its own profile", async () => {
    const token = process.env.USUARIO_AUTH_ACCESS_TOKEN;
    if (!token) return;

    const client = getClient(token);
    const userResponse = await client.auth.getUser(token);
    expect(userResponse.data.user).not.toBeNull();

    const profile = await client
      .from("profiles")
      .select("id")
      .eq("id", userResponse.data.user?.id ?? "")
      .maybeSingle();

    expect(profile.error).toBeNull();
    expect(profile.data?.id).toBe(userResponse.data.user?.id);
  });
});
