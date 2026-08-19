import { FormEvent, useState } from "react";

type FormStatus = "idle" | "pending" | "success" | "error";

export function PortalContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    setStatus("pending");
    setFeedback("Enviando...");

    const formData = new FormData(form);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const comment = String(formData.get("comment") ?? "").trim();
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          message: comment,
          privacy: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setFeedback(data.message || "Error al enviar el mensaje.");
        return;
      }

      setStatus("success");
      setFeedback(
        "Mensaje enviado correctamente. Te responderemos a la brevedad.",
      );
      form.reset();
    } catch {
      setStatus("error");
      setFeedback("Error de conexión. Intentalo de nuevo más tarde.");
    }
  }

  return (
    <form
      className="form"
      method="post"
      action="/api/contact"
      onSubmit={handleSubmit}
    >
      <div className="form-row">
        <label htmlFor="firstName">Nombre</label>
        <input id="firstName" name="firstName" required maxLength={60} />
      </div>

      <div className="form-row">
        <label htmlFor="lastName">Apellido</label>
        <input id="lastName" name="lastName" required maxLength={60} />
      </div>

      <div className="form-row">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required maxLength={120} />
      </div>

      <div className="form-row">
        <label htmlFor="comment">Comentario</label>
        <textarea id="comment" name="comment" required maxLength={1000} />
      </div>

      <input type="hidden" name="privacy" value="true" />

      <button className="button" type="submit" disabled={status === "pending"}>
        {status === "pending" ? "Enviando..." : "Enviar mensaje"}
      </button>

      {feedback ? <p className={`form-status ${status}`}>{feedback}</p> : null}
    </form>
  );
}
