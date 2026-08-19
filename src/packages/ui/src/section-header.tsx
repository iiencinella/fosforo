import type { ReactNode } from "react";

type Action = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type SectionHeaderProps = {
  kicker?: string;
  title: string;
  description?: ReactNode;
  action?: Action;
  level?: 1 | 2 | 3;
};

export function SectionHeader({
  kicker,
  title,
  description,
  action,
  level = 2,
}: SectionHeaderProps) {
  const HeadingTag = `h${level}` as "h1" | "h2" | "h3";
  const actionClass =
    action?.variant === "primary" ? "button" : "button secondary";

  return (
    <div className="section-header">
      <div>
        {kicker ? <div className="pill">{kicker}</div> : null}
        <HeadingTag className="section-title">{title}</HeadingTag>
        {description ? <p className="section-desc">{description}</p> : null}
      </div>
      {action ? (
        <a className={actionClass} href={action.href}>
          {action.label}
        </a>
      ) : null}
    </div>
  );
}
