import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  updatePassword,
} from "@/lib/auth";

const mocks = vi.hoisted(() => ({
  getClient: vi.fn(),
}));

vi.mock("@repo/auth", () => ({
  getSupabaseAuthClient: mocks.getClient,
}));

describe("usuario auth services", () => {
  beforeEach(() => vi.clearAllMocks());

  it("delegates profile creation to the database trigger", async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { user: { id: "user-1", email: "ana@example.com" } },
      error: null,
    });
    const from = vi.fn();
    const client = { auth: { signUp }, from };
    mocks.getClient.mockReturnValue(client);

    const result = await registerUser({
      email: "ana@example.com",
      password: "correct-horse",
      name: "Ana",
    });

    expect(result.userId).toBe("user-1");
    expect(signUp).toHaveBeenCalledOnce();
    expect(from).not.toHaveBeenCalled();
  });

  it("normalizes invalid login errors", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: new Error("provider detail"),
    });
    mocks.getClient.mockReturnValue({ auth: { signInWithPassword } });

    await expect(
      loginUser({ email: "ana@example.com", password: "wrong-pass" }),
    ).rejects.toThrow("USERS_INVALID_CREDENTIALS");
  });

  it("passes the configured recovery redirect to Supabase", async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null });
    mocks.getClient.mockReturnValue({ auth: { resetPasswordForEmail } });

    await requestPasswordReset(
      "ana@example.com",
      "https://usuarios.fosforo.org/auth/reset-password",
    );

    expect(resetPasswordForEmail).toHaveBeenCalledWith("ana@example.com", {
      redirectTo: "https://usuarios.fosforo.org/auth/reset-password",
    });
  });

  it("updates passwords using the access-token scoped client", async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    mocks.getClient.mockReturnValue({ auth: { updateUser } });

    await updatePassword("recovery-token", "new-password");

    expect(mocks.getClient).toHaveBeenCalledWith({
      accessToken: "recovery-token",
    });
    expect(updateUser).toHaveBeenCalledWith({ password: "new-password" });
  });
});
