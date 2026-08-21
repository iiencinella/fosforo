import { beforeEach, describe, expect, it, vi } from "vitest";
import { assignRole, listAuditEvents, listUsers } from "@/lib/admin";

const mocks = vi.hoisted(() => ({
  getClient: vi.fn(),
}));

vi.mock("@repo/auth", () => ({
  getSupabaseAuthClient: mocks.getClient,
}));

function chain<T>(result: T) {
  const promise = Promise.resolve(result);
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    range: vi.fn(() => promise),
    ilike: vi.fn(() => builder),
    limit: vi.fn(() => promise),
    in: vi.fn(() => promise),
    eq: vi.fn(() => builder),
    single: vi.fn(() => promise),
  };
  return builder;
}

describe("usuario admin services", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the actor access token when listing users", async () => {
    const profiles = chain({
      data: [
        {
          id: "user-1",
          email: "ana@example.com",
          name: "Ana",
          avatar_url: null,
          role_id: 1,
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      error: null,
    });
    const roles = chain({
      data: [{ id: 1, slug: "admin", name: "Admin" }],
      error: null,
    });
    const from = vi
      .fn()
      .mockReturnValueOnce(profiles)
      .mockReturnValueOnce(roles);
    mocks.getClient.mockReturnValue({ from });

    const result = await listUsers("admin-token");

    expect(mocks.getClient).toHaveBeenCalledWith({
      accessToken: "admin-token",
    });
    expect(result.users[0]?.role).toBe("admin");
    expect(result.pagination.total).toBe(1);
  });

  it("performs role changes through the transactional RPC", async () => {
    const roles = chain({ data: { id: 2, slug: "coordinador" }, error: null });
    const rpc = vi.fn().mockResolvedValue({
      data: [{ user_id: "user-2", role_slug: "coordinador" }],
      error: null,
    });
    const from = vi.fn().mockReturnValue(roles);
    mocks.getClient.mockReturnValue({ from, rpc });

    const result = await assignRole(
      "user-2",
      { roleSlug: "coordinador" },
      null,
      "admin-token",
    );

    expect(rpc).toHaveBeenCalledWith("assign_user_role", {
      p_target_user_id: "user-2",
      p_role_slug: "coordinador",
      p_ip_address: null,
    });
    expect(result).toEqual({ userId: "user-2", roleSlug: "coordinador" });
  });

  it("limits audit log reads before querying Supabase", async () => {
    const audit = chain({ data: [], error: null });
    const from = vi.fn().mockReturnValue(audit);
    mocks.getClient.mockReturnValue({ from });

    await listAuditEvents(9999, "admin-token");

    expect(audit.limit).toHaveBeenCalledWith(500);
  });
});
