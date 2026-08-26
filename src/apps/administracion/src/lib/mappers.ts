export const WEEKDAY_INDEXES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_LABELS: Record<WeekdayIndex, string> = {
  0: "Lunes",
  1: "Martes",
  2: "Miércoles",
  3: "Jueves",
  4: "Viernes",
  5: "Sábado",
  6: "Domingo",
};

export function weekdayIndexToDb(index: number): string {
  return WEEKDAY_INDEXES[index];
}

export function weekdayDbToIndex(weekday: string): number {
  const index = WEEKDAY_INDEXES.indexOf(
    weekday as (typeof WEEKDAY_INDEXES)[number],
  );
  return index === -1 ? 0 : index;
}

export const CELEBRATION_TYPES = [
  "misa",
  "adoracion",
  "confesion",
  "rosario",
  "liturgia",
] as const;

export type CelebrationType = (typeof CELEBRATION_TYPES)[number];

export const CELEBRATION_TYPE_LABELS: Record<CelebrationType, string> = {
  misa: "Misa",
  adoracion: "Adoración",
  confesion: "Confesión",
  rosario: "Rosario",
  liturgia: "Liturgia",
};

const TEMPLE_STATUSES = ["updated", "review", "stale"] as const;
export type TempleStatus = (typeof TEMPLE_STATUSES)[number];

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildTempleSlug(name: string, city: string): string {
  return slugify(`${name}-${city}`).slice(0, 80);
}
