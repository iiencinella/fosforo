export type CelebrationType =
  | "misa"
  | "adoracion"
  | "confesion"
  | "rosario"
  | "liturgia";

export type UpdateStatus = "updated" | "review" | "stale";

export type SearchSort = "relevance" | "nearby" | "soonest";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type TimeRange = "morning" | "afternoon" | "evening";

export type TempleRecord = {
  id: string;
  name: string;
  city: string;
  province: string;
  address: string;
  lat: number;
  lng: number;
  status: UpdateStatus;
  contactPhone?: string;
  contactWhatsApp?: string;
  notes?: string;
};

export type CelebrationRecord = {
  id: string;
  templeId: string;
  type: CelebrationType;
  weekday: Weekday;
  startTime: string;
  durationMin: number;
  notes?: string;
};

export type LiturgicalLink = {
  label: string;
  href: string;
};

export type SearchParams = {
  q?: string;
  city?: string;
  type?: CelebrationType;
  range?: TimeRange;
  date?: string;
  sort?: SearchSort;
  lat?: number;
  lng?: number;
  page: number;
  pageSize: number;
};

export type CelebrationListItem = {
  templeId: string;
  templeName: string;
  city: string;
  address: string;
  status: UpdateStatus;
  nextCelebration: {
    type: CelebrationType;
    weekday: Weekday;
    startTime: string;
  };
  matchingCelebrations: number;
  distanceKm?: number;
};

export type SearchResponse = {
  items: CelebrationListItem[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  filtersApplied: {
    q?: string;
    city?: string;
    type?: CelebrationType;
    range?: TimeRange;
    date?: string;
    sort: SearchSort;
  };
};

export type TempleDetailResponse = {
  temple: TempleRecord;
  schedule: CelebrationRecord[];
  liturgicalLinks: LiturgicalLink[];
};

export type SearchEventPayload = {
  sessionId: string;
  query: string;
  filters: {
    city?: string;
    type?: CelebrationType;
    range?: TimeRange;
    sort: SearchSort;
  };
  resultsCount: number;
};

export type SearchDataSource = {
  temples: TempleRecord[];
  celebrations: CelebrationRecord[];
};

export type RepositoryHealth = {
  source: "database" | "fallback";
  templeCount: number;
  celebrationCount: number;
  searchEventCount: number;
};
