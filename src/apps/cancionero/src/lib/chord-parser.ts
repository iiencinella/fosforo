import type { ChordPosition } from "@/lib/types";
import { isChordNameValid } from "@/lib/chord-names";

export type ChordLineToken =
  { type: "text"; value: string } | { type: "chord"; value: string };

export type ParsedChordLine = {
  raw: string;
  tokens: ChordLineToken[];
};

export type AlignedChordLine = {
  linea: number;
  texto: string;
  acordesEnLinea: Array<{ posicion: number; nombre: string }>;
};

const CHORD_PATTERN = /\[([^\[\]\n]+)\]/g;

export function hasChordMarkup(value: string): boolean {
  CHORD_PATTERN.lastIndex = 0;
  return CHORD_PATTERN.test(value);
}

export function parseChordLine(line: string): ParsedChordLine {
  const tokens: ChordLineToken[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(CHORD_PATTERN)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;

    if (start > lastIndex) {
      tokens.push({
        type: "text",
        value: line.slice(lastIndex, start),
      });
    }

    const chord = (match[1] ?? "").trim();
    if (chord.length > 0) {
      tokens.push({ type: "chord", value: chord });
    }

    lastIndex = end;
  }

  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  }

  if (tokens.length === 0) {
    tokens.push({ type: "text", value: line });
  }

  return {
    raw: line,
    tokens,
  };
}

export function parseChordLyrics(lyrics: string): ParsedChordLine[] {
  return lyrics.split(/\r?\n/).map((line) => parseChordLine(line));
}

export function plainLyrics(lyrics: string): string {
  return lyrics.replace(CHORD_PATTERN, "").replace(/\s+/g, " ").trim();
}

function normalizeChordName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isValidChordName(value: string): boolean {
  return value.length <= 24 && isChordNameValid(value);
}

function isValidPosition(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export type MigrateResult = {
  letra: string;
  acordes: ChordPosition[];
};

export function migrateLegacyChordText(legacy: string): MigrateResult {
  if (typeof legacy !== "string" || legacy.length === 0) {
    return { letra: "", acordes: [] };
  }

  const lines = legacy.split(/\r?\n/);
  const letraLines: string[] = [];
  const acordes: ChordPosition[] = [];

  lines.forEach((line, lineaIndex) => {
    let lastIndex = 0;
    let currentLine = "";

    for (const match of line.matchAll(CHORD_PATTERN)) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      const nombre = normalizeChordName(match[1] ?? "");

      if (isValidChordName(nombre)) {
        currentLine += line.slice(lastIndex, start);
        const posicion = currentLine.length;
        acordes.push({ linea: lineaIndex, posicion, nombre });
        lastIndex = end;
      } else {
        currentLine += line.slice(lastIndex, end);
        lastIndex = end;
      }
    }

    currentLine += line.slice(lastIndex);
    letraLines.push(currentLine);
  });

  return { letra: letraLines.join("\n"), acordes };
}

export type AlignResult = {
  lines: AlignedChordLine[];
  invalid: ChordPosition[];
};

export function alignChordsWithLyrics(
  letra: string,
  acordes: ChordPosition[],
): AlignResult {
  const lines = letra.split(/\r?\n/);
  const grouped: Array<AlignedChordLine["acordesEnLinea"]> = lines.map(
    () => [],
  );
  const invalid: ChordPosition[] = [];

  for (const chord of acordes) {
    if (
      !isValidPosition(chord.linea) ||
      !isValidPosition(chord.posicion) ||
      !isValidChordName(chord.nombre)
    ) {
      invalid.push(chord);
      continue;
    }

    if (chord.linea >= lines.length) {
      invalid.push(chord);
      continue;
    }

    const lineLength = lines[chord.linea]?.length ?? 0;
    if (chord.posicion > lineLength) {
      invalid.push(chord);
      continue;
    }

    grouped[chord.linea]!.push({
      posicion: chord.posicion,
      nombre: chord.nombre,
    });
  }

  for (const group of grouped) {
    group.sort((a, b) => a.posicion - b.posicion);
  }

  const aligned: AlignedChordLine[] = lines.map((texto, linea) => ({
    linea,
    texto,
    acordesEnLinea: grouped[linea] ?? [],
  }));

  return { lines: aligned, invalid };
}

export function getChordAtPosition(
  letra: string,
  acordes: ChordPosition[],
  linea: number,
  posicion: number,
): ChordPosition | null {
  if (!isValidPosition(linea) || !isValidPosition(posicion)) return null;

  const lines = letra.split(/\r?\n/);
  if (linea >= lines.length) return null;
  if (posicion > (lines[linea]?.length ?? 0)) return null;

  const candidates = acordes
    .filter(
      (chord) =>
        chord.linea === linea &&
        chord.posicion <= posicion &&
        isValidChordName(chord.nombre),
    )
    .sort((a, b) => b.posicion - a.posicion);

  return candidates[0] ?? null;
}

export type ChordAddResult = {
  letra: string;
  acordes: ChordPosition[];
};

export function upsertChordAt(
  letra: string,
  acordes: ChordPosition[],
  linea: number,
  posicion: number,
  nombre: string,
): ChordAddResult {
  const normalized = normalizeChordName(nombre);
  if (!isValidChordName(normalized)) {
    throw new Error("Nombre de acorde inválido");
  }
  if (!isValidPosition(linea) || !isValidPosition(posicion)) {
    throw new Error("Posición inválida");
  }

  const lines = letra.split(/\r?\n/);
  if (linea >= lines.length) {
    throw new Error("Línea fuera de rango");
  }
  if (posicion > (lines[linea]?.length ?? 0)) {
    throw new Error("Posición fuera del texto de la línea");
  }

  const filtered = acordes.filter(
    (chord) => !(chord.linea === linea && chord.posicion === posicion),
  );
  filtered.push({ linea, posicion, nombre: normalized });
  filtered.sort((a, b) =>
    a.linea === b.linea ? a.posicion - b.posicion : a.linea - b.linea,
  );

  return { letra, acordes: filtered };
}

export function removeChordAt(
  acordes: ChordPosition[],
  linea: number,
  posicion: number,
): ChordPosition[] {
  return acordes.filter(
    (chord) => !(chord.linea === linea && chord.posicion === posicion),
  );
}

export function isValidChordInput(value: string): boolean {
  return isValidChordName(normalizeChordName(value));
}

export function normalizeChords(
  letra: string,
  acordes: ChordPosition[],
): ChordPosition[] {
  if (typeof letra !== "string" || letra.length === 0) {
    return [];
  }
  const lines = letra.split(/\r?\n/);
  const seen = new Set<string>();
  const result: ChordPosition[] = [];

  for (const chord of acordes) {
    if (!Number.isInteger(chord.linea) || chord.linea < 0) continue;
    if (chord.linea >= lines.length) continue;
    if (!Number.isInteger(chord.posicion) || chord.posicion < 0) continue;
    const lineLength = lines[chord.linea]?.length ?? 0;
    if (chord.posicion > lineLength) continue;
    const nombre = normalizeChordName(chord.nombre);
    if (!isValidChordName(nombre)) continue;
    const key = `${chord.linea}:${chord.posicion}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ linea: chord.linea, posicion: chord.posicion, nombre });
  }

  result.sort((a, b) =>
    a.linea === b.linea ? a.posicion - b.posicion : a.linea - b.linea,
  );
  return result;
}

export type PopoverRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type PopoverPlacement = {
  flipX: boolean;
  flipY: boolean;
};

export type PopoverPlacementInput = {
  targetRect: PopoverRect;
  popoverSize: { width: number; height: number };
  containerRect: PopoverRect;
  offset?: number;
};

export function getPopoverPlacement(
  input: PopoverPlacementInput,
): PopoverPlacement {
  const offset = input.offset ?? 4;
  const { targetRect, popoverSize, containerRect } = input;

  const popoverLeftNoFlip = targetRect.left;
  const popoverRightNoFlip = popoverLeftNoFlip + popoverSize.width;
  const popoverBottomNoFlip = targetRect.bottom + offset + popoverSize.height;

  const popoverRightFlipX = targetRect.right;
  const popoverLeftFlipX = popoverRightFlipX - popoverSize.width;
  const popoverTopFlipY = targetRect.top - offset - popoverSize.height;

  const flipX =
    popoverRightNoFlip > containerRect.right &&
    popoverLeftFlipX >= containerRect.left;
  const flipY =
    popoverBottomNoFlip > containerRect.bottom &&
    popoverTopFlipY >= containerRect.top;

  return { flipX, flipY };
}
