import fs from "node:fs";

const monthArg = process.argv[2] ?? null;
const outputPath = new URL(
  monthArg
    ? `../tmp-gcatholic-2026-update-${monthArg}.sql`
    : "../tmp-gcatholic-2026-update.sql",
  import.meta.url,
);
const sourceUrl = "https://gcatholic.org/calendar/ics/2026-es-AR.ics?v=3";

const seasonRanges = [
  ["2026-01-01", "2026-01-11", "Tiempo de Navidad"],
  ["2026-01-12", "2026-02-17", "Tiempo Ordinario"],
  ["2026-02-18", "2026-03-28", "Cuaresma"],
  ["2026-03-29", "2026-04-01", "Semana Santa"],
  ["2026-04-02", "2026-04-04", "Triduo Pascual"],
  ["2026-04-05", "2026-05-24", "Tiempo Pascual"],
  ["2026-05-25", "2026-11-28", "Tiempo Ordinario"],
  ["2026-11-29", "2026-12-24", "Adviento"],
  ["2026-12-25", "2026-12-31", "Tiempo de Navidad"],
];

const rankMap = {
  "[S]": "solemnidad",
  "[F]": "fiesta",
  "[M]": "memoria_obligatoria",
  "[m]": "memoria_facultativa",
  "[m*]": "conmemoracion",
  feria: "feria",
};

const rankOrder = {
  "[S]": 1,
  "[F]": 2,
  "[M]": 3,
  "[m]": 4,
  "[m*]": 5,
  feria: 9,
};

const colorMap = {
  "⚪": "blanco",
  "🟢": "verde",
  "🟣": "morado",
  "🔴": "rojo",
  "🌸": "rosa",
};

function unfold(value) {
  return value.replace(/\r?\n[ \t]/g, "");
}

function esc(value) {
  return String(value).replace(/'/g, "''").replace(/\\,/g, ",");
}

function normalizeTitle(value) {
  return value.replace(/\\,/g, ",").trim();
}

function toIsoDate(compactDate) {
  return `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`;
}

function toMonthDayKey(isoDate) {
  return isoDate.slice(5, 10);
}

function resolveSeason(isoDate) {
  const match = seasonRanges.find(
    ([start, end]) => isoDate >= start && isoDate <= end,
  );

  return match?.[2] ?? "Tiempo Ordinario";
}

function inferMarian(title) {
  return /(santa maría, madre de dios|nuestra señora|madre de la iglesia|inmaculado corazón de maría|inmaculada concepción|asunción de la santísima virgen maría|natividad de la virgen maría|virgen maría, reina|nuestra señora del valle|nuestra señora de luján|nuestra señora de itatí|nuestra señora del carmen|nuestra señora de los dolores|nuestra señora de la merced|nuestra señora del rosario|nuestra señora de guadalupe|nuestra señora de lourdes|nuestra señora de fátima|la anunciación del señor|la santísima virgen maría, reina)/i.test(
    title,
  );
}

function inferArgentina(title) {
  return /(luján|lujan|itatí|itati|valle|brochero|crescencia|tránsito|transito|ceferino|zatti|maría antonia de paz y figueroa|maria antonia de paz y figueroa)/i.test(
    title,
  );
}

function choosePrimaryEvent(events) {
  return events.sort(
    (left, right) =>
      (rankOrder[left.rankToken] ?? 9) - (rankOrder[right.rankToken] ?? 9),
  )[0];
}

const icsText = await (await fetch(sourceUrl)).text();
const rawEvents = icsText
  .split("BEGIN:VEVENT")
  .slice(1)
  .map((chunk) => chunk.split("END:VEVENT")[0]);

const parsedEvents = rawEvents
  .map((entry) => {
    const raw = unfold(entry);
    const date = (raw.match(/DTSTART;VALUE=DATE:(\d{8})/) || [])[1];
    const summary = (raw.match(/SUMMARY:(.+)/) || [])[1];

    if (!date || !summary) {
      return null;
    }

    const emoji = Array.from(summary)[0];
    const rankToken = (summary.match(/\[(S|F|M|m\*|m)\]/) || [])[0] || "feria";
    const title = normalizeTitle(
      summary.replace(/^[^ ]+\s*/, "").replace(/^\[(S|F|M|m\*|m)\]\s*/, ""),
    );
    const isoDate = toIsoDate(date);

    return {
      isoDate,
      mmdd: toMonthDayKey(isoDate),
      title,
      rankToken,
      rankSlug: rankMap[rankToken] ?? "feria",
      color: colorMap[emoji] ?? "verde",
      season: resolveSeason(isoDate),
      isMarian: inferMarian(title),
      isArgentina: inferArgentina(title),
    };
  })
  .filter(Boolean);

const grouped = new Map();

for (const event of parsedEvents) {
  const bucket = grouped.get(event.mmdd) ?? [];
  bucket.push(event);
  grouped.set(event.mmdd, bucket);
}

const rows = [...grouped.values()]
  .map((events) => choosePrimaryEvent(events))
  .filter((row) => (monthArg ? row.mmdd.startsWith(`${monthArg}-`) : true))
  .sort((left, right) => left.mmdd.localeCompare(right.mmdd));

const sql = [];
sql.push("begin;");
sql.push(
  "alter table public.liturgy_day_profiles add column if not exists rank_slug text;",
);
sql.push(
  "alter table public.liturgy_day_profiles add column if not exists is_marian boolean not null default false;",
);
sql.push(
  "alter table public.liturgy_day_profiles add column if not exists is_argentina boolean not null default false;",
);
sql.push(
  "alter table public.liturgy_day_profiles add column if not exists source_note text;",
);
sql.push(
  "alter table public.liturgy_day_profiles add column if not exists title_2026 text;",
);

for (const row of rows) {
  sql.push(
    `update public.liturgy_day_profiles set title_2026 = '${esc(row.title)}', celebration_name = '${esc(row.title)}', liturgical_season = '${esc(row.season)}', liturgical_color = '${esc(row.color)}', rank_slug = '${esc(row.rankSlug)}', is_marian = ${row.isMarian ? "true" : "false"}, is_argentina = ${row.isArgentina ? "true" : "false"}, source_note = 'GCatholic Argentina 2026' where month_day_key = '${row.mmdd}' and rite = 'roman' and region_code = 'AR';`,
  );
}

sql.push("commit;");
fs.writeFileSync(outputPath, sql.join("\n"));

console.log(
  `Generated SQL with ${rows.length} updates${monthArg ? ` for month ${monthArg}` : ""}.`,
);
