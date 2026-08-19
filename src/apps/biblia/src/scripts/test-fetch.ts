import { execSync } from "node:child_process";

const BOOK_MAP: Record<string, string> = {
  Genesis: "Génesis",
  Exodus: "Éxodo",
  Leviticus: "Levítico",
  Numbers: "Números",
  Deuteronomy: "Deuteronomio",
  Ezekiel: "Ezequiel",
  Matthew: "Mateo",
  Mark: "Marcos",
  Luke: "Lucas",
  John: "Juan",
  Psalms: "Salmo",
  Psalm: "Salmo",
  Isaiah: "Isaías",
  Jeremiah: "Jeremías",
  Daniel: "Daniel",
  Hosea: "Oseas",
  Joel: "Joel",
  Amos: "Amós",
  Romans: "Romanos",
  Galatians: "Gálatas",
  Ephesians: "Efesios",
  "1 Corinthians": "1 Corintios",
  "2 Corinthians": "2 Corintios",
  Philippians: "Filipenses",
  Colossians: "Colosenses",
  Hebrews: "Hebreos",
  James: "Santiago",
  Acts: "Hechos",
  Revelation: "Apocalipsis",
  Wisdom: "Sabiduría",
  Sirach: "Eclesiástico",
  Baruch: "Baruc",
};

function translate(ref: string): string {
  let r = ref;
  const sorted = Object.keys(BOOK_MAP).sort((a, b) => b.length - a.length);
  for (const book of sorted) {
    const escaped = book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    r = r.replace(new RegExp(`\\b${escaped}\\b`, "g"), BOOK_MAP[book]);
  }
  return r;
}

function fetchDate(dateStr: string) {
  const cmd = `curl -s -L -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "https://www.ewtn.com/daily-readings/${dateStr}"`;
  const html = execSync(cmd, { encoding: "utf-8", timeout: 15000 });

  const bodyStart = html.indexOf('"articleBody":"');
  if (bodyStart === -1) return null;

  const start = bodyStart + 15;
  const end = html.indexOf('","', start);
  if (end === -1) return null;

  const rawBody = html.substring(start, end);
  const body = rawBody.replace(/\\n/g, "\n").replace(/\\"/g, '"');

  const lines = body.split("\n");
  let r1 = "",
    ps = "",
    r2: string | null = null,
    go = "",
    sec = "";

  for (const line of lines) {
    const t = line.trim();
    if (t === "First Reading") {
      sec = "r1";
      continue;
    }
    if (t === "Responsorial Psalm") {
      sec = "ps";
      continue;
    }
    if (t === "Second Reading") {
      sec = "r2";
      continue;
    }
    if (t === "Gospel") {
      sec = "go";
      continue;
    }
    if (sec === "r1" && !r1 && t && !/^\d+$/.test(t)) r1 = t;
    if (sec === "ps" && !ps && t && !/^\d+$/.test(t)) ps = t;
    if (sec === "r2" && r2 === null && t && !/^\d+$/.test(t)) r2 = t;
    if (sec === "go" && !go && t && !/^\d+$/.test(t)) go = t;
  }

  return { date: dateStr, reading1: r1, psalm: ps, reading2: r2, gospel: go };
}

for (const d of ["2026-08-12", "2026-01-01", "2026-12-25"]) {
  const r = fetchDate(d);
  if (r) {
    console.log(`${d}:`);
    console.log(`  R1: ${translate(r.reading1)}`);
    console.log(`  PS: ${translate(r.psalm)}`);
    console.log(`  R2: ${r.reading2 ? translate(r.reading2) : "(ninguna)"}`);
    console.log(`  EV: ${translate(r.gospel)}`);
  } else {
    console.log(`${d}: ERROR`);
  }
}
