import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  revokeSession: vi.fn(),
  getSessionFromToken: vi.fn(),
}));

const auditMocks = vi.hoisted(() => ({
  recordAuditEvent: vi.fn(),
  getClientIp: vi.fn(() => null),
}));

vi.mock("@/lib/auth-supabase", () => authMocks);
vi.mock("@/lib/audit", () => auditMocks);

import { POST as loginPost } from "@/pages/api/auth/login";
import { POST as logoutPost } from "@/pages/api/auth/logout";
import { POST as registerPost } from "@/pages/api/auth/register";

beforeEach(() => {
  authMocks.loginUser.mockReset();
  authMocks.registerUser.mockReset();
  authMocks.revokeSession.mockReset();
  authMocks.getSessionFromToken.mockReset();
  auditMocks.recordAuditEvent.mockReset();
  auditMocks.getClientIp.mockClear();
});

const validSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresIn: 3600,
  userId: "user-1",
  email: "ana@ejemplo.com",
  role: "usuario" as const,
};

describe("POST /api/auth/login (FR-AUTH-001)", () => {
  function buildFormRequest(body: Record<string, string>) {
    const data = new FormData();
    for (const [key, value] of Object.entries(body)) {
      data.set(key, value);
    }
    return new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: data,
    });
  }

  it("login valido fija cookies, audita y redirige a /", async () => {
    authMocks.loginUser.mockResolvedValue(validSession);

    const response = await loginPost({
      request: buildFormRequest({
        email: "ana@ejemplo.com",
        password: "secreta1",
      }),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/");
    const cookies = response.headers.getSetCookie();
    expect(
      cookies.some((cookie) => cookie.startsWith("fosforo_access_token=")),
    ).toBe(true);
    expect(
      cookies.some((cookie) => cookie.startsWith("fosforo_refresh_token=")),
    ).toBe(true);
    expect(auditMocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "login",
      }),
    );
  });

  it("credenciales invalidas redirigen con error", async () => {
    authMocks.loginUser.mockRejectedValue(
      new Error("LOGUEO_INVALID_CREDENTIALS"),
    );

    const response = await loginPost({
      request: buildFormRequest({ email: "ana@ejemplo.com", password: "mala" }),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/login?error=invalid_credentials",
    );
    expect(auditMocks.recordAuditEvent).not.toHaveBeenCalled();
  });

  it("campos faltantes redirigen con error sin llamar al login", async () => {
    const response = await loginPost({
      request: buildFormRequest({ email: "ana@ejemplo.com" }),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/login?error=invalid_credentials",
    );
    expect(authMocks.loginUser).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/logout (FR-AUTH-006)", () => {
  function buildLogoutRequest(scope: string | null) {
    const data = new FormData();
    if (scope) {
      data.set("scope", scope);
    }
    return new Request("http://localhost/api/auth/logout", {
      method: "POST",
      headers: { cookie: "fosforo_access_token=access-token" },
      body: data,
    });
  }

  it("logout local revoca el token y limpia cookies", async () => {
    authMocks.getSessionFromToken.mockResolvedValue({
      user: { id: "user-1" },
      role: "usuario",
    });

    const response = await logoutPost({
      request: buildLogoutRequest("local"),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
    expect(authMocks.revokeSession).toHaveBeenCalledWith(
      "access-token",
      "local",
    );
    const cookies = response.headers.getSetCookie();
    expect(
      cookies.some((cookie) => cookie.startsWith("fosforo_access_token=;")),
    ).toBe(true);
    expect(auditMocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", action: "logout" }),
    );
  });

  it("logout global revoca todas las sesiones del usuario", async () => {
    authMocks.getSessionFromToken.mockResolvedValue({
      user: { id: "user-1" },
      role: "usuario",
    });

    await logoutPost({
      request: buildLogoutRequest("global"),
    } as never);

    expect(authMocks.revokeSession).toHaveBeenCalledWith(
      "access-token",
      "global",
    );
  });

  it("sin token redirige a /login sin revocar nada", async () => {
    const response = await logoutPost({
      request: new Request("http://localhost/api/auth/logout", {
        method: "POST",
        body: new FormData(),
      }),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login");
    expect(authMocks.revokeSession).not.toHaveBeenCalled();
  });

  it("fallo de revocacion redirige con error", async () => {
    authMocks.revokeSession.mockRejectedValue(
      new Error("LOGUEO_LOGOUT_FAILED"),
    );

    const response = await logoutPost({
      request: buildLogoutRequest("local"),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/?error=logout_failed");
  });
});

describe("POST /api/auth/register (FR-AUTH-001)", () => {
  function buildFormRequest(body: Record<string, string>) {
    const data = new FormData();
    for (const [key, value] of Object.entries(body)) {
      data.set(key, value);
    }
    return new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: data,
    });
  }

  it("registro con sesion inmediata fija cookies y audita", async () => {
    authMocks.registerUser.mockResolvedValue({
      needsEmailConfirmation: false,
      session: validSession,
    });

    const response = await registerPost({
      request: buildFormRequest({
        name: "Ana",
        email: "ana@ejemplo.com",
        password: "secreta1",
      }),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/");
    expect(response.headers.getSetCookie().length).toBeGreaterThan(0);
    expect(auditMocks.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "register" }),
    );
  });

  it("registro con confirmacion por email redirige con notice", async () => {
    authMocks.registerUser.mockResolvedValue({
      needsEmailConfirmation: true,
      session: null,
    });

    const response = await registerPost({
      request: buildFormRequest({
        name: "Ana",
        email: "ana@ejemplo.com",
        password: "secreta1",
      }),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/register?notice=check_email",
    );
    expect(response.headers.getSetCookie().length).toBe(0);
  });

  it("fallo de registro redirige con error", async () => {
    authMocks.registerUser.mockRejectedValue(
      new Error("LOGUEO_REGISTER_FAILED"),
    );

    const response = await registerPost({
      request: buildFormRequest({
        name: "Ana",
        email: "ana@ejemplo.com",
        password: "secreta1",
      }),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/register?error=register_failed",
    );
  });
});
