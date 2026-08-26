import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
const rpcMock = vi.fn();
const requireApiAuthMock = vi.fn();

vi.mock("@repo/auth", () => ({
  getSupabaseAuthClient: vi.fn(() => ({
    from: (table: string) => fromMock(table),
    rpc: (...args: unknown[]) => rpcMock(...args),
  })),
}));

vi.mock("@/db/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  requireApiAuth: (...args: unknown[]) => requireApiAuthMock(...args),
}));

vi.mock("@/lib/admin-data", () => ({
  createAuditLog: vi.fn(),
}));

vi.mock("@/lib/log", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// eslint-disable-next-line import/first
import { GET as peopleGet } from "@/pages/api/people/index";
// eslint-disable-next-line import/first
import { PUT as peopleRolePut } from "@/pages/api/people/[id]/role";

function createBuilder(
  terminal: () => { data: unknown; error: unknown; count?: number | null },
) {
  const builder: Record<string, unknown> = {};
  const chainMethods = [
    "select",
    "eq",
    "order",
    "range",
    "ilike",
    "in",
    "not",
    "limit",
  ];
  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }
  (builder as { then: unknown }).then = (
    resolve: (value: unknown) => unknown,
    reject: (reason?: unknown) => unknown,
  ) => Promise.resolve(terminal()).then(resolve, reject);
  return builder;
}

const authAdmin = {
  ok: true as const,
  session: {
    userId: "11111111-1111-1111-1111-111111111111",
    role: "admin",
    token: "jwt",
    email: "admin@test.ar",
  },
};

beforeEach(() => {
  fromMock.mockReset();
  rpcMock.mockReset();
  requireApiAuthMock.mockReset();
  requireApiAuthMock.mockResolvedValue(authAdmin);
});

describe("people listing", () => {
  it("lista perfiles con rol", async () => {
    const profilesBuilder = createBuilder(() => ({
      data: [
        {
          id: "u1",
          email: "uno@test.ar",
          name: "Uno",
          avatar_url: null,
          role_id: 2,
          created_at: "2026-08-26",
        },
      ],
      error: null,
      count: 1,
    }));
    const rolesBuilder = createBuilder(() => ({
      data: [{ id: 2, slug: "coordinador", name: "Coordinador" }],
      error: null,
    }));

    fromMock
      .mockReturnValueOnce(profilesBuilder)
      .mockReturnValueOnce(rolesBuilder);

    const response = await peopleGet({
      request: new Request("http://x"),
      url: new URL("http://x/api/people?search=uno"),
    } as never);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.users[0]).toMatchObject({
      email: "uno@test.ar",
      roleSlug: "coordinador",
    });
  });
});

describe("people role assignment", () => {
  it("asigna rol por rpc", async () => {
    rpcMock.mockResolvedValue({
      data: [{ user_id: "u1", role_slug: "usuario" }],
      error: null,
    });

    const response = await peopleRolePut({
      request: new Request("http://x", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roleSlug: "usuario" }),
      }),
      params: { id: "u1" },
    } as never);

    expect(response.status).toBe(200);
  });

  it("propaga denegacion por jerarquia", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: "USERS_ROLE_ASSIGNMENT_DENIED" },
    });

    const response = await peopleRolePut({
      request: new Request("http://x", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roleSlug: "admin" }),
      }),
      params: { id: "u1" },
    } as never);

    expect(response.status).toBe(403);
  });
});
