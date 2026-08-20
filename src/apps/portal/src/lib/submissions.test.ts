import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createContactSubmission,
  createFeedbackSubmission,
} from "@/lib/submissions";

const from = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
  getPortalSupabaseServerClient: () => ({ from }),
}));

function mockInsert(id = "submission-id") {
  const single = vi.fn().mockResolvedValue({ data: { id }, error: null });
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  return { insert, select, single };
}

describe("portal submissions", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("persists contact and audit records", async () => {
    const contact = mockInsert("contact-id");
    const audit = { insert: vi.fn().mockResolvedValue({ error: null }) };
    from.mockReturnValueOnce(contact).mockReturnValueOnce(audit);

    const result = await createContactSubmission({
      name: "Ana",
      email: "ana@example.com",
      message: "Necesito ayuda con el portal",
    });

    expect(result).toEqual({ id: "contact-id" });
    expect(contact.insert).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@example.com",
      message: "Necesito ayuda con el portal",
    });
    expect(audit.insert).toHaveBeenCalledWith({
      submission_type: "contact",
      submission_id: "contact-id",
      event_type: "created",
      actor: "portal",
    });
  });

  it("propagates persistence errors", async () => {
    const feedback = {
      insert: vi.fn(() => ({
        select: () => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error("database unavailable"),
          }),
        }),
      })),
    };
    from.mockReturnValueOnce(feedback);

    await expect(
      createFeedbackSubmission({
        name: "Luis",
        contactChannel: "luis@example.com",
        category: "ux",
        message: "La navegación móvil necesita mejorar",
      }),
    ).rejects.toThrow("database unavailable");
  });
});
