import { FormEvent, useState } from "react";
import { useHideHydrationSkeleton } from "./hydration-skeleton.js";

const defaultPayload = `{
  "name": "Nombre Apellido",
  "email": "nombre@correo.com",
  "message": "Quisiera colaborar con el equipo.",
  "privacy": true
}`;

export function PortalApiPlayground() {
  const [endpoint, setEndpoint] = useState("/api/v1/contact");
  const [payload, setPayload] = useState(defaultPayload);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [result, setResult] = useState("");
  const rootRef = useHideHydrationSkeleton<HTMLElement>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatusCode(null);

    let body: unknown;
    try {
      body = JSON.parse(payload);
    } catch {
      setLoading(false);
      setResult(
        JSON.stringify(
          { success: false, message: "JSON invalido en el body" },
          null,
          2,
        ),
      );
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setStatusCode(response.status);
      setResult(JSON.stringify(data, null, 2));
    } catch {
      setResult(
        JSON.stringify(
          { success: false, message: "No se pudo conectar con la API" },
          null,
          2,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="card api-playground" ref={rootRef}>
      <h2 className="card-title">API playground</h2>
      <p className="app-desc">
        Prueba consultas POST en vivo contra la API del portal.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="api-endpoint">Endpoint</label>
          <input
            id="api-endpoint"
            name="api-endpoint"
            value={endpoint}
            onChange={(event) => setEndpoint(event.target.value)}
            placeholder="/api/v1/contact"
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="api-payload">Body JSON</label>
          <textarea
            id="api-payload"
            name="api-payload"
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            className="api-payload"
            spellCheck={false}
            required
          />
        </div>

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Consultando..." : "Enviar consulta"}
        </button>
      </form>

      {loading ? (
        <div
          className="api-playground-skeleton"
          aria-busy="true"
          aria-label="Esperando respuesta de la API"
        >
          <div className="skeleton-bar skeleton-bar--sm skeleton-pulse" />
          <div className="skeleton-bar skeleton-bar--md skeleton-pulse" />
          <div className="skeleton-bar skeleton-bar--md skeleton-pulse api-playground-skeleton__pre" />
        </div>
      ) : null}

      {statusCode !== null ? (
        <span className="pill">HTTP {statusCode}</span>
      ) : null}

      {result ? (
        <pre>
          <code>{result}</code>
        </pre>
      ) : null}
    </article>
  );
}
