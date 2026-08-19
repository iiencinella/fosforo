import {
  type ChangeEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHideHydrationSkeleton } from "./hydration-skeleton.js";

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
  query?: string;
  normalizedReference?: string;
  total?: number;
  results?: SearchResult[];
};

type PortalBibleSearchModuleProps = {
  defaultQuery?: string;
  versions?: Array<{
    code: string;
    name: string;
  }>;
  defaultVersionCode?: string;
};

export function PortalBibleSearchModule({
  defaultQuery = "",
  versions = [],
  defaultVersionCode,
}: PortalBibleSearchModuleProps) {
  const rootRef = useHideHydrationSkeleton<HTMLElement>();
  const [query, setQuery] = useState(defaultQuery);
  const [versionCode, setVersionCode] = useState(
    defaultVersionCode ?? versions[0]?.code ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [normalizedReference, setNormalizedReference] = useState("");

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const pagedResults = results.slice((page - 1) * pageSize, page * pageSize);

  const handleSubmit = useCallback(
    async (event?: SyntheticEvent<HTMLFormElement>) => {
      if (event) {
        event.preventDefault();
      }

      const normalized = query.trim();

      if (normalized.length < 2) {
        setError("Ingresa al menos 2 caracteres para buscar.");
        setResults([]);
        setTotal(0);
        setNormalizedReference("");
        return;
      }

      setLoading(true);
      setError("");
      setResults([]);
      setTotal(0);
      setPage(1);
      setNormalizedReference("");

      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("q", normalized);
      if (versionCode) {
        nextUrl.searchParams.set("version", versionCode);
      }
      window.history.replaceState(
        {},
        "",
        `${nextUrl.pathname}?${nextUrl.searchParams.toString()}${nextUrl.hash}`,
      );

      try {
        const response = await fetch(
          `/api/bible/search?query=${encodeURIComponent(normalized)}${versionCode ? `&version=${encodeURIComponent(versionCode)}` : ""}`,
        );
        const data = (await response.json()) as SearchApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.message || "No se pudo completar la busqueda.");
        }

        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
        setNormalizedReference(data.normalizedReference ?? "");
      } catch (searchError) {
        const message =
          searchError instanceof Error
            ? searchError.message
            : "No se pudo conectar con la API.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [query, versionCode],
  );

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  useEffect(() => {
    if (defaultQuery.trim().length >= 2) {
      void handleSubmitRef.current();
    }
  }, [defaultQuery]);

  return (
    <section className="card portal-bible-search-module" ref={rootRef}>
      <h2 className="card-title">Busqueda biblica</h2>
      <p className="app-desc">
        {versions.length > 0
          ? `Version activa: ${versions.find((version) => version.code === versionCode)?.name ?? versionCode}. `
          : ""}
        Busca por palabra o referencia sobre la version activa y navega los
        resultados.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        {versions.length > 0 ? (
          <div className="form-row">
            <label htmlFor="search-version">Version</label>
            <select
              id="search-version"
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
          </div>
        ) : null}

        <div className="form-row">
          <label htmlFor="search-query">Palabra o referencia</label>
          <input
            id="search-query"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setQuery(event.target.value)
            }
            placeholder="Ejemplo: amor, misericordia, Juan 3"
          />
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {loading ? (
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

      {error ? <p className="form-status error">{error}</p> : null}

      {!loading && !error ? (
        <div className="portal-bible-search-results" aria-live="polite">
          {normalizedReference ? (
            <p className="app-desc">
              Referencia interpretada: {normalizedReference}
            </p>
          ) : null}
          <p className="app-desc">Resultados: {total}</p>

          {results.length === 0 ? (
            <p className="form-status pending">
              No hay coincidencias para esta consulta.
            </p>
          ) : (
            <>
              <div className="portal-bible-verses">
                {pagedResults.map((item) => (
                  <p key={`${item.bookSlug}-${item.chapter}-${item.verse}`}>
                    <strong>{item.reference}</strong> {item.text}
                  </p>
                ))}
              </div>

              <div className="hero-actions portal-bible-pagination">
                <button
                  className="button secondary"
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Pagina anterior
                </button>
                <span className="app-desc">
                  Pagina {page} de {totalPages}
                </span>
                <button
                  className="button secondary"
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Pagina siguiente
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
