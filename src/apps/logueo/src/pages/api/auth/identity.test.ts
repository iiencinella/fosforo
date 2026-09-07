import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionMocks = vi.hoisted(() => ({
  getSessionFromRequest: vi.fn(),
}));

const consentsMocks = vi.hoisted(() => ({
  listConsents: vi.fn(),
  updateConsent: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("@repo/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/auth")>();
  return {
    ...actual,
    getSessionFromRequest: sessionMocks.getSessionFromRequest,
  };
});

vi.mock("@/lib/consents", () => consentsMocks);

import { GET as sessionGet } from "@/pages/api/auth/session";
import {
  GET as consentsGet,
  PUT as consentsPut,
} from "@/pages/api/auth/consents";
import { GET as meGet, PUT as mePut } from "@/pages/api/auth/me";

const activeSession = {
  token: "access-token",
  user: { id: "user-1" },
  profile: {
    id: "user-1",
    email: "ana@ejemplo.com",
    name: "Ana",
    avatarUrl: null,
    roleId: 5,
    roleSlug: "usuario",
  },
};

beforeEach(() => {
  sessionMocks.getSessionFromRequest.mockReset();
  consentsMocks.listConsents.mockReset();
  consentsMocks.updateConsent.mockReset();
  consentsMocks.updateProfile.mockReset();

  consentsMocks.listConsents.mockResolvedValue([
    { category: "product", optedIn: false, updatedAt: null },
    { category: "liturgical", optedIn: true, updatedAt: null },
    { category: "community", optedIn: false, updatedAt: null },
  ]);
  consentsMocks.updateConsent.mockImplementation(
    async (_token: string, category: string, optedIn: boolean) => ({
      category,
      optedIn,
      updatedAt: "2026-09-06T00:00:00.000Z",
    }),
  );
  consentsMocks.updateProfile.mockResolvedValue({
    ...activeSession.profile,
    name: "Ana Editada",
  });
});

describe("GET /api/auth/session (FR-AUTH-007)", () => {
  it("devuelve sesion minima con rol", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(activeSession);

    const response = await sessionGet({
      request: new Request("http://localhost/api/auth/session", {
        headers: { cookie: "fosforo_access_token=access-token" },
      }),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      ok: boolean;
      userId: string;
      role: string;
    };
    expect(json.ok).toBe(true);
    expect(json.userId).toBe("user-1");
    expect(json.role).toBe("usuario");
  });

  it("401 sin sesion", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(null);

    const response = await sessionGet({
      request: new Request("http://localhost/api/auth/session"),
    } as never);

    expect(response.status).toBe(401);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("LOGUEO_SESSION_EXPIRED");
  });
});

describe("GET/PUT /api/auth/consents (FR-AUTH-004)", () => {
  it("GET devuelve las categorias con defaults", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(activeSession);

    const response = await consentsGet({
      request: new Request("http://localhost/api/auth/consents"),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      consents: Array<{ category: string; optedIn: boolean }>;
    };
    expect(json.consents).toHaveLength(3);
    expect(
      json.consents.find((item) => item.category === "liturgical")?.optedIn,
    ).toBe(true);
  });

  it("PUT actualiza una categoria con payload valido", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(activeSession);

    const response = await consentsPut({
      request: new Request("http://localhost/api/auth/consents", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category: "product", optedIn: true }),
      }),
    } as never);

    expect(response.status).toBe(200);
    expect(consentsMocks.updateConsent).toHaveBeenCalledWith(
      "access-token",
      "product",
      true,
    );
  });

  it("PUT rechaza payload invalido con 422", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(activeSession);

    const response = await consentsPut({
      request: new Request("http://localhost/api/auth/consents", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ category: "transactional", optedIn: false }),
      }),
    } as never);

    expect(response.status).toBe(422);
    expect(consentsMocks.updateConsent).not.toHaveBeenCalled();
  });

  it("ambos endpoints piden sesion", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(null);

    const getResponse = await consentsGet({
      request: new Request("http://localhost/api/auth/consents"),
    } as never);
    const putResponse = await consentsPut({
      request: new Request("http://localhost/api/auth/consents", {
        method: "PUT",
        body: JSON.stringify({ category: "product", optedIn: true }),
      }),
    } as never);

    expect(getResponse.status).toBe(401);
    expect(putResponse.status).toBe(401);
  });
});

describe("GET/PUT /api/auth/me (FR-AUTH-003/007)", () => {
  it("GET devuelve perfil y consentimientos", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(activeSession);

    const response = await meGet({
      request: new Request("http://localhost/api/auth/me"),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      profile: { name: string; role: string };
      consents: unknown[];
    };
    expect(json.profile.name).toBe("Ana");
    expect(json.profile.role).toBe("usuario");
    expect(json.consents).toHaveLength(3);
  });

  it("PUT actualiza el nombre con payload valido", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(activeSession);

    const response = await mePut({
      request: new Request("http://localhost/api/auth/me", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Ana Editada" }),
      }),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as { profile: { name: string } };
    expect(json.profile.name).toBe("Ana Editada");
  });

  it("PUT rechaza payload invalido con 422", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(activeSession);

    const response = await mePut({
      request: new Request("http://localhost/api/auth/me", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "A" }),
      }),
    } as never);

    expect(response.status).toBe(422);
  });

  it("PUT sin campos que actualizar devuelve 422", async () => {
    sessionMocks.getSessionFromRequest.mockResolvedValue(activeSession);

    const response = await mePut({
      request: new Request("http://localhost/api/auth/me", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    } as never);

    expect(response.status).toBe(422);
  });
});
