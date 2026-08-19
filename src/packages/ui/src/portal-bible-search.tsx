import { FormEvent, useState } from "react";
import { useHideHydrationSkeleton } from "./hydration-skeleton.js";

type Verse = {
  reference: string;
  text: string;
};

type ApiResult = {
  success: boolean;
  message?: string;
  reference?: string;
  verses?: Verse[];
};

export function PortalBibleSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [verses, setVerses] = useState<Verse[]>([]);
  const rootRef = useHideHydrationSkeleton<HTMLElement>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setReference("");
    setVerses([]);

    try {
      const response = await fetch(
        `/api/v1/bible?q=${encodeURIComponent(query)}`,
      );
      const data = (await response.json()) as ApiResult;

      if (!response.ok || !data.success) {
        setError(data.message || "No se pudo consultar la cita.");
        return;
      }

      setReference(data.reference || "");
      setVerses(data.verses || []);
    } catch {
      setError("No se pudo conectar con la API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="card bible-search-card" ref={rootRef}>
      <h3 className="card-title">Buscador de citas biblicas</h3>
      <p className="app-desc">
        Busca una cita puntual o un rango. Ejemplos: <strong>Juan 3:16</strong>{" "}
        o<strong> Salmos 23:1-6</strong>.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="bible-query">Cita biblica</label>
          <input
            id="bible-query"
            name="bible-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ejemplo: Lucas 15:11-24"
            required
          />
        </div>

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Consultando..." : "Buscar cita"}
        </button>
      </form>

      {loading ? (
        <div
          className="bible-results-skeleton"
          aria-busy="true"
          aria-label="Buscando en la Biblia"
        >
          <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
          <div className="skeleton-bar skeleton-bar--sm skeleton-pulse" />
          <div className="skeleton-bar skeleton-bar--md skeleton-pulse bible-results-skeleton__wide" />
        </div>
      ) : null}

      {error ? <p className="form-status error">{error}</p> : null}

      {reference ? (
        <div className="bible-results" aria-live="polite">
          <span className="pill">{reference}</span>
          <div className="bible-verses">
            {verses.map((verse) => (
              <p key={verse.reference}>
                <strong>{verse.reference}</strong> {verse.text}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
