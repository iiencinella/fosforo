import { beforeEach, describe, expect, it, vi } from "vitest";

const authzMocks = vi.hoisted(() => ({
  requireAppPermission: vi.fn(),
  requireAdminSession: vi.fn(),
  requireSession: vi.fn(),
  CMS_APP_SLUG: "cms",
}));

const repoMocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
  listActiveForEvent: vi.fn(),
}));

vi.mock("@/lib/authz", () => authzMocks);
vi.mock("@/lib/webhooks-repository", () => ({
  createWebhooksRepository: () => repoMocks,
}));

import { GET, POST } from "@/pages/api/admin/webhooks";

const adminSession = {
  token: "admin-token",
  user: { id: "admin-1" },
  profile: { id: "admin-1", roleSlug: "admin" },
};

const editorSession = {
  token: "editor-token",
  user: { id: "editor-1" },
  profile: { id: "editor-1", roleSlug: "editor" },
};

const subscription = {
  id: "sub-1",
  appName: "misal",
  targetUrl: "https://misal.fosforo.app/api/webhooks/cms",
  events: ["entry.published"],
  isActive: true,
  createdAt: "2026-09-07T00:00:00.000Z",
  updatedAt: "2026-09-07T00:00:00.000Z",
};

const validPayload = {
  app_name: "misal",
  target_url: "https://misal.fosforo.app/api/webhooks/cms",
  secret: "secreto-compartido-16",
};

beforeEach(() => {
  for (const mock of Object.values(repoMocks)) {
    mock.mockReset();
  }
  authzMocks.requireAppPermission.mockReset();
  authzMocks.requireAdminSession.mockReset();

  authzMocks.requireAppPermission.mockResolvedValue(adminSession);
  authzMocks.requireAdminSession.mockResolvedValue(adminSession);
  repoMocks.list.mockResolvedValue([subscription]);
  repoMocks.create.mockResolvedValue(subscription);
});

describe("GET /api/admin/webhooks (FR-CMS-010)", () => {
  it("lista suscripciones sin exponer el secreto", async () => {
    const response = await GET({
      request: new Request("http://localhost/api/admin/webhooks"),
    } as never);

    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      subscriptions: Array<Record<string, unknown>>;
    };
    expect(json.subscriptions).toHaveLength(1);
    expect(json.subscriptions[0]).not.toHaveProperty("secret");
  });

  it("403 para editor (solo admin)", async () => {
    authzMocks.requireAppPermission.mockResolvedValue(editorSession);

    const response = await GET({
      request: new Request("http://localhost/api/admin/webhooks"),
    } as never);

    expect(response.status).toBe(403);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe("CMS_ADMIN_REQUIRED");
  });
});

describe("POST /api/admin/webhooks", () => {
  it("201 con admin y payload valido (JSON)", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/admin/webhooks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
      url: new URL("http://localhost/api/admin/webhooks"),
    } as never);

    expect(response.status).toBe(201);
    expect(repoMocks.create).toHaveBeenCalledWith("admin-token", validPayload);
  });

  it("422 con URL http (solo https)", async () => {
    const response = await POST({
      request: new Request("http://localhost/api/admin/webhooks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...validPayload,
          target_url: "http://misal.fosforo.app/api/webhooks/cms",
        }),
      }),
      url: new URL("http://localhost/api/admin/webhooks"),
    } as never);

    expect(response.status).toBe(422);
  });

  it("403 para editor", async () => {
    authzMocks.requireAdminSession.mockRejectedValue(
      new Error("USERS_ROLE_ASSIGNMENT_DENIED"),
    );

    const response = await POST({
      request: new Request("http://localhost/api/admin/webhooks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPayload),
      }),
      url: new URL("http://localhost/api/admin/webhooks"),
    } as never);

    expect(response.status).toBe(403);
  });

  it("form-data del panel redirige 303", async () => {
    const formData = new FormData();
    formData.set("app_name", "misal");
    formData.set("target_url", "https://misal.fosforo.app/api/webhooks/cms");
    formData.set("secret", "secreto-compartido-16");

    const response = await POST({
      request: new Request("http://localhost/api/admin/webhooks", {
        method: "POST",
        body: formData,
      }),
      url: new URL("http://localhost/api/admin/webhooks"),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      `/admin/webhooks?ok=${encodeURIComponent("misal")}`,
    );
  });

  it("POST _method=delete elimina y redirige", async () => {
    repoMocks.remove.mockResolvedValue(undefined);

    const response = await POST({
      request: new Request("http://localhost/api/admin/webhooks", {
        method: "POST",
        body: new FormData(),
      }),
      url: new URL(
        "http://localhost/api/admin/webhooks?_method=delete&id=sub-1&return_to=%2Fadmin%2Fwebhooks",
      ),
    } as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "/admin/webhooks?ok=webhook_deleted",
    );
    expect(repoMocks.remove).toHaveBeenCalledWith("admin-token", "sub-1");
  });
});
