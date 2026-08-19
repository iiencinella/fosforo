import { describe, expect, it } from "vitest";
import {
  CANCIONERO_ROLE_HIERARCHY,
  CANCIONERO_ROLE_LEVEL,
  CANCIONERO_ROLE_MAP,
  PAGE_MINIMUM_ROLE,
  canAccessPage,
  canContribute,
  canModerate,
  getMinimumRoleForPath,
  resolveAppRole,
} from "./auth";

describe("CANCIONERO_ROLE_MAP", () => {
  it("maps admin -> admin", () => {
    expect(CANCIONERO_ROLE_MAP.admin).toBe("admin");
  });

  it("maps sacerdote -> sacerdote", () => {
    expect(CANCIONERO_ROLE_MAP.sacerdote).toBe("sacerdote");
  });

  it("maps coordinador -> coordinador", () => {
    expect(CANCIONERO_ROLE_MAP.coordinador).toBe("coordinador");
  });

  it("maps musico -> musico", () => {
    expect(CANCIONERO_ROLE_MAP.musico).toBe("musico");
  });

  it("maps usuario -> usuario (Cancionero expone el rol base del ecosistema)", () => {
    expect(CANCIONERO_ROLE_MAP.usuario).toBe("usuario");
  });
});

describe("CANCIONERO_ROLE_HIERARCHY", () => {
  it("permite contribuir a coordinador, sacerdote y admin (musico ya no contribuye directamente)", () => {
    expect([...CANCIONERO_ROLE_HIERARCHY.contribute].sort()).toEqual([
      "admin",
      "coordinador",
      "sacerdote",
    ]);
  });

  it("permite moderar a sacerdote y admin", () => {
    expect([...CANCIONERO_ROLE_HIERARCHY.moderate].sort()).toEqual([
      "admin",
      "sacerdote",
    ]);
  });

  it("incluye schedule como capacidad futura (coordinador, sacerdote, admin)", () => {
    expect(CANCIONERO_ROLE_HIERARCHY.contribute).toContain("coordinador");
  });
});

describe("resolveAppRole", () => {
  it.each([
    ["admin", "admin"],
    ["sacerdote", "sacerdote"],
    ["coordinador", "coordinador"],
    ["musico", "musico"],
    ["usuario", "usuario"],
  ] as const)("mapea el slug del ecosistema %s a %s", (slug, expected) => {
    expect(resolveAppRole(slug)).toBe(expected);
  });

  it("devuelve 'invitado' cuando roleSlug es null", () => {
    expect(resolveAppRole(null)).toBe("invitado");
  });

  it("devuelve 'invitado' cuando roleSlug es undefined", () => {
    expect(resolveAppRole(undefined)).toBe("invitado");
  });

  it("devuelve 'invitado' cuando el slug no esta en el mapa", () => {
    expect(resolveAppRole("visitante")).toBe("invitado");
    expect(resolveAppRole("")).toBe("invitado");
  });
});

describe("CANCIONERO_ROLE_LEVEL", () => {
  it("admin tiene el nivel mas alto (0)", () => {
    expect(CANCIONERO_ROLE_LEVEL.admin).toBe(0);
  });

  it("sacerdote tiene nivel 1", () => {
    expect(CANCIONERO_ROLE_LEVEL.sacerdote).toBe(1);
  });

  it("coordinador tiene nivel 2", () => {
    expect(CANCIONERO_ROLE_LEVEL.coordinador).toBe(2);
  });

  it("musico tiene nivel 3", () => {
    expect(CANCIONERO_ROLE_LEVEL.musico).toBe(3);
  });

  it("usuario tiene nivel 4", () => {
    expect(CANCIONERO_ROLE_LEVEL.usuario).toBe(4);
  });

  it("invitado tiene el nivel mas bajo (5)", () => {
    expect(CANCIONERO_ROLE_LEVEL.invitado).toBe(5);
  });
});

describe("PAGE_MINIMUM_ROLE", () => {
  it("paginas publicas accesibles por invitado", () => {
    expect(PAGE_MINIMUM_ROLE["/"]).toBe("invitado");
    expect(PAGE_MINIMUM_ROLE["/buscar"]).toBe("invitado");
    expect(PAGE_MINIMUM_ROLE["/canciones/"]).toBe("invitado");
    expect(PAGE_MINIMUM_ROLE["/liturgia"]).toBe("invitado");
    expect(PAGE_MINIMUM_ROLE["/estado"]).toBe("sacerdote");
  });

  it("/perfil requiere usuario", () => {
    expect(PAGE_MINIMUM_ROLE["/perfil"]).toBe("usuario");
  });

  it("/contribuir requiere coordinador", () => {
    expect(PAGE_MINIMUM_ROLE["/contribuir"]).toBe("coordinador");
  });

  it("/moderacion requiere sacerdote", () => {
    expect(PAGE_MINIMUM_ROLE["/moderacion"]).toBe("sacerdote");
  });
});

describe("getMinimumRoleForPath", () => {
  it("devuelve el rol minimo para rutas exactas", () => {
    expect(getMinimumRoleForPath("/buscar")).toBe("invitado");
    expect(getMinimumRoleForPath("/contribuir")).toBe("coordinador");
    expect(getMinimumRoleForPath("/moderacion")).toBe("sacerdote");
  });

  it("devuelve el rol minimo para rutas con prefijo /canciones/", () => {
    expect(getMinimumRoleForPath("/canciones/123")).toBe("invitado");
    expect(getMinimumRoleForPath("/canciones/abc")).toBe("invitado");
  });

  it("devuelve null para rutas sin restriccion", () => {
    expect(getMinimumRoleForPath("/ruta-desconocida")).toBeNull();
  });
});

describe("canAccessPage", () => {
  it("invitado puede acceder a /buscar", () => {
    expect(canAccessPage("invitado", "/buscar")).toBe(true);
  });

  it("usuario puede acceder a /perfil", () => {
    expect(canAccessPage("usuario", "/perfil")).toBe(true);
  });

  it("invitado NO puede acceder a /perfil", () => {
    expect(canAccessPage("invitado", "/perfil")).toBe(false);
  });

  it("coordinador puede acceder a /contribuir", () => {
    expect(canAccessPage("coordinador", "/contribuir")).toBe(true);
  });

  it("musico NO puede acceder a /contribuir", () => {
    expect(canAccessPage("musico", "/contribuir")).toBe(false);
  });

  it("usuario NO puede acceder a /contribuir", () => {
    expect(canAccessPage("usuario", "/contribuir")).toBe(false);
  });

  it("sacerdote puede acceder a /moderacion", () => {
    expect(canAccessPage("sacerdote", "/moderacion")).toBe(true);
  });

  it("coordinador NO puede acceder a /moderacion", () => {
    expect(canAccessPage("coordinador", "/moderacion")).toBe(false);
  });

  it("admin puede acceder a /moderacion", () => {
    expect(canAccessPage("admin", "/moderacion")).toBe(true);
    expect(canAccessPage("admin", "/contribuir")).toBe(true);
  });

  it("musico puede acceder a /canciones/123 (prefijo)", () => {
    expect(canAccessPage("musico", "/canciones/123")).toBe(true);
  });

  it("devuelve true para rutas sin restriccion", () => {
    expect(canAccessPage("invitado", "/ruta-libre")).toBe(true);
  });
});

describe("canContribute", () => {
  it("devuelve false para musico", () => {
    expect(canContribute("musico")).toBe(false);
  });

  it("devuelve true para sacerdote", () => {
    expect(canContribute("sacerdote")).toBe(true);
  });

  it("devuelve true para coordinador", () => {
    expect(canContribute("coordinador")).toBe(true);
  });

  it("devuelve true para admin", () => {
    expect(canContribute("admin")).toBe(true);
  });

  it("devuelve false para invitado", () => {
    expect(canContribute("invitado")).toBe(false);
  });
});

describe("canModerate", () => {
  it("devuelve true para admin", () => {
    expect(canModerate("admin")).toBe(true);
  });

  it("devuelve true para sacerdote (puede evaluar y aprobar)", () => {
    expect(canModerate("sacerdote")).toBe(true);
  });

  it.each([["musico"], ["coordinador"], ["invitado"]] as const)(
    "devuelve false para %s",
    (role) => {
      expect(canModerate(role)).toBe(false);
    },
  );
});
