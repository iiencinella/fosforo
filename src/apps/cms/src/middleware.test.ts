import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:middleware", () => ({
  defineMiddleware: (fn: unknown) => fn,
}));

const authMocks = vi.hoisted(() => ({
  getAccessTokenFromRequest: vi.fn(),
}));

const authzMocks = vi.hoisted(() => ({
  requireAppPermission: vi.fn(),
  CMS_APP_SLUG: "cms",
}));

vi.mock("@repo/auth", () => authMocks);
vi.mock("@/lib/authz", () => authzMocks);

import { onRequest } from "@/middleware";

function buildContext(path: string) {
  const url = new URL(`http://localhost${path}`);
  return {
    url,
    request: new Request(url),
    redirect: (path: string, status = 302) =>
      new Response(null, { status, headers: { location: path } }),
    cookies: {},
    params: {},
  };
}

function stubEnv(partial: Record<string, string | undefined>) {
  const previous: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(partial)) {
    previous[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  return () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  };
}

beforeEach(() => {
  authMocks.getAccessTokenFromRequest.mockReset();
  authzMocks.requireAppPermission.mockReset();
});

describe("middleware del CMS (IR-CMS-001, SEC-CMS-010)", () => {
  it("rutas /api/ son publicas y fija secure headers", async () => {
    const context = buildContext("/api/health");
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("content-security-policy")).toContain(
      "default-src 'self'",
    );
  });

  it("/acceso-denegado es publica", async () => {
    const context = buildContext("/acceso-denegado");
    const next = vi.fn(async () => new Response("ok"));

    await onRequest(context as never, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("sin token redirige al login de logueo con return_to", async () => {
    const restore = stubEnv({
      PUBLIC_LOGUEO_URL: "https://logueo.fosforo.app",
    });
    authMocks.getAccessTokenFromRequest.mockReturnValue(null);
    const context = buildContext("/admin/entries");
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    restore();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `https://logueo.fosforo.app/login?return_to=${encodeURIComponent("/admin/entries")}`,
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("sin PUBLIC_LOGUEO_URL configurado redirige a acceso-denegado con motivo", async () => {
    const restore = stubEnv({ PUBLIC_LOGUEO_URL: undefined });
    authMocks.getAccessTokenFromRequest.mockReturnValue(null);
    const context = buildContext("/");
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    restore();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/acceso-denegado?error=logueo_no_configurado",
    );
  });

  it("con sesion valida y permiso cms continua", async () => {
    authMocks.getAccessTokenFromRequest.mockReturnValue("token");
    authzMocks.requireAppPermission.mockResolvedValue({
      profile: { roleSlug: "editor" },
    });
    const context = buildContext("/");
    const next = vi.fn(async () => new Response("ok"));

    await onRequest(context as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(authzMocks.requireAppPermission).toHaveBeenCalledWith(
      expect.any(Request),
      "cms",
    );
  });

  it("con sesion valida pero sin permiso cms redirige a acceso-denegado", async () => {
    authMocks.getAccessTokenFromRequest.mockReturnValue("token");
    authzMocks.requireAppPermission.mockRejectedValue(
      new Error("USERS_UNAUTHORIZED_APP"),
    );
    const context = buildContext("/");
    const next = vi.fn(async () => new Response("ok"));

    const response = (await onRequest(context as never, next)) as Response;

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/acceso-denegado");
    expect(next).not.toHaveBeenCalled();
  });
});
