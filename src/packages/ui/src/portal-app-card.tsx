export type PortalAppStatus = "disponible" | "en-desarrollo" | "proximamente";

export type PortalAppCardProps = {
  slug?: string;
  href?: string;
  name: string;
  resume: string;
  category: string;
  status: PortalAppStatus;
  imageSrc?: string;
  imageAlt?: string;
  iconSrc?: string;
  iconAlt?: string;
};

const STATUS_LABEL: Record<PortalAppStatus, string> = {
  disponible: "Disponible",
  "en-desarrollo": "En desarrollo",
  proximamente: "Proximamente",
};

const STATUS_CLASS: Record<PortalAppStatus, string> = {
  disponible: "status-stable",
  "en-desarrollo": "status-development",
  proximamente: "status-idea",
};

export function PortalAppCard({
  slug,
  href,
  name,
  resume,
  category,
  status,
  imageSrc,
  imageAlt = "",
  iconSrc,
  iconAlt = "",
}: PortalAppCardProps) {
  const targetHref = href ?? (slug ? `/apps/${slug}` : "#");

  return (
    <a
      className={`app-card${imageSrc ? " app-card--with-image" : ""}`}
      href={targetHref}
    >
      {imageSrc ? (
        <div
          className="app-card-media"
          aria-hidden="true"
          title={imageAlt}
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      ) : null}

      <div className="app-title">
        <span className="app-name">
          {iconSrc ? (
            <img
              className="app-icon"
              src={iconSrc}
              alt={iconAlt}
              loading="lazy"
            />
          ) : null}
          <span>{name}</span>
        </span>
        <span className={`status ${STATUS_CLASS[status]}`}>
          <span className="status-dot" aria-hidden="true" />
          {STATUS_LABEL[status]}
        </span>
      </div>

      <p className="app-desc">{resume}</p>

      <div className="app-meta">
        <span>{category}</span>
        <span className="app-detail-hint">Ver detalle</span>
      </div>
    </a>
  );
}
