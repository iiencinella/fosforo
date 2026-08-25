import {
  type ChangeEvent,
  type SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CardCarousel, CarouselCard } from "./carousel.js";
import { useHideHydrationSkeleton } from "./hydration-skeleton.js";
import { Modal } from "./modal.js";
import type {
  PortalBibleBookOption,
  PortalBibleVersionOption,
} from "./portal-bible-reader.js";
import { ShareButton } from "./share-button.js";

export type BibleHubMode = "lectura" | "busqueda" | "liturgia";

type ReadApiVerse = {
  versionCode: string;
  bookSlug: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
};

type ReadApiResponse = {
  success: boolean;
  code?: string;
  message?: string;
  verses?: ReadApiVerse[];
};

type SearchResult = {
  versionCode: string;
  bookSlug: string;
  bookName: string;
  chapter: number;
  verse: number;
  reference: string;
  text: string;
  rank: number;
};

type SearchApiResponse = {
  success: boolean;
  code?: string;
  message?: string;
  normalizedReference?: string;
  total?: number;
  results?: SearchResult[];
};

type LiturgyReading = {
  fecha: string;
  tipo: string | null;
  nombre: string | null;
  ciclo: string | null;
  semana: number | null;
  primera: string | null;
  salmo: string | null;
  segunda: string | null;
  evangelio: string | null;
};

type LiturgyApiResponse = {
  success: boolean;
  code?: string;
  message?: string;
  reading?: LiturgyReading;
};

type LiturgySlotKey = "primera" | "salmo" | "segunda" | "evangelio";

const LITURGY_SLOTS: Array<{ key: LiturgySlotKey; label: string }> = [
  { key: "primera", label: "Primera lectura" },
  { key: "salmo", label: "Salmo responsorial" },
  { key: "segunda", label: "Segunda lectura" },
  { key: "evangelio", label: "Evangelio" },
];

const MODE_CARDS: Array<{
  mode: BibleHubMode;
  title: string;
  description: string;
}> = [
  {
    mode: "lectura",
    title: "Lectura",
    description:
      "Elige libro y capítulo; el pasaje se abre en un modal sin salir de la vista.",
  },
  {
    mode: "busqueda",
    title: "Búsqueda",
    description:
      "Busca por palabra o referencia y abre los resultados en modal.",
  },
  {
    mode: "liturgia",
    title: "Liturgia",
    description:
      "Lecturas del día del Rito Romano (AR), con el texto de cada una en modal.",
  },
];

const SEARCH_PAGE_SIZE = 5;

export type PortalBibleHubProps = {
  books: PortalBibleBookOption[];
  versions?: PortalBibleVersionOption[];
  defaultMode?: BibleHubMode;
  defaultBookSlug: string;
  defaultChapter: number;
  defaultVersionCode: string;
  defaultQuery?: string;
  defaultDate: string;
};

export function PortalBibleHub({
  books,
  versions = [],
  defaultMode = "lectura",
  defaultBookSlug,
  defaultChapter,
  defaultVersionCode,
  defaultQuery = "",
  defaultDate,
}: PortalBibleHubProps) {
  const rootRef = useHideHydrationSkeleton<HTMLElement>();
  const [mode, setMode] = useState<BibleHubMode>(defaultMode);

  const [versionCode, setVersionCode] = useState(defaultVersionCode);
  const [bookSlug, setBookSlug] = useState(defaultBookSlug);
  const [chapter, setChapter] = useState(defaultChapter);
  const [verses, setVerses] = useState<ReadApiVerse[]>([]);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState("");
  const [chapterModalOpen, setChapterModalOpen] = useState(false);

  const [query, setQuery] = useState(defaultQuery);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [normalizedReference, setNormalizedReference] = useState("");
  const [searchResultsModalOpen, setSearchResultsModalOpen] = useState(
    defaultQuery.trim().length >= 2,
  );

  const [date, setDate] = useState(defaultDate);
  const [liturgyLoading, setLiturgyLoading] = useState(false);
  const [liturgyError, setLiturgyError] = useState("");
  const [reading, setReading] = useState<LiturgyReading | null>(null);

  const [activeSlot, setActiveSlot] = useState<LiturgySlotKey | null>(null);
  const [slotReference, setSlotReference] = useState("");
  const [slotVerses, setSlotVerses] = useState<SearchResult[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState("");

  const selectedBook = useMemo(() => {
    return (
      books.find((book) => book.slug === bookSlug) ??
      books[0] ?? { slug: "genesis", name: "Genesis", chapters: 1 }
    );
  }, [books, bookSlug]);

  const activeVersionName = useMemo(() => {
    return (
      versions.find((version) => version.code === versionCode)?.name ??
      versionCode
    );
  }, [versions, versionCode]);

  const canGoPreviousChapter = chapter > 1;
  const canGoNextChapter = chapter < selectedBook.chapters;

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function buildSharePageUrl(reference: string): string {
    return `${origin}/compartir?ref=${encodeURIComponent(reference)}&version=${encodeURIComponent(versionCode)}`;
  }

  const totalPages = Math.max(1, Math.ceil(results.length / SEARCH_PAGE_SIZE));
  const pagedResults = results.slice(
    (page - 1) * SEARCH_PAGE_SIZE,
    page * SEARCH_PAGE_SIZE,
  );

  const isReferenceResult = useMemo(() => {
    return Boolean(normalizedReference) && results.length > 0;
  }, [normalizedReference, results]);

  const availableSlots = useMemo(() => {
    if (!reading) return [];
    return LITURGY_SLOTS.filter((slot) => Boolean(reading[slot.key]));
  }, [reading]);

  const activeSlotLabel = useMemo(() => {
    return LITURGY_SLOTS.find((slot) => slot.key === activeSlot)?.label ?? "";
  }, [activeSlot]);

  useEffect(() => {
    let isMounted = true;

    async function loadChapter() {
      setChapterLoading(true);
      setChapterError("");

      try {
        const response = await fetch(
          `/api/bible/read?book=${encodeURIComponent(bookSlug)}&chapter=${chapter}&version=${encodeURIComponent(versionCode)}`,
        );
        const data = (await response.json()) as ReadApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.message || "No se pudo cargar el capitulo.");
        }

        if (isMounted) {
          setVerses(data.verses ?? []);
        }
      } catch (loadError) {
        if (isMounted) {
          setChapterError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo consultar el contenido.",
          );
          setVerses([]);
        }
      } finally {
        if (isMounted) {
          setChapterLoading(false);
        }
      }
    }

    loadChapter();
    return () => {
      isMounted = false;
    };
  }, [bookSlug, chapter, versionCode]);

  const runSearchRef = useRef(runSearch);
  useEffect(() => {
    runSearchRef.current = runSearch;
  });

  useEffect(() => {
    const initialQuery = defaultQuery.trim();
    if (initialQuery.length >= 2) {
      void runSearchRef.current(initialQuery);
    }
  }, [defaultQuery]);

  useEffect(() => {
    let isMounted = true;

    async function loadLiturgy() {
      setLiturgyLoading(true);
      setLiturgyError("");
      setReading(null);

      try {
        const response = await fetch(
          `/api/liturgy/daily?date=${encodeURIComponent(date)}&rite=roman&region=AR`,
        );
        const data = (await response.json()) as LiturgyApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "No hay lecturas para la fecha seleccionada.",
          );
        }

        if (isMounted) {
          setReading(data.reading ?? null);
        }
      } catch (loadError) {
        if (isMounted) {
          setLiturgyError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo conectar con la API.",
          );
        }
      } finally {
        if (isMounted) {
          setLiturgyLoading(false);
        }
      }
    }

    loadLiturgy();
    return () => {
      isMounted = false;
    };
  }, [date]);

  useEffect(() => {
    const nextUrl = new URL(window.location.href);
    nextUrl.search = "";
    nextUrl.searchParams.set("modo", mode);

    if (mode === "lectura") {
      nextUrl.searchParams.set("version", versionCode);
      nextUrl.searchParams.set("book", bookSlug);
      nextUrl.searchParams.set("chapter", String(chapter));
    } else if (mode === "busqueda") {
      if (query.trim().length >= 2) {
        nextUrl.searchParams.set("q", query.trim());
      }
      nextUrl.searchParams.set("version", versionCode);
    } else {
      nextUrl.searchParams.set("date", date);
    }

    window.history.replaceState(
      {},
      "",
      `${nextUrl.pathname}?${nextUrl.searchParams.toString()}${nextUrl.hash}`,
    );
  }, [mode, versionCode, bookSlug, chapter, query, date]);

  function handleBookChange(nextBookSlug: string) {
    setBookSlug(nextBookSlug);
    setChapter(1);
  }

  function goPreviousChapter() {
    setChapter((current) => Math.max(1, current - 1));
  }

  function goNextChapter() {
    setChapter((current) => Math.min(selectedBook.chapters, current + 1));
  }

  async function runSearch(rawQuery: string) {
    const normalized = rawQuery.trim();

    setSearchLoading(true);
    setSearchError("");
    setResults([]);
    setTotal(0);
    setPage(1);
    setNormalizedReference("");

    try {
      const response = await fetch(
        `/api/bible/search?query=${encodeURIComponent(normalized)}&version=${encodeURIComponent(versionCode)}`,
      );
      const data = (await response.json()) as SearchApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "No se pudo completar la busqueda.");
      }

      const nextResults = data.results ?? [];
      setResults(nextResults);
      setTotal(data.total ?? 0);
      setNormalizedReference(data.normalizedReference ?? "");
    } catch (searchError) {
      setSearchError(
        searchError instanceof Error
          ? searchError.message
          : "No se pudo conectar con la API.",
      );
    } finally {
      setSearchLoading(false);
    }
  }

  function handleSearchSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchError("Ingresa al menos 2 caracteres para buscar.");
      return;
    }
    setSearchResultsModalOpen(true);
    void runSearch(trimmed);
  }

  function openResultInReader(item: SearchResult) {
    setBookSlug(item.bookSlug);
    setChapter(item.chapter);
    setMode("lectura");
    setChapterModalOpen(true);
  }

  async function openLiturgySlot(slotKey: LiturgySlotKey) {
    if (!reading) return;
    const reference = reading[slotKey];
    if (!reference) return;

    setActiveSlot(slotKey);
    setSlotReference(reference);
    setSlotVerses([]);
    setSlotError("");
    setSlotLoading(true);

    try {
      const response = await fetch(
        `/api/bible/search?query=${encodeURIComponent(reference)}&version=${encodeURIComponent(versionCode)}`,
      );
      const data = (await response.json()) as SearchApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "No se pudo cargar el texto.");
      }

      if (!data.normalizedReference || (data.results ?? []).length === 0) {
        setSlotError("Texto no disponible para esta referencia.");
        setSlotVerses([]);
      } else {
        setSlotVerses(data.results ?? []);
      }
    } catch (loadError) {
      setSlotError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo conectar con la API.",
      );
    } finally {
      setSlotLoading(false);
    }
  }

  function openSlotInReader() {
    const first = slotVerses[0];
    if (!first) return;
    setBookSlug(first.bookSlug);
    setChapter(first.chapter);
    setMode("lectura");
    setActiveSlot(null);
    setChapterModalOpen(true);
  }

  return (
    <section className="bible-hub" ref={rootRef}>
      <CardCarousel label="Modos de Biblia" className="bible-hub-modes">
        {MODE_CARDS.map((card) => (
          <CarouselCard
            key={card.mode}
            size="lg"
            badge="Modo"
            title={card.title}
            description={card.description}
            selected={mode === card.mode}
            onSelect={() => setMode(card.mode)}
          />
        ))}
      </CardCarousel>

      <div className="bible-hub-panel">
        {mode === "lectura" ? (
          <article className="card bible-hub-panel-card">
            <header className="bible-hub-panel-header">
              <h2 className="card-title">Lectura por referencia</h2>
              <p className="app-desc">Version activa: {activeVersionName}.</p>
            </header>

            <div className="bible-hub-controls">
              {versions.length > 0 ? (
                <label className="form-row" htmlFor="hub-version-select">
                  <span>Version</span>
                  <select
                    id="hub-version-select"
                    value={versionCode}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      setVersionCode(event.target.value)
                    }
                  >
                    {versions.map((version) => (
                      <option key={version.code} value={version.code}>
                        {version.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="form-row" htmlFor="hub-book-select">
                <span>Libro</span>
                <select
                  id="hub-book-select"
                  value={bookSlug}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    handleBookChange(event.target.value)
                  }
                >
                  {books.map((book) => (
                    <option key={book.slug} value={book.slug}>
                      {book.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-row" htmlFor="hub-chapter-select">
                <span>Capitulo</span>
                <select
                  id="hub-chapter-select"
                  value={chapter}
                  onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                    setChapter(Number.parseInt(event.target.value, 10))
                  }
                >
                  {Array.from(
                    { length: selectedBook.chapters },
                    (_, index) => index + 1,
                  ).map((chapterNumber) => (
                    <option key={chapterNumber} value={chapterNumber}>
                      {chapterNumber}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="hero-actions bible-hub-reader-actions">
              <button
                className="button secondary"
                type="button"
                disabled={!canGoPreviousChapter || chapterLoading}
                onClick={goPreviousChapter}
              >
                Anterior
              </button>
              <button
                className="button"
                type="button"
                disabled={chapterLoading}
                onClick={() => setChapterModalOpen(true)}
              >
                {chapterLoading
                  ? "Cargando..."
                  : `Leer ${selectedBook.name} ${chapter}`}
              </button>
              <button
                className="button secondary"
                type="button"
                disabled={!canGoNextChapter || chapterLoading}
                onClick={goNextChapter}
              >
                Siguiente
              </button>
              <ShareButton
                url={buildSharePageUrl(`${selectedBook.name} ${chapter}`)}
                title={`${selectedBook.name} ${chapter}`}
                text={
                  verses.length > 0
                    ? verses
                        .slice(0, 2)
                        .map((verse) => verse.text)
                        .join(" ")
                    : `Lee ${selectedBook.name} ${chapter} en Biblia Fosforo`
                }
              />
            </div>

            {chapterError && !chapterModalOpen ? (
              <p className="form-status error">{chapterError}</p>
            ) : null}
          </article>
        ) : null}

        {mode === "busqueda" ? (
          <article className="card bible-hub-panel-card">
            <header className="bible-hub-panel-header">
              <h2 className="card-title">Busqueda biblica</h2>
              <p className="app-desc">Version activa: {activeVersionName}.</p>
            </header>

            <form
              className="bible-hub-search-form"
              onSubmit={handleSearchSubmit}
            >
              <label className="form-row" htmlFor="hub-search-query">
                <span>Palabra o referencia</span>
                <input
                  id="hub-search-query"
                  value={query}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Ejemplo: amor, misericordia, Juan 3"
                />
              </label>
              <button className="button" type="submit" disabled={searchLoading}>
                {searchLoading ? "Buscando..." : "Buscar"}
              </button>
            </form>

            {searchError && !searchResultsModalOpen ? (
              <p className="form-status error">{searchError}</p>
            ) : null}
          </article>
        ) : null}

        {mode === "liturgia" ? (
          <article className="card bible-hub-panel-card">
            <header className="bible-hub-panel-header">
              <h2 className="card-title">Lecturas del dia</h2>
              <p className="app-desc">
                Rito Romano · region AR. El texto de cada lectura se abre en
                modal.
              </p>
            </header>

            <div className="bible-hub-liturgy-date">
              <label className="form-row" htmlFor="hub-liturgy-date">
                <span>Fecha liturgica</span>
                <input
                  id="hub-liturgy-date"
                  type="date"
                  value={date}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setDate(event.target.value)
                  }
                  required
                />
              </label>
              <button
                className="button secondary"
                type="button"
                onClick={() => setDate(defaultDate)}
              >
                Hoy
              </button>
            </div>

            {liturgyLoading ? (
              <div
                className="portal-bible-skeleton"
                aria-busy="true"
                aria-label="Cargando lecturas"
              >
                <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
                <div className="skeleton-bar skeleton-bar--sm skeleton-pulse" />
                <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
              </div>
            ) : null}

            {liturgyError ? (
              <p className="form-status error">{liturgyError}</p>
            ) : null}

            {!liturgyLoading && !liturgyError && reading ? (
              <div className="bible-hub-liturgy-day">
                <p className="app-desc">
                  <strong>{reading.fecha}</strong>
                  {" · "}
                  {reading.nombre ?? reading.tipo ?? "Celebracion liturgica"}
                  {reading.ciclo ? ` · Ciclo ${reading.ciclo}` : ""}
                  {typeof reading.semana === "number"
                    ? ` · Semana ${reading.semana}`
                    : ""}
                </p>

                <CardCarousel
                  label="Lecturas del dia"
                  className="bible-hub-liturgy-carousel"
                >
                  {availableSlots.map((slot) => (
                    <CarouselCard
                      key={slot.key}
                      badge="Lectura"
                      title={slot.label}
                      description={reading[slot.key] ?? ""}
                      onSelect={() => void openLiturgySlot(slot.key)}
                    />
                  ))}
                </CardCarousel>
              </div>
            ) : null}
          </article>
        ) : null}
      </div>

      <footer className="bible-hub-status">
        <span className="pill">Version {versionCode}</span>
        <span className="pill">
          {selectedBook.name} {chapter}
        </span>
        <span className="pill">{books.length} libros</span>
        <a className="bible-hub-status-link" href="/estado">
          Estado operativo
        </a>
      </footer>

      <Modal
        open={chapterModalOpen}
        onClose={() => setChapterModalOpen(false)}
        title={`${selectedBook.name} ${chapter}`}
        description={activeVersionName}
        footer={
          <div className="hero-actions bible-hub-modal-nav">
            <button
              className="button secondary"
              type="button"
              disabled={!canGoPreviousChapter || chapterLoading}
              onClick={goPreviousChapter}
            >
              Capitulo anterior
            </button>
            <span className="app-desc">
              Capitulo {chapter} de {selectedBook.chapters}
            </span>
            <ShareButton
              url={buildSharePageUrl(`${selectedBook.name} ${chapter}`)}
              title={`${selectedBook.name} ${chapter}`}
              text={
                verses.length > 0
                  ? verses
                      .slice(0, 2)
                      .map((verse) => verse.text)
                      .join(" ")
                  : `Lee ${selectedBook.name} ${chapter} en Biblia Fosforo`
              }
            />
            <button
              className="button secondary"
              type="button"
              disabled={!canGoNextChapter || chapterLoading}
              onClick={goNextChapter}
            >
              Capitulo siguiente
            </button>
          </div>
        }
      >
        {chapterLoading ? (
          <div
            className="portal-bible-skeleton"
            aria-busy="true"
            aria-label="Cargando capitulo"
          >
            <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
            <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
            <div className="skeleton-bar skeleton-bar--sm skeleton-pulse" />
          </div>
        ) : null}

        {chapterError ? (
          <p className="form-status error">{chapterError}</p>
        ) : null}

        {!chapterLoading && !chapterError && verses.length === 0 ? (
          <p className="form-status pending">
            No hay versiculos para este capitulo.
          </p>
        ) : null}

        {!chapterLoading && !chapterError && verses.length > 0 ? (
          <div className="bible-hub-modal-verses" aria-live="polite">
            {verses.map((verse) => (
              <p
                key={`${verse.bookSlug}-${verse.chapter}-${verse.verse}`}
                id={`v-${verse.verse}`}
              >
                <strong>{verse.verse}</strong> {verse.text}
              </p>
            ))}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={searchResultsModalOpen}
        onClose={() => setSearchResultsModalOpen(false)}
        title={
          isReferenceResult ? normalizedReference : "Resultados de busqueda"
        }
        description={`${total} coincidencia${total === 1 ? "" : "s"}${
          !isReferenceResult && normalizedReference
            ? ` · Referencia interpretada: ${normalizedReference}`
            : ""
        }`}
        footer={
          results.length > 0 ? (
            <div className="hero-actions bible-hub-modal-nav">
              {!isReferenceResult ? (
                <div className="hero-actions portal-bible-pagination">
                  <button
                    className="button secondary"
                    type="button"
                    disabled={page <= 1 || searchLoading}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                  >
                    Anterior
                  </button>
                  <span className="app-desc">
                    Pagina {page} de {totalPages}
                  </span>
                  <button
                    className="button secondary"
                    type="button"
                    disabled={page >= totalPages || searchLoading}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                  >
                    Siguiente
                  </button>
                </div>
              ) : null}
              <button
                className="button"
                type="button"
                onClick={() => {
                  setSearchResultsModalOpen(false);
                  const first = results[0];
                  if (first) openResultInReader(first);
                }}
              >
                Abrir capitulo completo en lectura
              </button>
              {isReferenceResult && normalizedReference ? (
                <ShareButton
                  url={buildSharePageUrl(normalizedReference)}
                  title={normalizedReference}
                  text={results.map((r) => r.text).join(" ")}
                />
              ) : null}
            </div>
          ) : undefined
        }
      >
        <div className="bible-hub-search-results" aria-live="polite">
          {searchLoading ? (
            <div
              className="portal-bible-skeleton"
              aria-busy="true"
              aria-label="Buscando pasajes"
            >
              <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
              <div className="skeleton-bar skeleton-bar--sm skeleton-pulse" />
              <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
            </div>
          ) : null}

          {searchError ? (
            <p className="form-status error">{searchError}</p>
          ) : null}

          {!searchLoading && !searchError && results.length === 0 ? (
            <p className="form-status pending">
              No hay coincidencias para esta consulta.
            </p>
          ) : null}

          {!searchLoading && !searchError && results.length > 0 ? (
            <div className="bible-hub-modal-verses bible-hub-modal-verses--search">
              {isReferenceResult ? (
                <p>
                  {results.map((item) => (
                    <span
                      key={`${item.bookSlug}-${item.chapter}-${item.verse}`}
                    >
                      <strong>{item.verse}</strong> {item.text}{" "}
                    </span>
                  ))}
                </p>
              ) : (
                pagedResults.map((item) => (
                  <div
                    className="bible-hub-result-item"
                    key={`${item.bookSlug}-${item.chapter}-${item.verse}`}
                  >
                    <button
                      type="button"
                      className="bible-hub-result-verse"
                      onClick={() => {
                        setSearchResultsModalOpen(false);
                        openResultInReader(item);
                      }}
                    >
                      <strong>{item.reference}</strong> {item.text}
                    </button>
                    <ShareButton
                      className="bible-hub-result-share"
                      url={buildSharePageUrl(item.reference)}
                      title={item.reference}
                      text={item.text}
                    />
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        title={activeSlotLabel}
        description={`${slotReference}${reading ? ` · ${reading.nombre ?? reading.tipo ?? reading.fecha}` : ""}`}
        footer={
          slotVerses.length > 0 ? (
            <div className="hero-actions">
              <button
                className="button"
                type="button"
                onClick={openSlotInReader}
              >
                Abrir en modo lectura
              </button>
              {slotReference ? (
                <ShareButton
                  url={`${origin}/compartir?ref=${encodeURIComponent(slotReference)}&date=${encodeURIComponent(reading?.fecha ?? date)}&version=${encodeURIComponent(versionCode)}`}
                  title={slotReference}
                  text={slotVerses.map((v) => v.text).join(" ")}
                />
              ) : null}
            </div>
          ) : undefined
        }
      >
        {slotLoading ? (
          <div
            className="portal-bible-skeleton"
            aria-busy="true"
            aria-label="Cargando texto de la lectura"
          >
            <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
            <div className="skeleton-bar skeleton-bar--sm skeleton-pulse" />
            <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
          </div>
        ) : null}

        {slotError ? <p className="form-status error">{slotError}</p> : null}

        {!slotLoading && !slotError && slotVerses.length > 0 ? (
          <div
            className="bible-hub-modal-verses bible-hub-modal-verses--search"
            aria-live="polite"
          >
            <p>
              {slotVerses.map((item) => (
                <span key={`${item.bookSlug}-${item.chapter}-${item.verse}`}>
                  <strong>{item.verse}</strong> {item.text}{" "}
                </span>
              ))}
            </p>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
