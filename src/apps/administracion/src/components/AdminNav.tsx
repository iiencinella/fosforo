import { useState } from "react";

type LinkItem = { href: string; label: string };

export default function AdminNav(props: {
  links: LinkItem[];
  currentPath: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="nav-hamburger"
        aria-label="Abrir menú de navegación"
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        className="admin-nav admin-nav--desktop"
        aria-label="Navegación principal"
      >
        {props.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={
              props.currentPath.startsWith(link.href) ? "is-active" : ""
            }
          >
            {link.label}
          </a>
        ))}
      </nav>

      <nav
        id="admin-mobile-nav"
        className={`admin-nav admin-nav--mobile ${open ? "is-open" : ""}`}
        aria-label="Navegación móvil"
      >
        {props.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={
              props.currentPath.startsWith(link.href) ? "is-active" : ""
            }
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </>
  );
}
