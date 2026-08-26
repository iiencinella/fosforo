import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
const requireApiAuthMock = vi.fn();
const createAuditLogMock = vi.fn();
const authClientFromMock = vi.fn();
const authClientRpcMock = vi.fn();

vi.mock("@repo/auth", () => ({
  getSupabaseAuthClient: vi.fn(() => ({
    from: (table: string) => authClientFromMock(table),
    rpc: (...args: unknown[]) => authClientRpcMock(...args),
  })),
}));

vi.mock("@/db/supabase", () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}));

vi.mock("@/lib/auth", () => ({
  requireApiAuth: (...args: unknown[]) => requireApiAuthMock(...args),
}));

vi.mock("@/lib/admin-data", () => ({
  createAuditLog: (...args: unknown[]) => createAuditLogMock(...args),
}));

vi.mock("@/lib/log", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// eslint-disable-next-line import/first
import { GET as rolesGet, POST as rolesPost } from "@/pages/api/roles/index";
// eslint-disable-next-line import/first
import {
  GET as roleGet,
  PUT as rolePut,
  DELETE as roleDelete,
} from "@/pages/api/roles/[id]";
// eslint-disable-next-line import/first
import { PUT as permissionsPut } from "@/pages/api/roles/[id]/permissions";

function createBuilder(
  terminal: () => { data: unknown; error: unknown; count?: number | null },
) {
  const builder: Record<string, unknown> = {};
  const chainMethods = [
    "select",
    "eq",
    "in",
    "order",
    "limit",
    "not",
    "insert",
    "update",
    "delete",
  ];
  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(async () => terminal());
  builder.maybeSingle = vi.fn(async () => terminal());
  (builder as { then: unknown }).then = (
    resolve: (value: unknown) => unknown,
    reject: (reason?: unknown) => unknown,
  ) => Promise.resolve(terminal()).then(resolve, reject);
  return builder;
}

const adminAuth = {
  ok: true as const,
  session: {
    userId: "11111111-1111-1111-1111-111111111111",
    role: "admin",
    token: "jwt",
    email: "admin@test.ar",
  },
};

const unauthorized = {
  ok: false as const,
  response: new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
    status: 401,
  }),
};

beforeEach(() => {
  fromMock.mockReset();
  authClientFromMock.mockReset();
  authClientRpcMock.mockReset();
  requireApiAuthMock.mockReset();
  createAuditLogMock.mockReset();
  requireApiAuthMock.mockResolvedValue(adminAuth);
});

describe("roles api auth", () => {
  it("rechaza sin sesion", async () => {
    requireApiAuthMock.mockResolvedValueOnce(unauthorized);

    const response = await rolesGet({
      request: new Request("http://x"),
    } as never);
    expect(response.status).toBe(401);
  });
});

describe("roles catalogo", () => {
  it("lista roles con metadatos", async () => {
    const rolesBuilder = createBuilder(() => ({
      data: [
        {
          id: 1,
          slug: "admin",
          name: "Administrador",
          description: "",
          hierarchy_level: 1,
          created_at: "2026-08-26",
        },
      ],
      error: null,
    }));
    const profilesBuilder = createBuilder(() => ({
      data: [{ role_id: 1 }],
      error: null,
    }));
    const permissionsBuilder = createBuilder(() => ({
      data: [{ role_id: 1, app_slug: "portal", can_access: true }],
      error: null,
    }));

    fromMock
      .mockReturnValueOnce(rolesBuilder)
      .mockReturnValueOnce(profilesBuilder)
      .mockReturnValueOnce(permissionsBuilder);

    const response = await rolesGet({
      request: new Request("http://x"),
    } as never);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.roles[0]).toMatchObject({
      slug: "admin",
      assignedUsers: 1,
      enabledApps: 1,
    });
  });

  it("crea rol y audita", async () => {
    const insertBuilder = createBuilder(() => ({
      data: {
        id: 8,
        slug: "catequista",
        name: "Catequista",
        description: "",
        hierarchy_level: 70,
        created_at: "2026-08-26",
      },
      error: null,
    }));
    fromMock.mockReturnValueOnce(insertBuilder);

    const response = await rolesPost({
      request: new Request("http://x", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "catequista",
          name: "Catequista",
          hierarchyLevel: 70,
        }),
      }),
    } as never);

    expect(response.status).toBe(201);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "create",
        resourceType: "role",
      }),
    );
  });

  it("bloquea slug reservado", async () => {
    const response = await rolesPost({
      request: new Request("http://x", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: "admin",
          name: "Admin 2",
          hierarchyLevel: 10,
        }),
      }),
    } as never);

    expect(response.status).toBe(422);
  });
});

describe("role detail and update", () => {
  it("obtiene detalle de rol con apps", async () => {
    const roleBuilder = createBuilder(() => ({
      data: {
        id: 2,
        slug: "coordinador",
        name: "Coordinador",
        description: "",
        hierarchy_level: 40,
        created_at: "2026-08-26",
      },
      error: null,
    }));
    const permissionsBuilder = createBuilder(() => ({
      data: [{ app_slug: "portal", can_access: true }],
      error: null,
    }));
    fromMock
      .mockReturnValueOnce(roleBuilder)
      .mockReturnValueOnce(permissionsBuilder);

    const response = await roleGet({
      request: new Request("http://x"),
      params: { id: "2" },
    } as never);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(
      body.role.apps.some(
        (app: { appSlug: string; canAccess: boolean }) =>
          app.appSlug === "portal" && app.canAccess,
      ),
    ).toBe(true);
  });

  it("actualiza rol", async () => {
    const currentBuilder = createBuilder(() => ({
      data: { id: 2, slug: "coordinador" },
      error: null,
    }));
    const updateBuilder = createBuilder(() => ({
      data: {
        id: 2,
        slug: "coordinador",
        name: "Coord",
        description: "",
        hierarchy_level: 45,
        created_at: "2026-08-26",
      },
      error: null,
    }));
    fromMock
      .mockReturnValueOnce(currentBuilder)
      .mockReturnValueOnce(updateBuilder);

    const response = await rolePut({
      request: new Request("http://x", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Coord",
          hierarchyLevel: 45,
        }),
      }),
      params: { id: "2" },
    } as never);

    expect(response.status).toBe(200);
  });

  it("elimina rol no protegido sin usuarios", async () => {
    const roleBuilder = createBuilder(() => ({
      data: { id: 6, slug: "catequista" },
      error: null,
    }));
    const countBuilder = createBuilder(() => ({
      data: null,
      error: null,
      count: 0,
    }));
    const deleteBuilder = createBuilder(() => ({
      data: null,
      error: null,
    }));

    fromMock
      .mockReturnValueOnce(roleBuilder)
      .mockReturnValueOnce(countBuilder)
      .mockReturnValueOnce(deleteBuilder);

    const response = await roleDelete({
      request: new Request("http://x", { method: "DELETE" }),
      params: { id: "6" },
    } as never);

    expect(response.status).toBe(200);
  });

  it("bloquea eliminar rol protegido", async () => {
    const roleBuilder = createBuilder(() => ({
      data: { id: 1, slug: "admin" },
      error: null,
    }));
    fromMock.mockReturnValueOnce(roleBuilder);

    const response = await roleDelete({
      request: new Request("http://x", { method: "DELETE" }),
      params: { id: "1" },
    } as never);

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      error: "ADMIN_ROLE_PROTECTED",
    });
  });
});

describe("permissions matrix", () => {
  it("reemplaza matriz de permisos", async () => {
    const roleBuilder = createBuilder(() => ({
      data: { id: 2, slug: "coordinador" },
      error: null,
    }));
    const clearBuilder = createBuilder(() => ({ data: null, error: null }));
    const insertBuilder = createBuilder(() => ({ data: null, error: null }));
    fromMock
      .mockReturnValueOnce(roleBuilder)
      .mockReturnValueOnce(clearBuilder)
      .mockReturnValueOnce(insertBuilder);

    const response = await permissionsPut({
      request: new Request("http://x", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          apps: [
            { appSlug: "portal", canAccess: true },
            { appSlug: "biblia", canAccess: false },
          ],
        }),
      }),
      params: { id: "2" },
    } as never);

    expect(response.status).toBe(200);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "permissions_update",
        resourceType: "role",
      }),
    );
  });
});
