export type LiturgicalColor = "verde" | "blanco" | "morado" | "rojo" | "rosa";

export type LiturgicalRank =
  | "solemnidad"
  | "fiesta"
  | "memoria_obligatoria"
  | "memoria_facultativa"
  | "conmemoracion"
  | "feria";

export type CalendarReadingLabel =
  | "Primera lectura"
  | "Salmo"
  | "Segunda lectura"
  | "Evangelio";

export type CalendarReading = {
  label: CalendarReadingLabel;
  reference: string;
};

export type RelatedLink = {
  label: string;
  href: string;
  description: string;
};

export type CalendarDayDto = {
  requestedDate: string;
  sourceDate: string;
  sourceYear: number | null;
  sourceNote: string | null;
  weekdayLabel: string;
  monthLabel: string;
  dayNumber: number;
  celebrationTitle: string;
  celebrationType: string;
  rankLabel: string | null;
  celebrationSubtitle: string;
  liturgicalSeason: string;
  liturgicalColor: LiturgicalColor;
  cycle: string | null;
  week: number | null;
  isMarian: boolean;
  isArgentina: boolean;
  summary: string;
  readings: CalendarReading[];
  relatedLinks: RelatedLink[];
  hasExactMatch: boolean;
};

export type CalendarMonthDayDto = {
  isoDate: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  isOutsideMonth: boolean;
  hasData: boolean;
  celebrationTitle: string;
  celebrationType: string;
  rankLabel: string | null;
  liturgicalSeason: string;
  liturgicalColor: LiturgicalColor;
  isMarian: boolean;
  isArgentina: boolean;
  href: string | null;
};

export type CalendarMonthDto = {
  year: number;
  month: number;
  monthLabel: string;
  selectedDate: string;
  selectedMonthLabel: string;
  metadataSummary: {
    rankedDays: number;
    marianDays: number;
    argentinaDays: number;
  };
  days: Array<CalendarMonthDayDto | null>;
  previousMonthHref: string;
  nextMonthHref: string;
  totalResolvedDays: number;
};

export type CalendarDayRecord = {
  id: number;
  reading_date: string;
  rite: string;
  region_code: string;
  celebration_type: string | null;
  celebration_name: string | null;
  cycle: string | null;
  week: number | null;
  first_reading_ref: string | null;
  psalm_ref: string | null;
  second_reading_ref: string | null;
  gospel_ref: string | null;
  source_year: number | null;
};

export type CalendarDayProfileRecord = {
  id: number;
  month_day_key: string;
  rite: string;
  region_code: string;
  celebration_type: string | null;
  celebration_name: string | null;
  liturgical_season: string;
  liturgical_color: LiturgicalColor;
  cycle: string | null;
  week: number | null;
  first_reading_ref: string | null;
  psalm_ref: string | null;
  second_reading_ref: string | null;
  gospel_ref: string | null;
  source_year: number | null;
  is_approximate: boolean;
  rank_slug: LiturgicalRank | null;
  is_marian: boolean;
  is_argentina: boolean;
  source_note: string | null;
  title_2026: string | null;
};
