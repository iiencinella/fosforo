import { describe, expect, it } from "vitest";
import {
  availableActions,
  CMS_003_NOT_IN_REVIEW,
  CMS_REASON_REQUIRED,
  CMS_TRANSITION_INVALID,
  entryCreateSchema,
  entryTransitionSchema,
  paginate,
  targetStatus,
  transitionError,
} from "@/lib/entries";

describe("maquina de estados por rol (RB-CMS-002/004, TC-CMS-004)", () => {
  it("editor solo puede enviar draft a review", () => {
    expect(transitionError("draft", "submit", "editor")).toBeNull();
    expect(transitionError("draft", "approve", "editor")).toBe(
      CMS_TRANSITION_INVALID,
    );
    expect(transitionError("review", "submit", "editor")).toBe(
      CMS_TRANSITION_INVALID,
    );
    expect(transitionError("published", "archive", "editor")).toBe(
      CMS_TRANSITION_INVALID,
    );
  });

  it("revisor aprueba o rechaza solo desde review", () => {
    expect(transitionError("review", "approve", "revisor", "ok")).toBeNull();
    expect(
      transitionError("review", "reject", "revisor", "falta nimio"),
    ).toBeNull();
    expect(transitionError("draft", "approve", "revisor", "ok")).toBe(
      CMS_003_NOT_IN_REVIEW,
    );
    expect(transitionError("published", "archive", "revisor")).toBe(
      CMS_TRANSITION_INVALID,
    );
    expect(transitionError("draft", "submit", "revisor")).toBe(
      CMS_TRANSITION_INVALID,
    );
  });

  it("admin puede todo el ciclo (incluye archive y restore)", () => {
    expect(transitionError("draft", "submit", "admin")).toBeNull();
    expect(transitionError("review", "approve", "admin", "ok")).toBeNull();
    expect(transitionError("review", "reject", "admin", "ok")).toBeNull();
    expect(transitionError("published", "archive", "admin")).toBeNull();
    expect(transitionError("archived", "restore", "admin")).toBeNull();
  });

  it("rechazar sin motivo exige razon (UC-CMS-005)", () => {
    expect(transitionError("review", "reject", "revisor")).toBe(
      CMS_REASON_REQUIRED,
    );
  });

  it("targetStatus mapea cada accion a su estado destino", () => {
    expect(targetStatus("submit")).toBe("review");
    expect(targetStatus("approve")).toBe("published");
    expect(targetStatus("reject")).toBe("draft");
    expect(targetStatus("archive")).toBe("archived");
    expect(targetStatus("restore")).toBe("draft");
  });

  it("availableActions refleja los botones del panel por rol", () => {
    expect(availableActions("draft", "editor")).toEqual(["submit"]);
    expect(availableActions("review", "revisor")).toEqual([
      "approve",
      "reject",
    ]);
    expect(availableActions("published", "editor")).toEqual([]);
    expect(availableActions("published", "admin")).toEqual(["archive"]);
    expect(availableActions("archived", "admin")).toEqual(["restore"]);
  });
});

describe("schemas de entrada", () => {
  it("entryCreateSchema valida estructura basica", () => {
    const parsed = entryCreateSchema.safeParse({
      content_type_slug: "oracion",
      slug: "padre-nuestro",
      data: { titulo: "Padre Nuestro" },
    });
    expect(parsed.success).toBe(true);
  });

  it("entryCreateSchema rechaza slugs invalidos", () => {
    expect(
      entryCreateSchema.safeParse({
        content_type_slug: "oracion",
        slug: "Padre Nuestro",
        data: {},
      }).success,
    ).toBe(false);
  });

  it("entryTransitionSchema rechaza acciones desconocidas", () => {
    expect(entryTransitionSchema.safeParse({ action: "publish" }).success).toBe(
      false,
    );
    expect(entryTransitionSchema.safeParse({ action: "approve" }).success).toBe(
      true,
    );
  });
});

describe("paginate (patron de log)", () => {
  const items = Array.from({ length: 45 }, (_, index) => index);

  it("pagina con limite por defecto 20", () => {
    const result = paginate(items, {});
    expect(result.total).toBe(45);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.data).toHaveLength(20);
  });

  it("clamp de limit a 50 y page a 1", () => {
    const result = paginate(items, { page: 0, limit: 500 });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
  });

  it("ultima pagina parcial", () => {
    const result = paginate(items, { page: 3 });
    expect(result.data).toHaveLength(5);
  });
});
