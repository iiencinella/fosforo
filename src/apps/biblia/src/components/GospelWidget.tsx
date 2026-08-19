import { useEffect, useMemo, useState } from "react";

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

type GospelWidgetProps = {
  reading: LiturgyReading | null;
  gospelVerses: SearchResult[];
  youtubeUrl?: string;
  spotifyUrl?: string;
  theme: "light" | "dark";
  error?: string;
};

function extractSpotifyEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input);

    if (url.hostname === "open.spotify.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const type = parts[0];
        const id = parts[1];
        return `https://open.spotify.com/embed/${type}/${id}`;
      }
    }

    if (
      url.hostname === "creators.spotify.com" ||
      url.hostname === "podcasters.spotify.com"
    ) {
      const path = url.pathname;
      const episodesMatch = path.match(/\/episodes\/([^/]+)/);
      if (episodesMatch) {
        const slug = episodesMatch[1];
        const idParts = slug.split("-");
        const id = idParts[idParts.length - 1];
        return `https://open.spotify.com/embed/episode/${id}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function extractYoutubeEmbedUrl(input: string): string | null {
  try {
    const url = new URL(input);

    if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
      const videoId = url.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.slice(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function GospelWidget({
  reading,
  gospelVerses,
  youtubeUrl,
  spotifyUrl,
  theme,
  error,
}: GospelWidgetProps) {
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    document.documentElement.dataset.theme = currentTheme;
  }, [currentTheme]);

  const youtubeEmbed = useMemo(
    () => (youtubeUrl ? extractYoutubeEmbedUrl(youtubeUrl) : null),
    [youtubeUrl],
  );

  const spotifyEmbed = useMemo(
    () => (spotifyUrl ? extractSpotifyEmbedUrl(spotifyUrl) : null),
    [spotifyUrl],
  );

  const celebrationLabel = useMemo(() => {
    if (!reading) return "";
    const parts: string[] = [];
    if (reading.nombre) parts.push(reading.nombre);
    else if (reading.tipo) parts.push(reading.tipo);
    if (reading.ciclo) parts.push(`Ciclo ${reading.ciclo}`);
    if (typeof reading.semana === "number")
      parts.push(`Semana ${reading.semana}`);
    return parts.join(" · ");
  }, [reading]);

  function toggleTheme() {
    setCurrentTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <div className="gospel-widget" data-theme={currentTheme}>
      <header className="gospel-widget-header">
        <div className="gospel-widget-title-row">
          <h1 className="gospel-widget-title">Evangelio del día</h1>
          <button
            type="button"
            className="gospel-widget-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Cambiar a modo ${currentTheme === "dark" ? "claro" : "oscuro"}`}
          >
            {currentTheme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
        {reading ? (
          <p className="gospel-widget-meta">
            <strong>{reading.fecha}</strong>
            {celebrationLabel ? ` · ${celebrationLabel}` : ""}
          </p>
        ) : null}
      </header>

      {error ? (
        <div className="gospel-widget-error" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      {!error && reading?.evangelio ? (
        <section className="gospel-widget-reading">
          <h2 className="gospel-widget-reference">{reading.evangelio}</h2>
          {gospelVerses.length > 0 ? (
            <div className="gospel-widget-verses" aria-live="polite">
              {gospelVerses.map((verse) => (
                <p
                  key={`${verse.bookSlug}-${verse.chapter}-${verse.verse}`}
                  className="gospel-widget-verse"
                >
                  <strong>{verse.verse}</strong> {verse.text}
                </p>
              ))}
            </div>
          ) : (
            <p className="gospel-widget-empty">
              Texto no disponible para esta referencia.
            </p>
          )}
        </section>
      ) : null}

      {!error && reading && !reading.evangelio ? (
        <div className="gospel-widget-empty">
          <p>No hay evangelio disponible para esta fecha.</p>
        </div>
      ) : null}

      {youtubeEmbed ? (
        <section className="gospel-widget-media">
          <h3 className="gospel-widget-media-title">Video</h3>
          <div className="gospel-widget-video-wrapper">
            <iframe
              src={youtubeEmbed}
              title="Video del evangelio"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </section>
      ) : null}

      {spotifyEmbed ? (
        <section className="gospel-widget-media">
          <h3 className="gospel-widget-media-title">Escuchar</h3>
          <iframe
            src={spotifyEmbed}
            title="Evangelio en Spotify"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="gospel-widget-spotify"
          />
        </section>
      ) : null}

      <footer className="gospel-widget-footer">
        <span className="gospel-widget-brand">
          Fósforo ·{" "}
          <a
            href="https://fosforo.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            fosforo.org
          </a>
        </span>
      </footer>
    </div>
  );
}
