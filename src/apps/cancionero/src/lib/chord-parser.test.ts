import { describe, expect, it } from "vitest";
import {
  alignChordsWithLyrics,
  getChordAtPosition,
  getPopoverPlacement,
  hasChordMarkup,
  isValidChordInput,
  migrateLegacyChordText,
  normalizeChords,
  parseChordLine,
  parseChordLyrics,
  plainLyrics,
  removeChordAt,
  upsertChordAt,
} from "@/lib/chord-parser";

describe("migrateLegacyChordText", () => {
  it("convierte una línea simple con un acorde al inicio", () => {
    const result = migrateLegacyChordText("[G]Hola mundo");
    expect(result.letra).toBe("Hola mundo");
    expect(result.acordes).toEqual([{ linea: 0, posicion: 0, nombre: "G" }]);
  });

  it("respeta la posición cuando el acorde aparece a la derecha del texto", () => {
    const result = migrateLegacyChordText("Ven, [D]ven Señor");
    expect(result.letra).toBe("Ven, ven Señor");
    expect(result.acordes).toEqual([{ linea: 0, posicion: 5, nombre: "D" }]);
  });

  it("conserva los offsets cuando hay acordes contiguos a texto", () => {
    const result = migrateLegacyChordText("[G]Ven, [D]ven [Em]Señor");
    expect(result.letra).toBe("Ven, ven Señor");
    expect(result.acordes).toEqual([
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "D" },
      { linea: 0, posicion: 9, nombre: "Em" },
    ]);
  });

  it("mapea correctamente múltiples líneas", () => {
    const result = migrateLegacyChordText(
      "[G]Ven, [D]ven Señor\n[G]Ven, [D]ven que te [G]esperamos",
    );
    expect(result.letra).toBe("Ven, ven Señor\nVen, ven que te esperamos");
    expect(result.acordes).toEqual([
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "D" },
      { linea: 1, posicion: 0, nombre: "G" },
      { linea: 1, posicion: 5, nombre: "D" },
      { linea: 1, posicion: 16, nombre: "G" },
    ]);
  });

  it("mantiene como texto los corchetes vacíos o sin nombre (no son acordes válidos)", () => {
    const result = migrateLegacyChordText("[G]Hola[ ] mundo");
    expect(result.letra).toBe("Hola[ ] mundo");
    expect(result.acordes).toEqual([{ linea: 0, posicion: 0, nombre: "G" }]);
  });

  it("devuelve el texto tal cual si no hay markup", () => {
    const result = migrateLegacyChordText("Sin acordes");
    expect(result.letra).toBe("Sin acordes");
    expect(result.acordes).toEqual([]);
  });

  it("maneja texto vacío", () => {
    expect(migrateLegacyChordText("")).toEqual({ letra: "", acordes: [] });
  });
});

describe("alignChordsWithLyrics", () => {
  it("agrupa los acordes por línea y los ordena por posición", () => {
    const result = alignChordsWithLyrics("Ven, ven Señor", [
      { linea: 0, posicion: 9, nombre: "Em" },
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "D" },
    ]);
    expect(result.invalid).toEqual([]);
    expect(result.lines).toEqual([
      {
        linea: 0,
        texto: "Ven, ven Señor",
        acordesEnLinea: [
          { posicion: 0, nombre: "G" },
          { posicion: 5, nombre: "D" },
          { posicion: 9, nombre: "Em" },
        ],
      },
    ]);
  });

  it("descarta acordes con linea fuera de rango", () => {
    const result = alignChordsWithLyrics("Hola", [
      { linea: 5, posicion: 0, nombre: "G" },
    ]);
    expect(result.invalid).toEqual([{ linea: 5, posicion: 0, nombre: "G" }]);
    expect(result.lines).toEqual([
      { linea: 0, texto: "Hola", acordesEnLinea: [] },
    ]);
  });

  it("descarta acordes con posicion mayor al largo de la línea", () => {
    const result = alignChordsWithLyrics("Hola", [
      { linea: 0, posicion: 10, nombre: "G" },
    ]);
    expect(result.invalid).toEqual([{ linea: 0, posicion: 10, nombre: "G" }]);
    expect(result.lines[0]?.acordesEnLinea).toEqual([]);
  });

  it("acepta acordes al final exacto de la línea (length permitido)", () => {
    const result = alignChordsWithLyrics("Hola", [
      { linea: 0, posicion: 4, nombre: "G" },
    ]);
    expect(result.invalid).toEqual([]);
    expect(result.lines[0]?.acordesEnLinea).toEqual([
      { posicion: 4, nombre: "G" },
    ]);
  });
});

describe("getChordAtPosition", () => {
  const letra = "Ven, ven Señor";
  const acordes = [
    { linea: 0, posicion: 0, nombre: "G" },
    { linea: 0, posicion: 5, nombre: "D" },
  ];

  it("encuentra el acorde más cercano a la izquierda en la posición consultada", () => {
    expect(getChordAtPosition(letra, acordes, 0, 6)).toEqual({
      linea: 0,
      posicion: 5,
      nombre: "D",
    });
    expect(getChordAtPosition(letra, acordes, 0, 4)).toEqual({
      linea: 0,
      posicion: 0,
      nombre: "G",
    });
  });

  it("devuelve el acorde más cercano a la izquierda incluso al inicio", () => {
    expect(getChordAtPosition(letra, acordes, 0, 0)).toEqual({
      linea: 0,
      posicion: 0,
      nombre: "G",
    });
    expect(getChordAtPosition(letra, acordes, 0, -1)).toBeNull();
  });

  it("devuelve null si la posición está antes del primer acorde", () => {
    const sinAcordeInicial = [{ linea: 0, posicion: 5, nombre: "D" }];
    expect(getChordAtPosition(letra, sinAcordeInicial, 0, 0)).toBeNull();
  });

  it("devuelve null si la línea consultada no existe", () => {
    expect(getChordAtPosition(letra, acordes, 5, 0)).toBeNull();
  });
});

describe("upsertChordAt y removeChordAt", () => {
  const letra = "Hola mundo";

  it("agrega un acorde en una posición válida", () => {
    const result = upsertChordAt(letra, [], 0, 5, "G");
    expect(result.acordes).toEqual([{ linea: 0, posicion: 5, nombre: "G" }]);
  });

  it("reemplaza un acorde existente en la misma posición", () => {
    const start = [
      { linea: 0, posicion: 5, nombre: "G" },
      { linea: 0, posicion: 6, nombre: "D" },
    ];
    const result = upsertChordAt(letra, start, 0, 5, "Em");
    expect(result.acordes).toEqual([
      { linea: 0, posicion: 5, nombre: "Em" },
      { linea: 0, posicion: 6, nombre: "D" },
    ]);
  });

  it("rechaza un acorde con nombre inválido", () => {
    expect(() => upsertChordAt(letra, [], 0, 0, "")).toThrow();
    expect(() => upsertChordAt(letra, [], 0, 0, "G!".repeat(5))).toThrow();
  });

  it("rechaza posiciones fuera de la línea", () => {
    expect(() => upsertChordAt(letra, [], 0, 99, "G")).toThrow();
    expect(() => upsertChordAt(letra, [], -1, 0, "G")).toThrow();
  });

  it("elimina el acorde en la posición indicada", () => {
    const start = [
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "D" },
    ];
    expect(removeChordAt(start, 0, 0)).toEqual([
      { linea: 0, posicion: 5, nombre: "D" },
    ]);
  });
});

describe("helpers de compat (legado)", () => {
  it("hasChordMarkup detecta el formato [Acorde]", () => {
    expect(hasChordMarkup("[G]Hola")).toBe(true);
    expect(hasChordMarkup("Hola")).toBe(false);
  });

  it("parseChordLine separa texto y acordes", () => {
    expect(parseChordLine("[G]Hola [D]mundo")).toEqual({
      raw: "[G]Hola [D]mundo",
      tokens: [
        { type: "chord", value: "G" },
        { type: "text", value: "Hola " },
        { type: "chord", value: "D" },
        { type: "text", value: "mundo" },
      ],
    });
  });

  it("parseChordLyrics divide por saltos de línea", () => {
    const lines = parseChordLyrics("[G]L1\n[D]L2");
    expect(lines).toHaveLength(2);
    expect(lines[0]?.tokens[0]).toEqual({ type: "chord", value: "G" });
    expect(lines[1]?.tokens[0]).toEqual({ type: "chord", value: "D" });
  });

  it("plainLyrics elimina el markup y normaliza espacios", () => {
    expect(plainLyrics("[G]Ven,   [D]ven")).toBe("Ven, ven");
  });
});

describe("isValidChordInput", () => {
  it("acepta nombres válidos de acordes", () => {
    expect(isValidChordInput("G")).toBe(true);
    expect(isValidChordInput("F#m")).toBe(true);
    expect(isValidChordInput("Cmaj7")).toBe(true);
    expect(isValidChordInput("B7(add9)")).toBe(true);
  });

  it("rechaza nombres inválidos", () => {
    expect(isValidChordInput("")).toBe(false);
    expect(isValidChordInput("G!".repeat(3))).toBe(false);
    expect(isValidChordInput("A" + "x".repeat(20))).toBe(false);
  });
});

describe("normalizeChords", () => {
  const letra = "Ven, ven Señor\nVen, ven que te esperamos";

  it("conserva acordes válidos y descarta inválidos", () => {
    const result = normalizeChords(letra, [
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "D" },
      { linea: 5, posicion: 0, nombre: "C" },
      { linea: 0, posicion: 999, nombre: "X" },
      { linea: 0, posicion: 0, nombre: "" },
    ]);
    expect(result).toEqual([
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "D" },
    ]);
  });

  it("elimina duplicados en la misma linea y posicion", () => {
    const result = normalizeChords(letra, [
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 0, nombre: "D" },
      { linea: 0, posicion: 5, nombre: "Em" },
    ]);
    expect(result).toEqual([
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "Em" },
    ]);
  });

  it("normaliza el nombre del acorde (trim y espacios)", () => {
    const result = normalizeChords(letra, [
      { linea: 0, posicion: 0, nombre: "  G  " },
      { linea: 0, posicion: 5, nombre: "F#m" },
    ]);
    expect(result).toEqual([
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "F#m" },
    ]);
  });

  it("ordena los acordes por linea y posicion", () => {
    const result = normalizeChords(letra, [
      { linea: 1, posicion: 5, nombre: "D" },
      { linea: 0, posicion: 5, nombre: "D" },
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 1, posicion: 0, nombre: "G" },
    ]);
    expect(result).toEqual([
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "D" },
      { linea: 1, posicion: 0, nombre: "G" },
      { linea: 1, posicion: 5, nombre: "D" },
    ]);
  });

  it("descarta acordes con nombres no permitidos", () => {
    const result = normalizeChords(letra, [
      { linea: 0, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 5, nombre: "G!".repeat(3) },
      { linea: 0, posicion: 10, nombre: "  " },
    ]);
    expect(result).toEqual([{ linea: 0, posicion: 0, nombre: "G" }]);
  });

  it("descarta acordes con linea o posicion no enteras o negativas", () => {
    const result = normalizeChords(letra, [
      { linea: -1, posicion: 0, nombre: "G" },
      { linea: 0, posicion: -1, nombre: "G" },
      { linea: 0.5, posicion: 0, nombre: "G" },
      { linea: 0, posicion: 1.5, nombre: "G" },
      { linea: 0, posicion: 0, nombre: "G" },
    ]);
    expect(result).toEqual([{ linea: 0, posicion: 0, nombre: "G" }]);
  });

  it("acepta acordes al final exacto de la línea (posicion == lineLength)", () => {
    const result = normalizeChords("Hola", [
      { linea: 0, posicion: 4, nombre: "G" },
    ]);
    expect(result).toEqual([{ linea: 0, posicion: 4, nombre: "G" }]);
  });

  it("devuelve array vacío si la letra está vacía", () => {
    expect(
      normalizeChords("", [{ linea: 0, posicion: 0, nombre: "G" }]),
    ).toEqual([]);
  });
});

describe("getPopoverPlacement", () => {
  const popoverSize = { width: 200, height: 80 };
  const containerRect = {
    left: 0,
    top: 0,
    right: 400,
    bottom: 200,
    width: 400,
    height: 200,
  };

  const rect = (left: number, top: number, width: number, height: number) => ({
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  });

  it("no aplica flip si el popover cabe abajo a la izquierda", () => {
    const targetRect = rect(20, 30, 10, 16);
    const placement = getPopoverPlacement({
      targetRect,
      popoverSize,
      containerRect,
    });
    expect(placement).toEqual({ flipX: false, flipY: false });
  });

  it("aplica flipX cuando el popover se sale por la derecha del contenedor", () => {
    const targetRect = rect(350, 30, 10, 16);
    const placement = getPopoverPlacement({
      targetRect,
      popoverSize,
      containerRect,
    });
    expect(placement.flipX).toBe(true);
    expect(placement.flipY).toBe(false);
  });

  it("aplica flipY cuando el popover se sale por abajo del contenedor", () => {
    const targetRect = rect(20, 180, 10, 16);
    const placement = getPopoverPlacement({
      targetRect,
      popoverSize,
      containerRect,
    });
    expect(placement.flipX).toBe(false);
    expect(placement.flipY).toBe(true);
  });

  it("aplica flipX y flipY en la esquina inferior derecha", () => {
    const targetRect = rect(350, 180, 10, 16);
    const placement = getPopoverPlacement({
      targetRect,
      popoverSize,
      containerRect,
    });
    expect(placement).toEqual({ flipX: true, flipY: true });
  });

  it("no aplica flipX si el popover cabe justo sin salirse", () => {
    const targetRect = rect(200, 30, 10, 16);
    const placement = getPopoverPlacement({
      targetRect,
      popoverSize,
      containerRect,
    });
    expect(placement.flipX).toBe(false);
  });

  it("no aplica flipX si voltear lo sacaría por la izquierda", () => {
    const targetRect = rect(50, 30, 10, 16);
    const placement = getPopoverPlacement({
      targetRect,
      popoverRect: { width: 400, height: 80 } as never,
      popoverSize: { width: 400, height: 80 },
      containerRect,
    } as never);
    expect(placement.flipX).toBe(false);
  });

  it("respeta el offset configurado", () => {
    const targetRect = rect(20, 30, 10, 16);
    const placement = getPopoverPlacement({
      targetRect,
      popoverSize,
      containerRect,
      offset: 50,
    });
    expect(placement).toEqual({ flipX: false, flipY: false });
  });

  it("aplica flipY si el offset configurado empuja al popover fuera", () => {
    const targetRect = rect(20, 190, 10, 16);
    const placement = getPopoverPlacement({
      targetRect,
      popoverSize,
      containerRect,
      offset: 20,
    });
    expect(placement.flipY).toBe(true);
  });
});
