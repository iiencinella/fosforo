import { describe, expect, it } from "vitest";
import { filterFallbackSongs } from "@/lib/data";
import { searchQuerySchema } from "@/lib/validators";

describe("filterFallbackSongs - sin filtros devuelve todas las publicadas", () => {
  it("devuelve todas las canciones publicadas cuando no hay filtros", () => {
    const result = filterFallbackSongs({});

    const ids = result.map((song) => song.id);
    expect(ids).toContain("fallback-001");
    expect(ids).toContain("fallback-002");
  });

  it("excluye canciones pendientes por defecto", () => {
    const result = filterFallbackSongs({});

    const ids = result.map((song) => song.id);
    expect(ids).not.toContain("fallback-003");
  });

  it("incluye canciones pendientes solo si se piden explicitamente", () => {
    const result = filterFallbackSongs({ includePending: true });

    const ids = result.map((song) => song.id);
    expect(ids).toContain("fallback-003");
  });
});

describe("filterFallbackSongs - Motor A (búsqueda libre)", () => {
  it("devuelve canciones cuyos titulos contienen alguno de los tokens", () => {
    const result = filterFallbackSongs({
      motor: "A",
      q: "pescador",
    });

    expect(result.map((song) => song.id)).toContain("fallback-002");
  });

  it("tokeniza la query y matchea con OR aunque no sea substring exacto", () => {
    const result = filterFallbackSongs({
      motor: "A",
      q: "ven senor",
    });

    expect(result.map((song) => song.id)).toContain("fallback-001");
  });

  it("ignora acentos y mayusculas en la busqueda", () => {
    const result = filterFallbackSongs({
      motor: "A",
      q: "PERDÓN DIOS",
      includePending: true,
    });

    expect(result.map((song) => song.id)).toContain("fallback-003");
  });

  it("no devuelve nada si la query no matchea ningun token", () => {
    const result = filterFallbackSongs({
      motor: "A",
      q: "xyzzy123",
    });

    expect(result).toEqual([]);
  });

  it("Motor A sin q devuelve todas las publicadas (no exige query)", () => {
    const result = filterFallbackSongs({ motor: "A" });

    const ids = result.map((song) => song.id);
    expect(ids).toContain("fallback-001");
    expect(ids).toContain("fallback-002");
  });
});

describe("filterFallbackSongs - Motor B (Tiempo + Momento)", () => {
  it("devuelve canciones de un tiempo liturgico en cualquier momento", () => {
    const result = filterFallbackSongs({
      motor: "B",
      tiempo: "Adviento",
    });

    const ids = result.map((song) => song.id);
    expect(ids).toContain("fallback-001");
  });

  it("cruza tiempo y momento cuando ambos vienen informados", () => {
    const result = filterFallbackSongs({
      motor: "B",
      tiempo: "Adviento",
      momento: "Entrada",
    });

    const ids = result.map((song) => song.id);
    expect(ids).toContain("fallback-001");
  });

  it("devuelve vacio si la combinacion tiempo+momento no existe", () => {
    const result = filterFallbackSongs({
      motor: "B",
      tiempo: "Adviento",
      momento: "Comunion",
    });

    expect(result).toEqual([]);
  });

  it("Motor B sin tiempo devuelve todas las publicadas (no exige filtro)", () => {
    const result = filterFallbackSongs({ motor: "B" });

    const ids = result.map((song) => song.id);
    expect(ids).toContain("fallback-001");
    expect(ids).toContain("fallback-002");
  });
});

describe("filterFallbackSongs - Motor C (Momento independiente)", () => {
  it("devuelve canciones con ese momento en cualquier tiempo", () => {
    const result = filterFallbackSongs({
      motor: "C",
      momento: "Comunion",
    });

    const ids = result.map((song) => song.id);
    expect(ids).toContain("fallback-002");
  });

  it("ignora explicitamente el tiempo si se informa junto con el momento", () => {
    const withTime = filterFallbackSongs({
      motor: "C",
      tiempo: "Adviento",
      momento: "Comunion",
    });

    const withoutTime = filterFallbackSongs({
      motor: "C",
      momento: "Comunion",
    });

    expect(withTime.map((song) => song.id)).toEqual(
      withoutTime.map((song) => song.id),
    );
  });

  it("Motor C sin momento devuelve todas las publicadas (no exige filtro)", () => {
    const result = filterFallbackSongs({ motor: "C" });

    const ids = result.map((song) => song.id);
    expect(ids).toContain("fallback-001");
    expect(ids).toContain("fallback-002");
  });
});

describe("searchQuerySchema - validacion laxa", () => {
  it("acepta params vacios (sin filtros = todo el catalogo)", () => {
    const result = searchQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("Motor A rechaza q de 1 caracter", () => {
    const result = searchQuerySchema.safeParse({ motor: "A", q: "v" });
    expect(result.success).toBe(false);
  });

  it("Motor A acepta q valido", () => {
    const result = searchQuerySchema.safeParse({ motor: "A", q: "ven" });
    expect(result.success).toBe(true);
  });

  it("Motor A sin q es valido (deja sin filtrar)", () => {
    const result = searchQuerySchema.safeParse({ motor: "A" });
    expect(result.success).toBe(true);
  });

  it("Motor B sin tiempo es valido (deja sin filtrar)", () => {
    const result = searchQuerySchema.safeParse({ motor: "B" });
    expect(result.success).toBe(true);
  });

  it("Motor C sin momento es valido (deja sin filtrar)", () => {
    const result = searchQuerySchema.safeParse({ motor: "C" });
    expect(result.success).toBe(true);
  });

  it("Si no se envia motor, el comportamiento por defecto es Motor A", () => {
    const result = searchQuerySchema.safeParse({ q: "ven" });
    expect(result.success).toBe(true);
  });
});
