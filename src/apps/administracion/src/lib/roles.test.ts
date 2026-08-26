import { describe, expect, it } from "vitest";
import {
  roleCreateSchema,
  roleUpdateSchema,
  permissionsReplaceSchema,
  assignPersonRoleSchema,
  peopleListQuerySchema,
  parseRoleId,
} from "@/lib/roles";

describe("roles validators", () => {
  it("valida alta de rol", () => {
    expect(
      roleCreateSchema.safeParse({
        slug: "catequista",
        name: "Catequista",
        hierarchyLevel: 70,
      }).success,
    ).toBe(true);
  });

  it("rechaza slug invalido", () => {
    expect(
      roleCreateSchema.safeParse({
        slug: "Admin Root",
        name: "x",
        hierarchyLevel: 0,
      }).success,
    ).toBe(false);
  });

  it("valida update de rol", () => {
    expect(
      roleUpdateSchema.safeParse({
        name: "Coordinador",
        hierarchyLevel: 45,
      }).success,
    ).toBe(true);
  });

  it("valida reemplazo de matriz de permisos", () => {
    expect(
      permissionsReplaceSchema.safeParse({
        apps: [
          { appSlug: "portal", canAccess: true },
          { appSlug: "biblia", canAccess: false },
        ],
      }).success,
    ).toBe(true);
  });

  it("rechaza appSlug no soportado", () => {
    expect(
      permissionsReplaceSchema.safeParse({
        apps: [{ appSlug: "misal", canAccess: true }],
      }).success,
    ).toBe(false);
  });

  it("valida payload de asignacion de persona", () => {
    expect(
      assignPersonRoleSchema.safeParse({ roleSlug: "usuario" }).success,
    ).toBe(true);
  });

  it("normaliza query de listado de personas", () => {
    const parsed = peopleListQuerySchema.parse({ limit: "100", offset: "0" });
    expect(parsed.limit).toBe(100);
    expect(parsed.offset).toBe(0);
  });
});

describe("parseRoleId", () => {
  it("acepta ids validos", () => {
    expect(parseRoleId("1")).toBe(1);
    expect(parseRoleId("44")).toBe(44);
  });

  it("rechaza ids invalidos", () => {
    expect(parseRoleId(undefined)).toBeNull();
    expect(parseRoleId("abc")).toBeNull();
    expect(parseRoleId("0")).toBeNull();
    expect(parseRoleId("-5")).toBeNull();
  });
});
