import type { ReactNode } from "react";

type BreadcrumbItem = {
  label: ReactNode;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            className={`breadcrumbs-item${isLast ? " is-active" : ""}`}
            key={`${index}-${String(item.label)}`}
          >
            {item.href && !isLast ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            )}
            {!isLast ? <span className="breadcrumbs-sep">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
