import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@repo/env";
import { z } from "zod";

import type {
  CalendarDayDto,
  CalendarDayProfileRecord,
  CalendarDayRecord,
  CalendarMonthDayDto,
  CalendarMonthDto,
  CalendarReading,
  LiturgicalRank,
  LiturgicalColor,
  RelatedLink,
} from "@/types/calendar";

const RITE = "roman";
const REGION = "AR";
const CACHE_TTL_MS = 1000 * 60 * 10;
const FALLBACK_DATASET_YEAR = 2025;
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  timeZone: "UTC",
});
const MONTH_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const recordSchema = z.object({
  id: z.number(),
  reading_date: z.string(),
  rite: z.string(),
  region_code: z.string(),
  celebration_type: z.string().nullable(),
  celebration_name: z.string().nullable(),
  cycle: z.string().nullable(),
  week: z.number().int().nullable(),
  first_reading_ref: z.string().nullable(),
  psalm_ref: z.string().nullable(),
  second_reading_ref: z.string().nullable(),
  gospel_ref: z.string().nullable(),
  source_year: z.number().int().nullable(),
});

const profileSchema = z.object({
  id: z.number(),
  month_day_key: z.string(),
  rite: z.string(),
  region_code: z.string(),
  celebration_type: z.string().nullable(),
  celebration_name: z.string().nullable(),
  liturgical_season: z.string(),
  liturgical_color: z.enum(["verde", "blanco", "morado", "rojo", "rosa"]),
  cycle: z.string().nullable(),
  week: z.number().int().nullable(),
  first_reading_ref: z.string().nullable(),
  psalm_ref: z.string().nullable(),
  second_reading_ref: z.string().nullable(),
  gospel_ref: z.string().nullable(),
  source_year: z.number().int().nullable(),
  is_approximate: z.boolean(),
  rank_slug: z
    .enum([
      "solemnidad",
      "fiesta",
      "memoria_obligatoria",
      "memoria_facultativa",
      "conmemoracion",
      "feria",
    ])
    .nullable(),
  is_marian: z.boolean(),
  is_argentina: z.boolean(),
  source_note: z.string().nullable(),
  title_2026: z.string().nullable(),
});

const RANK_LABELS: Record<LiturgicalRank, string> = {
  solemnidad: "Solemnidad",
  fiesta: "Fiesta",
  memoria_obligatoria: "Memoria obligatoria",
  memoria_facultativa: "Memoria facultativa",
  conmemoracion: "Conmemoracion",
  feria: "Feria",
};

let cachedDataset:
  | {
      expiresAt: number;
      rows: CalendarDayRecord[];
    }
  | undefined;

let cachedProfiles:
  | {
      expiresAt: number;
      rows: CalendarDayProfileRecord[];
    }
  | undefined;

export class CalendarInputError extends Error {}
export class CalendarConfigError extends Error {}

function getSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function toIsoDate(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function createUtcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

function getTodayDate() {
  const now = new Date();
  return createUtcDate(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
  );
}

function toMonthDayKey(date: Date) {
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function parseDateParam(value: string | null | undefined) {
  if (!value) {
    return getTodayDate();
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new CalendarInputError(
      "La fecha solicitada no tiene un formato ISO válido.",
    );
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = createUtcDate(year, month, day);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    throw new CalendarInputError(
      "La fecha solicitada no existe dentro del calendario.",
    );
  }

  return parsed;
}

export function parseMonthParams(
  yearParam: string | null | undefined,
  monthParam: string | null | undefined,
  fallbackDate: Date,
) {
  if (!yearParam || !monthParam) {
    return createUtcDate(
      fallbackDate.getUTCFullYear(),
      fallbackDate.getUTCMonth() + 1,
      1,
    );
  }

  const year = Number(yearParam);
  const month = Number(monthParam);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new CalendarInputError("El mes solicitado no es válido.");
  }

  return createUtcDate(year, month, 1);
}

async function getDataset() {
  if (cachedDataset && cachedDataset.expiresAt > Date.now()) {
    return cachedDataset.rows;
  }

  const supabase = getSupabaseClient();
  const response = await supabase
    .from("liturgy_daily_readings")
    .select(
      [
        "id",
        "reading_date",
        "rite",
        "region_code",
        "celebration_type",
        "celebration_name",
        "cycle",
        "week",
        "first_reading_ref",
        "psalm_ref",
        "second_reading_ref",
        "gospel_ref",
        "source_year",
      ].join(","),
    )
    .eq("rite", RITE)
    .eq("region_code", REGION)
    .order("reading_date", { ascending: true });

  if (response.error) {
    throw new Error(
      `No se pudo leer el calendario desde Supabase: ${response.error.message}`,
    );
  }

  const rows = z.array(recordSchema).parse(response.data ?? []);
  cachedDataset = {
    rows,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return rows;
}

async function getProfiles() {
  if (cachedProfiles && cachedProfiles.expiresAt > Date.now()) {
    return cachedProfiles.rows;
  }

  const supabase = getSupabaseClient();
  const response = await supabase
    .from("liturgy_day_profiles")
    .select(
      [
        "id",
        "month_day_key",
        "rite",
        "region_code",
        "celebration_type",
        "celebration_name",
        "liturgical_season",
        "liturgical_color",
        "cycle",
        "week",
        "first_reading_ref",
        "psalm_ref",
        "second_reading_ref",
        "gospel_ref",
        "source_year",
        "is_approximate",
        "rank_slug",
        "is_marian",
        "is_argentina",
        "source_note",
        "title_2026",
      ].join(","),
    )
    .eq("rite", RITE)
    .eq("region_code", REGION)
    .order("month_day_key", { ascending: true });

  if (response.error) {
    throw new Error(
      `No se pudo leer el perfil litúrgico desde Supabase: ${response.error.message}`,
    );
  }

  const rows = z.array(profileSchema).parse(response.data ?? []);
  cachedProfiles = {
    rows,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return rows;
}

export function formatTypeLabel(value: string | null) {
  if (!value) return "Jornada litúrgica";
  return value
    .split("_")
    .map((fragment) => fragment.charAt(0).toUpperCase() + fragment.slice(1))
    .join(" ");
}

export function formatRankLabel(value: LiturgicalRank | null) {
  if (!value) {
    return null;
  }

  return RANK_LABELS[value] ?? formatTypeLabel(value);
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const COLOR_RULES: Array<{ match: RegExp; color: LiturgicalColor }> = [
  {
    match: /navidad|epifania|pascua|resurreccion|inmaculada|sagrado corazon/,
    color: "blanco",
  },
  {
    match: /viernes santo|pasion|pentecostes|martir|apostol|cruz/,
    color: "rojo",
  },
  { match: /adviento|cuaresma/, color: "morado" },
  { match: /gaudete|laetare/, color: "rosa" },
];

const SEASON_RULES: Array<{
  match: RegExp;
  season: string;
  color: LiturgicalColor;
}> = [
  { match: /navidad|epifania/, season: "Tiempo de Navidad", color: "blanco" },
  { match: /cuaresma/, season: "Cuaresma", color: "morado" },
  { match: /adviento/, season: "Adviento", color: "morado" },
  {
    match: /pascua|resurreccion|pentecostes/,
    season: "Tiempo de Pascua",
    color: "blanco",
  },
  { match: /viernes santo|pasion/, season: "Semana Santa", color: "rojo" },
];

function resolveLiturgicalMeta(record: CalendarDayRecord) {
  const normalizedName = normalizeText(record.celebration_name);
  const normalizedType = normalizeText(record.celebration_type);
  const joined = [normalizedName, normalizedType].filter(Boolean).join(" ");

  const seasonRule = SEASON_RULES.find((rule) => rule.match.test(joined));
  if (seasonRule) {
    return {
      season: seasonRule.season,
      color: seasonRule.color,
    };
  }

  const colorRule = COLOR_RULES.find((rule) => rule.match.test(joined));
  if (colorRule) {
    return {
      season:
        record.celebration_type === "solemnidad"
          ? "Solemnidad"
          : formatTypeLabel(record.celebration_type),
      color: colorRule.color,
    };
  }

  if (record.celebration_type === "solemnidad") {
    return {
      season: "Solemnidad",
      color: "blanco" as LiturgicalColor,
    };
  }

  return {
    season: "Tiempo Ordinario",
    color: "verde" as LiturgicalColor,
  };
}

export function getSeason(record: CalendarDayRecord) {
  return resolveLiturgicalMeta(record).season;
}

export function getColor(record: CalendarDayRecord): LiturgicalColor {
  return resolveLiturgicalMeta(record).color;
}

export function getReadings(record: CalendarDayRecord): CalendarReading[] {
  return [
    ["Primera lectura", record.first_reading_ref],
    ["Salmo", record.psalm_ref],
    ["Segunda lectura", record.second_reading_ref],
    ["Evangelio", record.gospel_ref],
  ]
    .filter((item): item is [CalendarReading["label"], string] =>
      Boolean(item[1]),
    )
    .map(([label, reference]) => ({ label, reference }));
}

function getReadingsFromProfile(
  record: CalendarDayProfileRecord,
): CalendarReading[] {
  return [
    ["Primera lectura", record.first_reading_ref],
    ["Salmo", record.psalm_ref],
    ["Segunda lectura", record.second_reading_ref],
    ["Evangelio", record.gospel_ref],
  ]
    .filter((item): item is [CalendarReading["label"], string] =>
      Boolean(item[1]),
    )
    .map(([label, reference]) => ({ label, reference }));
}

export function buildRelatedLinks(record: CalendarDayRecord): RelatedLink[] {
  const links: RelatedLink[] = [];

  if (record.first_reading_ref || record.gospel_ref) {
    links.push({
      label: "Ir a Biblia",
      href: "/apps/biblia",
      description:
        "Profundiza las referencias del día desde la experiencia bíblica del ecosistema.",
    });
  }

  links.push({
    label: "Ir a Misal",
    href: "/apps/misal",
    description:
      "Continúa la jornada litúrgica desde los textos y apoyos de la Misa.",
  });

  links.push({
    label: "Ir a Oraciones",
    href: "/apps/oraciones",
    description:
      "Conecta la celebración del día con oraciones y acompañamiento espiritual.",
  });

  if (record.celebration_name) {
    links.push({
      label: "Ir a Santopedia",
      href: "/apps/santopedia",
      description:
        "Amplía el contexto de la celebración o de figuras santas relacionadas con la jornada.",
    });
  }

  return links;
}

function buildRelatedLinksFromProfile(
  record: CalendarDayProfileRecord,
): RelatedLink[] {
  const equivalentRecord: CalendarDayRecord = {
    id: record.id,
    reading_date: `${record.source_year ?? FALLBACK_DATASET_YEAR}-${record.month_day_key}`,
    rite: record.rite,
    region_code: record.region_code,
    celebration_type: record.celebration_type,
    celebration_name: record.celebration_name,
    cycle: record.cycle,
    week: record.week,
    first_reading_ref: record.first_reading_ref,
    psalm_ref: record.psalm_ref,
    second_reading_ref: record.second_reading_ref,
    gospel_ref: record.gospel_ref,
    source_year: record.source_year,
  };

  return buildRelatedLinks(equivalentRecord);
}

export function mapDayRecord(
  record: CalendarDayRecord,
  requestedDate: Date,
  hasExactMatch: boolean,
): CalendarDayDto {
  const celebrationType = formatTypeLabel(record.celebration_type);
  const celebrationTitle =
    record.celebration_name ??
    `${celebrationType} del ${WEEKDAY_FORMATTER.format(requestedDate)}`;
  const liturgicalSeason = getSeason(record);
  const liturgicalColor = getColor(record);

  return {
    requestedDate: toIsoDate(requestedDate),
    sourceDate: record.reading_date,
    sourceYear: record.source_year,
    sourceNote: null,
    weekdayLabel: capitalize(LONG_DATE_FORMATTER.format(requestedDate)),
    monthLabel: capitalize(MONTH_FORMATTER.format(requestedDate)),
    dayNumber: requestedDate.getUTCDate(),
    celebrationTitle,
    celebrationType,
    rankLabel: null,
    celebrationSubtitle:
      record.week != null
        ? `${celebrationType} · Semana ${record.week}`
        : celebrationType,
    liturgicalSeason,
    liturgicalColor,
    cycle: record.cycle,
    week: record.week,
    isMarian: false,
    isArgentina: false,
    summary:
      record.celebration_name != null
        ? `${record.celebration_name} abre la jornada del ${WEEKDAY_FORMATTER.format(requestedDate)} con referencias para continuar el recorrido en el ecosistema.`
        : `La jornada se resuelve dentro de ${celebrationType.toLowerCase()} y ofrece referencias para profundizar la celebración desde otras apps del ecosistema.`,
    readings: getReadings(record),
    relatedLinks: buildRelatedLinks(record),
    hasExactMatch,
  };
}

export function mapProfileRecord(
  record: CalendarDayProfileRecord,
  requestedDate: Date,
): CalendarDayDto {
  const celebrationType = formatTypeLabel(record.celebration_type);
  const celebrationTitle =
    record.title_2026 ??
    record.celebration_name ??
    `${celebrationType} del ${WEEKDAY_FORMATTER.format(requestedDate)}`;

  return {
    requestedDate: toIsoDate(requestedDate),
    sourceDate: `${record.source_year ?? FALLBACK_DATASET_YEAR}-${record.month_day_key}`,
    sourceYear: record.source_year,
    sourceNote: record.source_note,
    weekdayLabel: capitalize(LONG_DATE_FORMATTER.format(requestedDate)),
    monthLabel: capitalize(MONTH_FORMATTER.format(requestedDate)),
    dayNumber: requestedDate.getUTCDate(),
    celebrationTitle,
    celebrationType,
    rankLabel: formatRankLabel(record.rank_slug),
    celebrationSubtitle:
      [
        formatRankLabel(record.rank_slug),
        record.week != null ? `Semana ${record.week}` : null,
      ]
        .filter(Boolean)
        .join(" · ") || celebrationType,
    liturgicalSeason: record.liturgical_season,
    liturgicalColor: record.liturgical_color,
    cycle: record.cycle,
    week: record.week,
    isMarian: record.is_marian,
    isArgentina: record.is_argentina,
    summary:
      record.celebration_name != null
        ? `${record.celebration_name} abre la jornada del ${WEEKDAY_FORMATTER.format(requestedDate)} con referencias para continuar el recorrido en el ecosistema.`
        : `La jornada se resuelve dentro de ${celebrationType.toLowerCase()} y ofrece referencias para profundizar la celebración desde otras apps del ecosistema.`,
    readings: getReadingsFromProfile(record),
    relatedLinks: buildRelatedLinksFromProfile(record),
    hasExactMatch: false,
  };
}

export function getFallbackRecordForDate(
  records: CalendarDayRecord[],
  requestedDate: Date,
) {
  const requestedIso = toIsoDate(requestedDate);
  const exactMatch = records.find(
    (record) => record.reading_date === requestedIso,
  );

  if (exactMatch) {
    return { record: exactMatch, hasExactMatch: true };
  }

  const fallback = records
    .filter((record) => {
      const sourceDate = new Date(`${record.reading_date}T00:00:00Z`);
      return (
        sourceDate.getUTCMonth() === requestedDate.getUTCMonth() &&
        sourceDate.getUTCDate() === requestedDate.getUTCDate()
      );
    })
    .sort(
      (left, right) => (right.source_year ?? 0) - (left.source_year ?? 0),
    )[0];

  return fallback ? { record: fallback, hasExactMatch: false } : null;
}

export function getMonthMatrix(
  monthDate: Date,
  selectedDate: Date,
  dataset: CalendarDayRecord[],
): CalendarMonthDto {
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth() + 1;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday =
    (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const visibleDays: Array<CalendarMonthDayDto | null> = Array.from(
    { length: firstWeekday },
    () => null,
  );

  let resolved = 0;
  let rankedDays = 0;

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const currentDate = createUtcDate(year, month, dayNumber);
    const resolvedDay = getFallbackRecordForDate(dataset, currentDate);
    const isToday = toIsoDate(currentDate) === toIsoDate(getTodayDate());
    const isSelected = toIsoDate(currentDate) === toIsoDate(selectedDate);

    if (resolvedDay) {
      resolved += 1;
    }

    if (resolvedDay?.record.celebration_type === "solemnidad") {
      rankedDays += 1;
    }

    visibleDays.push({
      isoDate: toIsoDate(currentDate),
      dayNumber,
      isToday,
      isSelected,
      isOutsideMonth: false,
      hasData: Boolean(resolvedDay),
      celebrationTitle:
        resolvedDay?.record.celebration_name ??
        formatTypeLabel(resolvedDay?.record.celebration_type ?? null),
      celebrationType: formatTypeLabel(
        resolvedDay?.record.celebration_type ?? null,
      ),
      rankLabel:
        resolvedDay?.record.celebration_type === "solemnidad"
          ? "Solemnidad"
          : null,
      liturgicalSeason: resolvedDay
        ? getSeason(resolvedDay.record)
        : "Sin datos",
      liturgicalColor: resolvedDay ? getColor(resolvedDay.record) : "verde",
      isMarian: false,
      isArgentina: false,
      href: resolvedDay ? `/?date=${toIsoDate(currentDate)}` : null,
    });
  }

  const previousMonth = new Date(Date.UTC(year, month - 2, 1));
  const nextMonth = new Date(Date.UTC(year, month, 1));

  return {
    year,
    month,
    monthLabel: capitalize(MONTH_FORMATTER.format(monthDate)),
    selectedDate: toIsoDate(selectedDate),
    selectedMonthLabel: capitalize(MONTH_FORMATTER.format(selectedDate)),
    metadataSummary: {
      rankedDays,
      marianDays: 0,
      argentinaDays: 0,
    },
    days: visibleDays,
    previousMonthHref: `/?year=${previousMonth.getUTCFullYear()}&month=${String(previousMonth.getUTCMonth() + 1).padStart(2, "0")}`,
    nextMonthHref: `/?year=${nextMonth.getUTCFullYear()}&month=${String(nextMonth.getUTCMonth() + 1).padStart(2, "0")}`,
    totalResolvedDays: resolved,
  };
}

export function getMonthMatrixFromProfiles(
  monthDate: Date,
  selectedDate: Date,
  dataset: CalendarDayRecord[],
  profiles: CalendarDayProfileRecord[],
): CalendarMonthDto {
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth() + 1;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday =
    (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const visibleDays: Array<CalendarMonthDayDto | null> = Array.from(
    { length: firstWeekday },
    () => null,
  );

  let resolved = 0;
  let rankedDays = 0;
  let marianDays = 0;
  let argentinaDays = 0;

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const currentDate = createUtcDate(year, month, dayNumber);
    const exactMatch = dataset.find(
      (record) => record.reading_date === toIsoDate(currentDate),
    );
    const profile = profiles.find(
      (record) => record.month_day_key === toMonthDayKey(currentDate),
    );
    const isToday = toIsoDate(currentDate) === toIsoDate(getTodayDate());
    const isSelected = toIsoDate(currentDate) === toIsoDate(selectedDate);
    const resolvedDay = exactMatch
      ? {
          celebrationTitle:
            exactMatch.celebration_name ??
            formatTypeLabel(exactMatch.celebration_type),
          celebrationType: formatTypeLabel(exactMatch.celebration_type),
          liturgicalSeason: getSeason(exactMatch),
          liturgicalColor: getColor(exactMatch),
        }
      : profile
        ? {
            celebrationTitle:
              profile.celebration_name ??
              formatTypeLabel(profile.celebration_type),
            celebrationType: formatTypeLabel(profile.celebration_type),
            liturgicalSeason: profile.liturgical_season,
            liturgicalColor: profile.liturgical_color,
          }
        : null;

    if (resolvedDay) {
      resolved += 1;
    }

    if (
      (exactMatch && exactMatch.celebration_type === "solemnidad") ||
      (!exactMatch && profile?.rank_slug)
    ) {
      rankedDays += 1;
    }

    if (profile?.is_marian) {
      marianDays += 1;
    }

    if (profile?.is_argentina) {
      argentinaDays += 1;
    }

    visibleDays.push({
      isoDate: toIsoDate(currentDate),
      dayNumber,
      isToday,
      isSelected,
      isOutsideMonth: false,
      hasData: Boolean(resolvedDay),
      celebrationTitle: resolvedDay?.celebrationTitle ?? "Sin datos",
      celebrationType: resolvedDay?.celebrationType ?? "Sin datos",
      rankLabel: exactMatch
        ? exactMatch.celebration_type === "solemnidad"
          ? "Solemnidad"
          : null
        : profile
          ? formatRankLabel(profile.rank_slug)
          : null,
      liturgicalSeason: resolvedDay?.liturgicalSeason ?? "Sin datos",
      liturgicalColor: resolvedDay?.liturgicalColor ?? "verde",
      isMarian: profile?.is_marian ?? false,
      isArgentina: profile?.is_argentina ?? false,
      href: resolvedDay ? `/?date=${toIsoDate(currentDate)}` : null,
    });
  }

  const previousMonth = new Date(Date.UTC(year, month - 2, 1));
  const nextMonth = new Date(Date.UTC(year, month, 1));

  return {
    year,
    month,
    monthLabel: capitalize(MONTH_FORMATTER.format(monthDate)),
    selectedDate: toIsoDate(selectedDate),
    selectedMonthLabel: capitalize(MONTH_FORMATTER.format(selectedDate)),
    metadataSummary: {
      rankedDays,
      marianDays,
      argentinaDays,
    },
    days: visibleDays,
    previousMonthHref: `/?year=${previousMonth.getUTCFullYear()}&month=${String(previousMonth.getUTCMonth() + 1).padStart(2, "0")}`,
    nextMonthHref: `/?year=${nextMonth.getUTCFullYear()}&month=${String(nextMonth.getUTCMonth() + 1).padStart(2, "0")}`,
    totalResolvedDays: resolved,
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function getDayByDate(requestedDate: Date) {
  const dataset = await getDataset();
  const exactMatch = dataset.find(
    (record) => record.reading_date === toIsoDate(requestedDate),
  );

  if (exactMatch) {
    return mapDayRecord(exactMatch, requestedDate, true);
  }

  const profiles = await getProfiles();
  const profile = profiles.find(
    (record) => record.month_day_key === toMonthDayKey(requestedDate),
  );

  if (profile) {
    return mapProfileRecord(profile, requestedDate);
  }

  const match = getFallbackRecordForDate(dataset, requestedDate);

  if (!match) {
    return null;
  }

  return mapDayRecord(match.record, requestedDate, match.hasExactMatch);
}

export async function getMonthCalendar(monthDate: Date, selectedDate: Date) {
  const [dataset, profiles] = await Promise.all([getDataset(), getProfiles()]);
  return getMonthMatrixFromProfiles(monthDate, selectedDate, dataset, profiles);
}

export async function getCalendarHealth() {
  const [dataset, profiles] = await Promise.all([getDataset(), getProfiles()]);
  const firstDate = dataset[0]?.reading_date ?? null;
  const lastDate = dataset[dataset.length - 1]?.reading_date ?? null;
  const exactToday = dataset.some(
    (record) => record.reading_date === toIsoDate(getTodayDate()),
  );
  const profileToday = profiles.some(
    (record) => record.month_day_key === toMonthDayKey(getTodayDate()),
  );

  return {
    status: "ok" as const,
    rite: RITE,
    region: REGION,
    totalDays: dataset.length,
    firstDate,
    lastDate,
    sourceYears: Array.from(
      new Set(dataset.map((record) => record.source_year).filter(Boolean)),
    ),
    fallbackDatasetYear: FALLBACK_DATASET_YEAR,
    hasExactToday: exactToday,
    hasProfileToday: profileToday,
    totalProfiles: profiles.length,
  };
}
