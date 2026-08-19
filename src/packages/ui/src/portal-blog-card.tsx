import type { CSSProperties } from "react";

export type PortalBlogCardProps = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  app?: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export function PortalBlogCard({
  slug,
  title,
  description,
  date,
  category,
  app,
  href,
  imageSrc,
  imageAlt = "",
}: PortalBlogCardProps) {
  const postHref = href ?? `/novedades/${slug}`;
  const articleStyle = imageSrc
    ? ({ "--blog-card-image": `url(${imageSrc})` } as CSSProperties)
    : undefined;

  return (
    <article
      className={`card blog-card${imageSrc ? " blog-card--with-image" : ""}`}
      style={articleStyle}
    >
      {imageSrc ? (
        <div className="blog-card-image" aria-hidden="true" title={imageAlt} />
      ) : null}

      <div className="card-meta">
        <time dateTime={date}>{date}</time>
        {" · "}
        <span>{category}</span>
        {app ? (
          <>
            {" · "}
            <span>{app}</span>
          </>
        ) : null}
      </div>

      <h3 className="card-title">
        <a href={postHref}>{title}</a>
      </h3>

      <p className="app-desc">{description}</p>

      <a href={postHref}>Leer articulo</a>
    </article>
  );
}
