import { describe, expect, it } from "vitest";

const baseUrl = process.env.USUARIO_E2E_BASE_URL?.replace(/\/$/, "");
const e2e = describe.skipIf(!baseUrl);

async function get(path: string) {
  return fetch(`${baseUrl}${path}`);
}

e2e("Usuarios HTTP E2E", () => {
  it("serves public auth pages", async () => {
    for (const path of [
      "/",
      "/auth/login",
      "/auth/register",
      "/auth/reset-password",
    ]) {
      expect((await get(path)).status, path).toBe(200);
    }
  });

  it("returns a healthy service response", async () => {
    const response = await get("/api/health");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.service).toBe("usuarios");
  });

  it("protects private and admin endpoints", async () => {
    const profile = await get("/api/users/profile");
    const admin = await get("/api/admin/users");

    expect(profile.status).toBe(401);
    expect(admin.status).toBe(401);
  });

  it("does not reveal whether an email exists during recovery", async () => {
    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Origin: baseUrl as string,
      },
      body: JSON.stringify({ email: "not-used@example.com" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
  });
});
