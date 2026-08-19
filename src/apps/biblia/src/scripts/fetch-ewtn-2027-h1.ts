import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const EWTN_BASE = "https://www.ewtn.com/daily-readings";
const YEAR = 2027;

const BOOK_MAP: Record<string, string> = {
  Genesis: "Génesis",
  Exodus: "Éxodo",
  Leviticus: "Levítico",
  Numbers: "Números",
  Deuteronomy: "Deuteronomio",
  Joshua: "Josué",
  Judges: "Jueces",
  Ruth: "Rut",
  "1 Samuel": "1 Samuel",
  "2 Samuel": "2 Samuel",
  "1 Kings": "1 Reyes",
  "2 Kings": "2 Reyes",
  "1 Chronicles": "1 Crónicas",
  "2 Chronicles": "2 Crónicas",
  Ezra: "Esdras",
  Nehemiah: "Nehemías",
  Tobit: "Tobías",
  Judith: "Judit",
  Esther: "Ester",
  "1 Maccabees": "1 Macabeos",
  "2 Maccabees": "2 Macabeos",
  Job: "Job",
  Psalms: "Salmo",
  Psalm: "Salmo",
  Proverbs: "Proverbios",
  Ecclesiastes: "Eclesiastés",
  "Song of Solomon": "Cantar de los Cantares",
  "Song of Songs": "Cantar de los Cantares",
  Wisdom: "Sabiduría",
  Sirach: "Eclesiástico",
  Isaiah: "Isaías",
  Jeremiah: "Jeremías",
  Lamentations: "Lamentaciones",
  Baruch: "Baruc",
  Ezekiel: "Ezequiel",
  Daniel: "Daniel",
  Hosea: "Oseas",
  Joel: "Joel",
  Amos: "Amós",
  Obadiah: "Abdías",
  Jonah: "Jonás",
  Micah: "Miqueas",
  Nahum: "Nahum",
  Habakkuk: "Habacuc",
  Zephaniah: "Sofonías",
  Haggai: "Hageo",
  Zechariah: "Zacarías",
  Malachi: "Malaquías",
  Matthew: "Mateo",
  Mark: "Marcos",
  Luke: "Lucas",
  John: "Juan",
  Acts: "Hechos",
  Romans: "Romanos",
  "1 Corinthians": "1 Corintios",
  "2 Corinthians": "2 Corintios",
  Galatians: "Gálatas",
  Ephesians: "Efesios",
  Philippians: "Filipenses",
  Colossians: "Colosenses",
  "1 Thessalonians": "1 Tesalonicenses",
  "2 Thessalonians": "2 Tesalonicenses",
  "1 Timothy": "1 Timoteo",
  "2 Timothy": "2 Timoteo",
  Titus: "Tito",
  Philemon: "Filemón",
  Hebrews: "Hebreos",
  James: "Santiago",
  "1 Peter": "1 Pedro",
  "2 Peter": "2 Pedro",
  "1 John": "1 Juan",
  "2 John": "2 Juan",
  "3 John": "3 Juan",
  Jude: "Judas",
  Revelation: "Apocalipsis",
};

function translateRef(ref: string): string {
  if (!ref) return "";
  let result = ref.trim();
  const sorted = Object.keys(BOOK_MAP).sort((a, b) => b.length - a.length);
  for (const book of sorted) {
    const escaped = book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`\\b${escaped}\\b`, "g"),
      BOOK_MAP[book],
    );
  }
  return result;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchDate(dateStr: string) {
  try {
    const cmd = `curl -s -L -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "${EWTN_BASE}/${dateStr}"`;
    const html = execSync(cmd, { encoding: "utf-8", timeout: 15000 });
    const bodyStart = html.indexOf('"articleBody":"');
    if (bodyStart === -1) return null;
    const start = bodyStart + 15;
    const end = html.indexOf('","', start);
    if (end === -1) return null;
    const body = html
      .substring(start, end)
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"');
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
    if (!r1 && !go) return null;
    return { date: dateStr, reading1: r1, psalm: ps, reading2: r2, gospel: go };
  } catch {
    return null;
  }
}

async function main() {
  const dates: string[] = [];
  for (let m = 1; m <= 6; m++) {
    const days = new Date(YEAR, m, 0).getDate();
    for (let d = 1; d <= days; d++) {
      dates.push(
        `${YEAR}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      );
    }
  }

  console.log(`Fetching ${dates.length} days (Jan-Jun ${YEAR})...`);
  const readings: any[] = [];
  let err = 0;

  for (const d of dates) {
    const r = fetchDate(d);
    if (r && (r.reading1 || r.gospel)) readings.push(r);
    else err++;
    if (readings.length % 25 === 0 || readings.length + err === dates.length) {
      process.stdout.write(
        `\r${readings.length + err}/${dates.length} (${readings.length} ok, ${err} err)`,
      );
    }
    await sleep(1500);
  }

  console.log(`\n\n${readings.length} readings. Generating SQL...`);

  const lines = [
    `-- Lecturas Ene-Jun ${YEAR} desde EWTN`,
    `-- ${readings.length} lecturas`,
    "",
  ];
  for (const r of readings) {
    const esc = (s: string | null) =>
      s ? `'${s.replace(/'/g, "''")}'` : "NULL";
    lines.push(
      `UPDATE liturgy_daily_readings SET first_reading_ref=${esc(translateRef(r.reading1))}, psalm_ref=${esc(translateRef(r.psalm))}, second_reading_ref=${esc(r.reading2 ? translateRef(r.reading2) : null)}, gospel_ref=${esc(translateRef(r.gospel))} WHERE reading_date='${r.date}' AND rite='roman' AND region_code='AR';`,
    );
  }

  const outPath = join(
    process.cwd(),
    `src/apps/biblia/src/scripts/${YEAR}-readings-h1.sql`,
  );
  writeFileSync(outPath, lines.join("\n"), "utf-8");
  console.log(`SQL: ${outPath}`);
}

main().catch(console.error);
