import { describe, expect, it } from "vitest";
import {
  scheduleInputToRow,
  scheduleRowToUi,
  scheduleSchema,
  templeInputToRow,
  templeSchema,
  templeStatusSchema,
} from "@/lib/validators";
import {
  CELEBRATION_TYPES,
  WEEKDAY_INDEXES,
  buildTempleSlug,
  weekdayDbToIndex,
  weekdayIndexToDb,
} from "@/lib/mappers";

const validTemple = {
  name: "Parroquia Santa Teresita",
  address: "Av. Almafuerte 420",
  city: "Parana",
  province: "Entre Rios",
  latitude: -31.7424,
  longitude: -60.5238,
};

describe("TC-0107-ADMINISTRACION-001 - validacion de creacion de iglesia", () => {
  it("acepta payload completo y produce fila del esquema consolidado", () => {
    const parsed = templeSchema.safeParse({
      ...validTemple,
      country: "",
      phone: "+54 343 412-0045",
      email: "parroquia@test.ar",
      website: "https://santateresita.org.ar",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const row = templeInputToRow(parsed.data);
      expect(row.id).toBe("parroquia-santa-teresita-parana");
      expect(row.lat).toBe(-31.7424);
      expect(row.contact_phone).toBe("+54 343 412-0045");
      expect(row.country).toBe("Argentina");
      expect(row.status).toBe("review");
      expect(row.is_active).toBe(true);
    }
  });

  it("rechaza payloads sin campos obligatorios", () => {
    expect(templeSchema.safeParse({ name: "X" }).success).toBe(false);
    expect(
      templeSchema.safeParse({ ...validTemple, address: "   " }).success,
    ).toBe(false);
    expect(
      templeSchema.safeParse({ ...validTemple, province: "" }).success,
    ).toBe(false);
  });
});

describe("TC-0107-ADMINISTRACION-002 y 007 - unicidad nombre+ciudad", () => {
  it("genera el mismo slug para nombre/ciudad equivalentes con casos distintos", () => {
    const a = buildTempleSlug("Parroquia Santa Teresita", "Paraná");
    const b = buildTempleSlug("parroquia santa teresita", "parana");

    // El indice unico de DB opera sobre lower(name), lower(city): el slug
    // determinista hace la deteccion de duplicados predecible.
    expect(a).toBe(b);
  });

  it("normaliza acentos y signos en el slug", () => {
    expect(buildTempleSlug("San José Obrero", "Córdoba")).toBe(
      "san-jose-obrero-cordoba",
    );
  });

  it("limita la longitud del slug generado", () => {
    const slug = buildTempleSlug("X".repeat(120), "Y".repeat(80));
    expect(slug.length).toBeLessThanOrEqual(80);
  });
});

describe("TC-0107-ADMINISTRACION-003 - validacion de coordenadas", () => {
  it("rechaza latitud fuera de rango", () => {
    expect(
      templeSchema.safeParse({ ...validTemple, latitude: -91 }).success,
    ).toBe(false);
    expect(
      templeSchema.safeParse({ ...validTemple, latitude: 91 }).success,
    ).toBe(false);
  });

  it("rechaza longitud fuera de rango", () => {
    expect(
      templeSchema.safeParse({ ...validTemple, longitude: -181 }).success,
    ).toBe(false);
  });

  it("rechaza coordenadas no numericas", () => {
    expect(
      templeSchema.safeParse({
        ...validTemple,
        latitude: "-31.74",
      } as never).success,
    ).toBe(false);
  });

  it("acepta valores limite validos", () => {
    expect(
      templeSchema.safeParse({
        ...validTemple,
        latitude: -90,
        longitude: 180,
      }).success,
    ).toBe(true);
  });
});

describe("TC-0107-ADMINISTRACION-004 - validacion de horarios", () => {
  it("acepta horario valido y lo mapea al esquema consolidado", () => {
    const parsed = scheduleSchema.safeParse({
      celebration_type: "misa",
      weekday: 6,
      start_time: "19:30",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const row = scheduleInputToRow(parsed.data, "celebration-id", "temple-x");
      expect(row.weekday).toBe("sunday");
      expect(row.start_time).toBe("19:30");
      expect(row.duration_min).toBe(45);
      expect(row.temple_id).toBe("temple-x");
    }
  });

  it("rechaza formatos de hora invalidos", () => {
    for (const bad of ["24:00", "7:5", "12h30", "19:75", ""]) {
      expect(
        scheduleSchema.safeParse({
          celebration_type: "misa",
          weekday: 0,
          start_time: bad,
        }).success,
      ).toBe(false);
    }
  });

  it("acota el tipo al catalogo que consume la app publica", () => {
    expect(
      scheduleSchema.safeParse({
        celebration_type: "bautismo",
        weekday: 0,
        start_time: "10:00",
      }).success,
    ).toBe(false);

    for (const type of CELEBRATION_TYPES) {
      expect(
        scheduleSchema.safeParse({
          celebration_type: type,
          weekday: 0,
          start_time: "10:00",
        }).success,
      ).toBe(true);
    }
  });

  it("valida duracion dentro del constraint de DB (1..240)", () => {
    expect(
      scheduleSchema.safeParse({
        celebration_type: "misa",
        weekday: 0,
        start_time: "10:00",
        duration_min: 0,
      }).success,
    ).toBe(false);
    expect(
      scheduleSchema.safeParse({
        celebration_type: "misa",
        weekday: 0,
        start_time: "10:00",
        duration_min: 241,
      }).success,
    ).toBe(false);
  });

  it("mapea filas DB hacia el contrato historico de UI en ambos sentidos", () => {
    expect(WEEKDAY_INDEXES[weekdayDbToIndex("saturday")]).toBe("saturday");
    expect(weekdayIndexToDb(0)).toBe("monday");

    const ui = scheduleRowToUi({
      id: "x",
      type: "rosario",
      weekday: "friday",
      start_time: "18:30:00",
      duration_min: 35,
      notes: null,
      is_active: true,
    });

    expect(ui).toMatchObject({
      celebration_type: "rosario",
      weekday: 4,
      start_time: "18:30",
      is_active: true,
    });
  });
});

describe("TC-0107-ADMINISTRACION-005 aux - cambio de estado por rol admin", () => {
  it("solo acepta active/inactive como estados operativos", () => {
    expect(templeStatusSchema.safeParse({ status: "active" }).success).toBe(
      true,
    );
    expect(templeStatusSchema.safeParse({ status: "inactive" }).success).toBe(
      true,
    );
    expect(templeStatusSchema.safeParse({ status: "stale" }).success).toBe(
      false,
    );
  });
});
