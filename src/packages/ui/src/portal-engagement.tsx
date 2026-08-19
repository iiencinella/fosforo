import { FormEvent, useMemo, useState } from "react";
import { useHideHydrationSkeleton } from "./hydration-skeleton.js";

type JourneyType = "colaborar" | "feedback" | "soporte";

const journeyCopy: Record<
  JourneyType,
  { title: string; detail: string; nextStep: string }
> = {
  colaborar: {
    title: "Ruta de colaboración",
    detail:
      "Comparte en que area deseas aportar (contenido, desarrollo, diseno o comúnidad) y te conectamos con el equipo adecuado.",
    nextStep: "Describe tu experiencia y disponibilidad en el formulario.",
  },
  feedback: {
    title: "Ruta de mejora",
    detail:
      "Cuanto mas concreto sea tu comentario, mas rápido podemos convertirlo en mejoras para el portal y las aplicaciónes.",
    nextStep: "Indica pagina, accion realizada y resultado esperado.",
  },
  soporte: {
    title: "Ruta de soporte",
    detail:
      "Si algo no funciona, reportalo con el dispositivo y navegador para poder reproducir el problema.",
    nextStep:
      "Comparte pasos para reproducir y si aparece un mensaje de error.",
  },
};

export function PortalEngagement() {
  const [name, setName] = useState("");
  const [journey, setJourney] = useState<JourneyType>("colaborar");
  const [submitted, setSubmitted] = useState(false);
  const rootRef = useHideHydrationSkeleton<HTMLElement>();

  const content = useMemo(() => journeyCopy[journey], [journey]);
  const displayName = name.trim() || "amigo";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <article className="card engagement-card" ref={rootRef}>
      <h3 className="card-title">Espacio interactivo</h3>
      <p className="app-desc">
        Cuentanos que necesitas y te mostramos el mejor camino para participar
        en Fósforo.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="engagement-name">Tu nombre</label>
          <input
            id="engagement-name"
            name="engagement-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            placeholder="Ejemplo: Ana"
          />
        </div>

        <div className="form-row">
          <label htmlFor="engagement-journey">Que quieres hacer hoy</label>
          <select
            id="engagement-journey"
            name="engagement-journey"
            value={journey}
            onChange={(event) => setJourney(event.target.value as JourneyType)}
          >
            <option value="colaborar">Quiero colaborar</option>
            <option value="feedback">Quiero dejar feedback</option>
            <option value="soporte">Necesito soporte</option>
          </select>
        </div>

        <button className="button" type="submit">
          Ver recomendación
        </button>
      </form>

      {submitted ? (
        <div className="engagement-result" role="status" aria-live="polite">
          <strong>{`Hola ${displayName}. ${content.title}`}</strong>
          <p>{content.detail}</p>
          <p className="engagement-next">{content.nextStep}</p>
        </div>
      ) : null}
    </article>
  );
}
