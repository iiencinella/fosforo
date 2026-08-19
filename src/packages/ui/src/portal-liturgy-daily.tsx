import {
  type ChangeEvent,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import { useHideHydrationSkeleton } from "./hydration-skeleton.js";

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

type PortalLiturgyDailyProps = {
  defaultDate: string;
};

export function PortalLiturgyDaily({ defaultDate }: PortalLiturgyDailyProps) {
  const rootRef = useHideHydrationSkeleton<HTMLElement>();
  const [date, setDate] = useState(defaultDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reading, setReading] = useState<LiturgyReading | null>(null);

  async function load(currentDate: string) {
    setLoading(true);
    setError("");
    setReading(null);

    try {
      const response = await fetch(
        `/api/liturgy/daily?date=${encodeURIComponent(currentDate)}&rite=roman&region=AR`,
      );
      const data = (await response.json()) as LiturgyApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "No hay lecturas para la fecha seleccionada.",
        );
      }

      setReading(data.reading ?? null);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "No se pudo conectar con la API.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      setLoading(true);
      setError("");
      setReading(null);

      try {
        const response = await fetch(
          `/api/liturgy/daily?date=${encodeURIComponent(defaultDate)}&rite=roman&region=AR`,
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
          const message =
            loadError instanceof Error
              ? loadError.message
              : "No se pudo conectar con la API.";
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadInitial();
    return () => {
      isMounted = false;
    };
  }, [defaultDate]);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    await load(date);
  }

  return (
    <section className="card portal-liturgy-module" ref={rootRef}>
      <div>
        <h2 className="card-title">Consulta liturgica</h2>
        <p className="app-desc">
          Revisa las lecturas del dia dentro del mismo shell visual del
          ecosistema.
        </p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="liturgy-date">Fecha liturgica</label>
          <input
            id="liturgy-date"
            type="date"
            value={date}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setDate(event.target.value)
            }
            required
          />
        </div>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Consultando..." : "Consultar lecturas"}
        </button>
      </form>

      {loading ? (
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

      {error ? <p className="form-status error">{error}</p> : null}

      {!loading && !error && reading ? (
        <article className="portal-liturgy-result" aria-live="polite">
          <h2 className="card-title">{reading.fecha}</h2>
          <p className="app-desc">
            {reading.nombre ?? reading.tipo ?? "Celebracion liturgica"}
            {reading.ciclo ? ` · Ciclo ${reading.ciclo}` : ""}
            {typeof reading.semana === "number"
              ? ` · Semana ${reading.semana}`
              : ""}
          </p>
          <ul>
            <li>Primera lectura: {reading.primera ?? "No disponible"}</li>
            <li>Salmo: {reading.salmo ?? "No disponible"}</li>
            <li>Segunda lectura: {reading.segunda ?? "No disponible"}</li>
            <li>Evangelio: {reading.evangelio ?? "No disponible"}</li>
          </ul>
        </article>
      ) : null}
    </section>
  );
}
