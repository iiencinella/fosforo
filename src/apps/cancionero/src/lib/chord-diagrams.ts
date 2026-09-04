import { toAnglo } from "@/lib/chord-names";

export type ChordDiagram = { name: string; frets: Array<number | "x" | "o"> };

const SHAPES: Record<string, Array<number | "x" | "o">> = {
  C: ["x", 3, 2, 0, 1, 0],
  D: ["x", "x", 0, 2, 3, 2],
  E: [0, 2, 2, 1, 0, 0],
  F: [1, 3, 3, 2, 1, 1],
  G: [3, 2, 0, 0, 0, 3],
  A: ["x", 0, 2, 2, 2, 0],
  B: ["x", 2, 4, 4, 4, 2],
  Am: ["x", 0, 2, 2, 1, 0],
  Em: [0, 2, 2, 0, 0, 0],
  Dm: ["x", "x", 0, 2, 3, 1],
  Cm: ["x", 3, 5, 5, 4, 3],
  G7: [3, 2, 0, 0, 0, 1],
  C7: ["x", 3, 2, 3, 1, 0],
  D7: ["x", "x", 0, 2, 1, 2],
  E7: [0, 2, 0, 1, 0, 0],
  A7: ["x", 0, 2, 0, 2, 0],
};

export function getChordDiagram(name: string): ChordDiagram | null {
  const anglo = toAnglo(name);
  if (!anglo) return null;
  const base = anglo.split("/")[0] ?? anglo;
  const frets = SHAPES[base] ?? SHAPES[base.replace(/(maj|sus|add).*/, "")];
  return frets ? { name, frets } : null;
}

export function renderChordDiagram(diagram: ChordDiagram): string {
  const width = 96;
  const height = 112;
  const left = 16;
  const top = 24;
  const fretGap = 14;
  const stringGap = 13;
  const lines = Array.from(
    { length: 6 },
    (_, index) =>
      `<line x1="${left + index * stringGap}" y1="${top}" x2="${left + index * stringGap}" y2="${top + fretGap * 4}" />`,
  ).join("");
  const frets = Array.from(
    { length: 5 },
    (_, index) =>
      `<line x1="${left}" y1="${top + index * fretGap}" x2="${left + stringGap * 5}" y2="${top + index * fretGap}" />`,
  ).join("");
  const marks = diagram.frets
    .map((fret, index) => {
      const x = left + index * stringGap;
      if (fret === "x")
        return `<text x="${x}" y="16" text-anchor="middle">x</text>`;
      if (fret === "o") return `<circle cx="${x}" cy="16" r="3" fill="none" />`;
      return `<circle cx="${x}" cy="${top + (fret - 0.5) * fretGap}" r="4" class="dot" />`;
    })
    .join("");
  return `<svg class="cancionero-chord-diagram" viewBox="0 0 ${width} ${height}" role="img" aria-label="Diagrama de ${diagram.name}"><text class="name" x="48" y="105" text-anchor="middle">${diagram.name}</text><g class="grid">${lines}${frets}</g>${marks}</svg>`;
}
