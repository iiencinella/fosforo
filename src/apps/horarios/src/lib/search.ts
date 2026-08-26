import { z } from "zod";
import type {
  CelebrationListItem,
  CelebrationRecord,
  CelebrationType,
  SearchDataSource,
  SearchParams,
  SearchResponse,
  TempleDetailResponse,
  TimeRange,
  Weekday,
} from "@/types/horarios";

const celebrationTypeSchema = z.enum([
  "misa",
  "adoracion",
  "confesion",
  "rosario",
  "liturgia",
]);

const rangeSchema = z.enum(["morning", "afternoon", "evening"]);
const sortSchema = z.enum(["relevance", "nearby", "soonest"]);
const pageSchema = z.coerce.number().int().min(1).catch(1);
const pageSizeSchema = z.coerce.number().int().min(1).max(40).catch(12);
const lngSchema = z.coerce.number().min(-180).max(180);
const latSchema = z.coerce.number().min(-90).max(90);

export const searchQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  city: z.string().trim().max(60).optional(),
  type: celebrationTypeSchema.optional(),
  range: rangeSchema.optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  sort: sortSchema.optional(),
  lat: latSchema.optional(),
  lng: lngSchema.optional(),
  page: pageSchema.optional(),
  pageSize: pageSizeSchema.optional(),
});

export const searchEventSchema = z.object({
  sessionId: z.string().trim().min(6).max(120),
  query: z.string().trim().max(120),
  filters: z
    .object({
      city: z.string().trim().max(60).optional(),
      type: celebrationTypeSchema.optional(),
      range: rangeSchema.optional(),
      sort: sortSchema,
    })
    .strict(),
  resultsCount: z.coerce.number().int().min(0).max(2000),
});

const weekdayOrder: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const dayLabel: Record<Weekday, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miercoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sabado",
  sunday: "Domingo",
};

const celebrationLabel: Record<CelebrationType, string> = {
  misa: "Misa",
  adoracion: "Adoracion",
  confesion: "Confesion",
  rosario: "Rosario",
  liturgia: "Liturgia",
};

export function getDayLabel(value: Weekday): string {
  return dayLabel[value];
}

export function getCelebrationTypeLabel(value: CelebrationType): string {
  return celebrationLabel[value];
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inRange(time: string, range?: TimeRange): boolean {
  if (!range) return true;
  const [rawHour] = time.split(":");
  const hour = Number.parseInt(rawHour ?? "0", 10);
  if (range === "morning") return hour < 12;
  if (range === "afternoon") return hour >= 12 && hour < 18;
  return hour >= 18;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return r * c;
}

function nextCelebration(
  celebrations: CelebrationRecord[],
): CelebrationRecord | undefined {
  return [...celebrations].sort((a, b) => {
    const weekCmp =
      weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday);
    if (weekCmp !== 0) return weekCmp;
    return a.startTime.localeCompare(b.startTime);
  })[0];
}

export function parseSearchParams(searchParams: URLSearchParams): SearchParams {
  const parsed = searchQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    range: searchParams.get("range") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    lat: searchParams.get("lat") ?? undefined,
    lng: searchParams.get("lng") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  return {
    q: parsed.q,
    city: parsed.city,
    type: parsed.type,
    range: parsed.range,
    date: parsed.date,
    sort: parsed.sort ?? "relevance",
    lat: parsed.lat,
    lng: parsed.lng,
    page: parsed.page ?? 1,
    pageSize: parsed.pageSize ?? 12,
  };
}

export function searchCelebrationsFromSource(
  source: SearchDataSource,
  params: SearchParams,
): SearchResponse {
  const sort = params.sort ?? "relevance";
  const q = normalizeText(params.q ?? "");
  const city = normalizeText(params.city ?? "");

  const candidateTemples = source.temples.filter((temple) => {
    const normalizedName = normalizeText(temple.name);
    const normalizedCity = normalizeText(temple.city);
    const normalizedAddress = normalizeText(temple.address);

    const byQuery =
      q.length === 0 ||
      normalizedName.includes(q) ||
      normalizedCity.includes(q) ||
      normalizedAddress.includes(q);

    const byCity = city.length === 0 || normalizedCity.includes(city);

    return byQuery && byCity;
  });

  const items = candidateTemples
    .map((temple) => {
      const celebrations = source.celebrations
        .filter((entry) => entry.templeId === temple.id)
        .filter((entry) => (params.type ? entry.type === params.type : true))
        .filter((entry) => inRange(entry.startTime, params.range));

      if (celebrations.length === 0) {
        return null;
      }

      const next = nextCelebration(celebrations);
      if (!next) {
        return null;
      }

      const distanceKm =
        typeof params.lat === "number" && typeof params.lng === "number"
          ? haversineKm(params.lat, params.lng, temple.lat, temple.lng)
          : undefined;

      const result: CelebrationListItem = {
        templeId: temple.id,
        templeName: temple.name,
        city: temple.city,
        address: temple.address,
        status: temple.status,
        nextCelebration: {
          type: next.type,
          weekday: next.weekday,
          startTime: next.startTime,
        },
        matchingCelebrations: celebrations.length,
        distanceKm,
      };

      return result;
    })
    .filter((item): item is CelebrationListItem => item !== null);

  const sorted = [...items].sort((a, b) => {
    if (sort === "nearby") {
      const aDistance = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const bDistance = b.distanceKm ?? Number.POSITIVE_INFINITY;
      return aDistance - bDistance;
    }

    if (sort === "soonest") {
      const aKey = `${weekdayOrder.indexOf(a.nextCelebration.weekday)}-${a.nextCelebration.startTime}`;
      const bKey = `${weekdayOrder.indexOf(b.nextCelebration.weekday)}-${b.nextCelebration.startTime}`;
      return aKey.localeCompare(bKey);
    }

    if (b.matchingCelebrations !== a.matchingCelebrations) {
      return b.matchingCelebrations - a.matchingCelebrations;
    }

    return a.templeName.localeCompare(b.templeName);
  });

  const start = (params.page - 1) * params.pageSize;
  const paginated = sorted.slice(start, start + params.pageSize);

  return {
    items: paginated,
    total: sorted.length,
    page: params.page,
    pageSize: params.pageSize,
    hasNextPage: start + params.pageSize < sorted.length,
    filtersApplied: {
      q: params.q,
      city: params.city,
      type: params.type,
      range: params.range,
      date: params.date,
      sort,
    },
  };
}

export function getTempleDetailFromSource(
  source: SearchDataSource,
  templeId: string,
): TempleDetailResponse | null {
  const temple = source.temples.find((item) => item.id === templeId);
  if (!temple) {
    return null;
  }

  const schedule = source.celebrations
    .filter((entry) => entry.templeId === templeId)
    .sort((a, b) => {
      const weekCmp =
        weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday);
      if (weekCmp !== 0) return weekCmp;
      return a.startTime.localeCompare(b.startTime);
    });

  return {
    temple,
    schedule,
    liturgicalLinks: [
      {
        label: "Ver santoral",
        href: "https://www.horariosdemisas.com.ar/santoral",
      },
      {
        label: "Ir al evangelio del dia",
        href: "https://www.horariosdemisas.com.ar/evangelio-del-dia",
      },
    ],
  };
}
