import { describe, expect, it } from "vitest";
import {
  canPerformForAppRole,
  ECOSYSTEM_ROLE_HIERARCHY,
  ECOSYSTEM_ROLE_SLUGS,
  isPlatformRoleSlug,
  mapRoleSlugToAppRole,
  PLATFORM_ROLE_HIERARCHY,
  PLATFORM_ROLE_SLUGS,
} from "./role-mapping.js";

describe("role mapping", () => {
  it("enumera todos los slugs del ecosistema", () => {
    expect(ECOSYSTEM_ROLE_SLUGS).toEqual([
      "admin",
      "sacerdote",
      "coordinador",
      "musico",
      "usuario",
      "editor",
      "revisor",
    ]);
  });

  it("define jerarquia descendente por nivel", () => {
    expect(ECOSYSTEM_ROLE_HIERARCHY.admin).toBeLessThan(
      ECOSYSTEM_ROLE_HIERARCHY.sacerdote,
    );
    expect(ECOSYSTEM_ROLE_HIERARCHY.sacerdote).toBeLessThan(
      ECOSYSTEM_ROLE_HIERARCHY.coordinador,
    );
    expect(ECOSYSTEM_ROLE_HIERARCHY.coordinador).toBeLessThan(
      ECOSYSTEM_ROLE_HIERARCHY.musico,
    );
    expect(ECOSYSTEM_ROLE_HIERARCHY.musico).toBeLessThan(
      ECOSYSTEM_ROLE_HIERARCHY.usuario,
    );
    // Roles editoriales del CMS: el revisor autoriza la publicacion, por
    // lo que queda por encima del editor (menor hierarchy_level).
    expect(ECOSYSTEM_ROLE_HIERARCHY.sacerdote).toBeLessThan(
      ECOSYSTEM_ROLE_HIERARCHY.editor,
    );
    expect(ECOSYSTEM_ROLE_HIERARCHY.editor).toBeLessThan(
      ECOSYSTEM_ROLE_HIERARCHY.revisor,
    );
    expect(ECOSYSTEM_ROLE_HIERARCHY.revisor).toBeLessThan(
      ECOSYSTEM_ROLE_HIERARCHY.coordinador,
    );
  });

  it("mapea cada slug del ecosistema a su AppRole", () => {
    const cancioneroMap = {
      admin: "admin",
      sacerdote: "sacerdote",
      coordinador: "coordinador",
      musico: "musico",
      usuario: "invitado",
    };
    expect(mapRoleSlugToAppRole("admin", cancioneroMap)).toBe("admin");
    expect(mapRoleSlugToAppRole("sacerdote", cancioneroMap)).toBe("sacerdote");
    expect(mapRoleSlugToAppRole("coordinador", cancioneroMap)).toBe(
      "coordinador",
    );
    expect(mapRoleSlugToAppRole("musico", cancioneroMap)).toBe("musico");
    expect(mapRoleSlugToAppRole("usuario", cancioneroMap)).toBe("invitado");
  });

  it("devuelve fallback para slug desconocido o null", () => {
    const map = { admin: "admin", musico: "musico" };
    expect(mapRoleSlugToAppRole(null, map)).toBe("invitado");
    expect(mapRoleSlugToAppRole(undefined, map)).toBe("invitado");
    expect(mapRoleSlugToAppRole("desconocido", map)).toBe("invitado");
    expect(mapRoleSlugToAppRole("sacerdote", map)).toBe("invitado");
  });

  it("permite custom fallback", () => {
    const map = { admin: "admin" };
    expect(
      mapRoleSlugToAppRole("musico", map, { unknownRoleFallback: "anonimo" }),
    ).toBe("anonimo");
  });

  it("evaluar permisos por jerarquia de AppRole", () => {
    const cancioneroHierarchy = {
      contribute: ["musico", "sacerdote", "coordinador", "admin"],
      moderate: ["admin"],
    };
    expect(canPerformForAppRole("admin", cancioneroHierarchy)).toEqual({
      canContribute: true,
      canModerate: true,
    });
    expect(canPerformForAppRole("sacerdote", cancioneroHierarchy)).toEqual({
      canContribute: true,
      canModerate: false,
    });
    expect(canPerformForAppRole("coordinador", cancioneroHierarchy)).toEqual({
      canContribute: true,
      canModerate: false,
    });
    expect(canPerformForAppRole("musico", cancioneroHierarchy)).toEqual({
      canContribute: true,
      canModerate: false,
    });
    expect(canPerformForAppRole("invitado", cancioneroHierarchy)).toEqual({
      canContribute: false,
      canModerate: false,
    });
  });

  it("ignora slugs no presentes en el mapa (incluso si existen en el ecosistema)", () => {
    const cancioneroMap = {
      admin: "admin",
      musico: "musico",
    };
    expect(mapRoleSlugToAppRole("sacerdote", cancioneroMap)).toBe("invitado");
  });
});

describe("roles de plataforma", () => {
  it("enumera los roles de plataforma", () => {
    expect(PLATFORM_ROLE_SLUGS).toEqual(["dev", "ops", "product"]);
  });

  it("define jerarquia de plataforma debajo de admin", () => {
    expect(PLATFORM_ROLE_HIERARCHY.dev).toBeLessThan(
      PLATFORM_ROLE_HIERARCHY.ops,
    );
    expect(PLATFORM_ROLE_HIERARCHY.ops).toBeLessThan(
      PLATFORM_ROLE_HIERARCHY.product,
    );
    expect(PLATFORM_ROLE_HIERARCHY.dev).toBeGreaterThan(
      ECOSYSTEM_ROLE_HIERARCHY.admin,
    );
  });

  it("isPlatformRoleSlug acepta solo slugs de plataforma", () => {
    expect(isPlatformRoleSlug("dev")).toBe(true);
    expect(isPlatformRoleSlug("ops")).toBe(true);
    expect(isPlatformRoleSlug("product")).toBe(true);
    expect(isPlatformRoleSlug("admin")).toBe(false);
    expect(isPlatformRoleSlug("usuario")).toBe(false);
    expect(isPlatformRoleSlug("desconocido")).toBe(false);
    expect(isPlatformRoleSlug(null)).toBe(false);
    expect(isPlatformRoleSlug(undefined)).toBe(false);
  });
});
