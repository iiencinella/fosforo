import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useHideHydrationSkeleton } from "./hydration-skeleton.js";

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
  version?: string;
  book?: string;
  chapter?: number;
  verses?: ReadApiVerse[];
};

export type PortalBibleBookOption = {
  slug: string;
  name: string;
  chapters: number;
};

export type PortalBibleVersionOption = {
  code: string;
  name: string;
};

type PortalBibleReaderProps = {
  books: PortalBibleBookOption[];
  versions?: PortalBibleVersionOption[];
  defaultBookSlug: string;
  defaultChapter: number;
  defaultVersionCode: string;
};

export function PortalBibleReader({
  books,
  versions = [],
  defaultBookSlug,
  defaultChapter,
  defaultVersionCode,
}: PortalBibleReaderProps) {
  const rootRef = useHideHydrationSkeleton<HTMLElement>();
  const [versionCode, setVersionCode] = useState(defaultVersionCode);
  const [bookSlug, setBookSlug] = useState(defaultBookSlug);
  const [chapter, setChapter] = useState(defaultChapter);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verses, setVerses] = useState<ReadApiVerse[]>([]);

  const selectedBook = useMemo(() => {
    return (
      books.find((book) => book.slug === bookSlug) ?? {
        slug: "genesis",
        name: "Genesis",
        chapters: 1,
      }
    );
  }, [books, bookSlug]);

  const canGoPreviousChapter = chapter > 1;
  const canGoNextChapter = chapter < selectedBook.chapters;

  useEffect(() => {
    let isMounted = true;

    async function loadChapter() {
      setLoading(true);
      setError("");

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
          const message =
            loadError instanceof Error
              ? loadError.message
              : "No se pudo consultar el contenido.";
          setError(message);
          setVerses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("version", versionCode);
    nextUrl.searchParams.set("book", bookSlug);
    nextUrl.searchParams.set("chapter", String(chapter));
    window.history.replaceState(
      {},
      "",
      `${nextUrl.pathname}?${nextUrl.searchParams.toString()}${nextUrl.hash}`,
    );

    loadChapter();
    return () => {
      isMounted = false;
    };
  }, [bookSlug, chapter, versionCode]);

  function handleBookChange(nextBookSlug: string) {
    setBookSlug(nextBookSlug);
    setDirection("forward");
    setChapter(1);
  }

  function goPreviousChapter() {
    setDirection("backward");
    setChapter((current) => Math.max(1, current - 1));
  }

  function goNextChapter() {
    setDirection("forward");
    setChapter((current) => Math.min(selectedBook.chapters, current + 1));
  }

  return (
    <section className="card portal-bible-reader-module" ref={rootRef}>
      <div>
        <h2 className="card-title">Lectura del pasaje</h2>
        <p className="app-desc">
          {versions.length > 0
            ? `Version activa: ${versions.find((version) => version.code === versionCode)?.name ?? versionCode}. `
            : ""}
          Navega libro y capitulo con la misma capa visual compartida del
          Portal.
        </p>
      </div>

      <div className="portal-bible-controls-grid">
        {versions.length > 0 ? (
          <label className="form-row" htmlFor="version-select">
            <span>Version</span>
            <select
              id="version-select"
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

        <label className="form-row" htmlFor="book-select">
          <span>Libro</span>
          <select
            id="book-select"
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

        <label className="form-row" htmlFor="chapter-select">
          <span>Capitulo</span>
          <select
            id="chapter-select"
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

      <div className="hero-actions">
        <button
          className="button secondary"
          type="button"
          disabled={!canGoPreviousChapter || loading}
          onClick={goPreviousChapter}
        >
          Capitulo anterior
        </button>
        <button
          className="button secondary"
          type="button"
          disabled={!canGoNextChapter || loading}
          onClick={goNextChapter}
        >
          Capitulo siguiente
        </button>
      </div>

      {loading ? (
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

      {error ? <p className="form-status error">{error}</p> : null}

      {!loading && !error && verses.length === 0 ? (
        <p className="form-status pending">
          No hay versiculos para este capitulo.
        </p>
      ) : null}

      {!loading && !error && verses.length > 0 ? (
        <article
          className={`portal-bible-reader-result portal-bible-reader-result--${direction}`}
          aria-live="polite"
          key={`${bookSlug}-${chapter}-${direction}`}
        >
          <h2 className="card-title">
            {verses[0]?.bookName} {verses[0]?.chapter}
          </h2>
          <div className="portal-bible-verses">
            {verses.map((verse) => (
              <p
                key={`${verse.bookSlug}-${verse.chapter}-${verse.verse}`}
                id={`v-${verse.verse}`}
              >
                <strong>{verse.verse}</strong> {verse.text}
              </p>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  );
}
