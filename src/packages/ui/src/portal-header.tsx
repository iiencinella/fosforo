import { useEffect, useId, useMemo, useState } from "react";

const MOBILE_MENU_QUERY = "(max-width: 900px)";
const THEME_STORAGE_KEY = "portal-theme";

function isTheme(value: string | undefined | null): value is "dark" | "light" {
  return value === "light" || value === "dark";
}

function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

function persistTheme(theme: "dark" | "light") {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    return;
  }
}

function resolveThemePreference() {
  const documentTheme = document.documentElement.dataset.theme;
  if (isTheme(documentTheme)) {
    return documentTheme;
  }

  const stored = getStoredTheme();
  if (stored) {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="4.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23L5.46 5.46"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15.2 3.65a8.75 8.75 0 1 0 5.15 15.57A9.7 9.7 0 0 1 18 19.5c-5.39 0-9.75-4.36-9.75-9.75 0-2.31.8-4.43 2.15-6.1a8.72 8.72 0 0 0 4.8 0Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FlameLogoIcon() {
  return (
    <svg viewBox="0 0 256 256" aria-hidden="true" focusable="false">
      <path
        className="logo-flame__outer"
        d="M156.547,240.001c-3.152,0-6.214-1.493-8.139-4.185c-2.719-3.803-2.44-8.983,0.672-12.474 c4.809-5.392,6.107-13.589,3.473-21.927c-2.721-8.614-8.377-17.207-13.406-23.698c-1.102,1.735-2.358,3.519-3.789,5.294 c-1.903,2.366-4.772,3.729-7.789,3.729c-0.209,0-0.418-0.007-0.628-0.021c-3.242-0.203-6.182-1.97-7.886-4.734 c-6.052-9.822-9.53-20.627-11.527-29.953c-6.847,8.927-14.442,20.65-18.56,32.945c-4.064,12.14-3.597,24.897,1.281,35.004 c1.915,3.968,1.009,8.72-2.23,11.703c-1.895,1.744-4.326,2.646-6.778,2.646c-1.741,0-3.492-0.453-5.068-1.381 c-40.174-23.634-52.264-77.979-28.123-126.412c24.085-48.322,74.458-85.101,76.59-86.643c1.739-1.257,3.795-1.896,5.86-1.896 c1.619,0,3.243,0.393,4.727,1.188c3.373,1.81,5.418,5.386,5.266,9.212c-0.021,0.552-1.676,57.076,34.316,79.626 c21.985,13.773,33.782,38.5,31.559,66.146c-2.348,29.16-19.949,54.083-45.938,65.042 C159.169,239.746,157.85,240.001,156.547,240.001z"
      />
      <path
        className="logo-flame__inner"
        d="M169.5,116.5c-41.5-26-39-88.5-39-88.5S80.265,64.323,57,111c-20.791,41.713-12.906,91.479,24.243,113.332 c-5.938-12.301-6.69-27.798-1.758-42.527c9.557-28.539,35.358-53.321,35.358-53.321s-0.342,27.051,12.725,48.258 c6.825-8.479,8.936-17.256,8.936-17.256s19.254,18.873,25.584,38.918c3.723,11.781,1.588,23.599-5.545,31.596 C203.609,210.152,210.889,142.43,169.5,116.5z"
      />
    </svg>
  );
}

type NavLink = {
  href: string;
  label: string;
};

export type PortalHeaderUserInfo = {
  name: string;
  href: string;
  logout?: { href?: string; formAction?: string; label?: string };
};

export type PortalHeaderProps = {
  links: NavLink[];
  currentPath?: string;
  ctaHref?: string;
  ctaLabel?: string;
  ctaClassName?: string;
  title?: string;
  logo?: string;
  logoSrc?: string;
  logoSrcLight?: string;
  logoSrcDark?: string;
  logoAlt?: string;
  user?: PortalHeaderUserInfo;
  loginHref?: string;
  registerHref?: string;
  onLogout?: { endpoint: string; redirectTo?: string };
  hideAuth?: boolean;
};

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      ) : (
        <path
          d="M4.5 7.5h15M4.5 12h15M4.5 16.5h15"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
}

export function PortalHeader({
  links,
  currentPath = "/",
  ctaHref = "/contacto",
  ctaLabel = "Sumate",
  ctaClassName,
  title = "Fosforo",
  logo,
  logoSrc,
  logoSrcLight,
  logoSrcDark,
  logoAlt = "Logo de Fosforo",
  user,
  loginHref = "/auth/login",
  registerHref = "/auth/register",
  onLogout,
  hideAuth = false,
}: PortalHeaderProps) {
  const mobileMenuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return "dark";
    }

    return resolveThemePreference();
  });

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const normalizedCurrentPath = useMemo(
    () => normalizePath(currentPath),
    [currentPath],
  );
  const visibleLinks = useMemo(
    () =>
      links.filter(
        (link) => normalizePath(link.href) !== normalizedCurrentPath,
      ),
    [links, normalizedCurrentPath],
  );
  const baseLogoSrc = logoSrc ?? logo;

  function applyTheme(nextTheme: "dark" | "light", persist = true) {
    setTheme(nextTheme);
    if (persist) {
      persistTheme(nextTheme);
    }
  }

  useEffect(() => {
    document.documentElement.dataset.themeToggleHydrated = "true";
    return () => {
      delete document.documentElement.dataset.themeToggleHydrated;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function syncThemeFromEnvironment() {
      const stored = getStoredTheme();
      if (stored) {
        applyTheme(stored, false);
        return;
      }

      applyTheme(mediaQuery.matches ? "dark" : "light", false);
    }

    function onStorage(event: StorageEvent) {
      if (event.key === THEME_STORAGE_KEY) {
        syncThemeFromEnvironment();
      }
    }

    mediaQuery.addEventListener("change", syncThemeFromEnvironment);
    window.addEventListener("storage", onStorage);

    return () => {
      mediaQuery.removeEventListener("change", syncThemeFromEnvironment);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      const current = el.dataset.theme;
      if (isTheme(current)) {
        setTheme(current);
      }
    });
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function onKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [isMenuOpen]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setIsMenuOpen(false);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [normalizedCurrentPath]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MENU_QUERY);

    function syncMenuVisibility() {
      setIsMobile(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setIsMenuOpen(false);
      }
    }

    syncMenuVisibility();
    mediaQuery.addEventListener("change", syncMenuVisibility);
    return () => mediaQuery.removeEventListener("change", syncMenuVisibility);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }
  return (
    <header className="site-header">
      <div className="page nav">
        <a className="logo" href="/" aria-label={logoAlt}>
          {logo || logoSrc || logoSrcLight || logoSrcDark ? (
            <span className="logo-image-wrap" aria-hidden="true">
              {logoSrcLight ? (
                <>
                  {logoSrcDark || baseLogoSrc ? (
                    <img
                      className="logo-image logo-image--dark"
                      src={logoSrcDark ?? baseLogoSrc}
                      alt=""
                    />
                  ) : null}
                  <img
                    className="logo-image logo-image--light"
                    src={logoSrcLight}
                    alt=""
                  />
                </>
              ) : logoSrcDark || baseLogoSrc ? (
                <img
                  className="logo-image logo-image--single"
                  src={logoSrcDark ?? baseLogoSrc}
                  alt=""
                />
              ) : null}
            </span>
          ) : (
            <span className="logo-mark logo-mark--flame" aria-hidden="true">
              <FlameLogoIcon />
            </span>
          )}
          {title}
        </a>

        <nav className="nav-links" aria-label="Navegación principal">
          {visibleLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="theme-switch"
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === "light"}
            aria-label={
              theme === "dark"
                ? "Cambiar a modo claro"
                : "Cambiar a modo oscuro"
            }
            data-theme-mode={theme}
          >
            <span className="theme-switch__rail" aria-hidden="true">
              <span className="theme-switch__icon theme-switch__icon--moon">
                <MoonIcon />
              </span>
              <span className="theme-switch__icon theme-switch__icon--sun">
                <SunIcon />
              </span>
              <span className="theme-switch__thumb"></span>
            </span>
          </button>

          <a
            className={`button nav-cta ${ctaClassName ?? ""}`.trim()}
            href={ctaHref}
            key={`${normalizedCurrentPath}-cta`}
          >
            {ctaLabel}
          </a>

          {user ? (
            <div className="nav-user">
              <a className="nav-user__name" href={user.href}>
                {user.name}
              </a>
              {onLogout ? (
                <button
                  type="button"
                  className="button secondary nav-user__logout"
                  onClick={async () => {
                    try {
                      await fetch(onLogout.endpoint, { method: "POST" });
                    } catch {
                      // ignore network errors: redirect anyway
                    }
                    window.location.href = onLogout.redirectTo ?? "/";
                  }}
                >
                  {user.logout?.label ?? "Cerrar sesion"}
                </button>
              ) : null}
            </div>
          ) : !hideAuth ? (
            <div className="nav-auth">
              <a className="button secondary nav-auth__login" href={loginHref}>
                Ingresar
              </a>
              <a className="button nav-auth__register" href={registerHref}>
                Crear cuenta
              </a>
            </div>
          ) : null}

          {isMobile ? (
            <button
              type="button"
              className="button secondary nav-toggle"
              aria-label={
                isMenuOpen ? "Cerrar menu principal" : "Abrir menu principal"
              }
              aria-expanded={isMenuOpen}
              aria-controls={mobileMenuId}
              onClick={() => setIsMenuOpen((value) => !value)}
            >
              <MenuIcon open={isMenuOpen} />
            </button>
          ) : null}
        </div>
      </div>

      {isMobile ? (
        <>
          <button
            type="button"
            className={`mobile-overlay ${isMenuOpen ? "is-open" : ""}`}
            aria-label="Cerrar menu principal"
            aria-hidden={!isMenuOpen}
            tabIndex={isMenuOpen ? 0 : -1}
            onClick={() => setIsMenuOpen(false)}
          />

          <div
            id={mobileMenuId}
            className={`mobile-panel ${isMenuOpen ? "is-open" : ""}`}
            aria-hidden={!isMenuOpen}
          >
            <nav className="mobile-nav" aria-label="Navegación movil">
              {visibleLinks.map((link) => (
                <a
                  href={link.href}
                  key={`${link.href}-mobile`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mobile-panel-actions">
              <a
                className="button"
                href={ctaHref}
                onClick={() => setIsMenuOpen(false)}
              >
                {ctaLabel}
              </a>
              {user ? (
                <>
                  <a
                    className="button secondary"
                    href={user.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.name}
                  </a>
                  {onLogout ? (
                    <button
                      type="button"
                      className="button secondary"
                      onClick={async () => {
                        try {
                          await fetch(onLogout.endpoint, { method: "POST" });
                        } catch {
                          // ignore network errors: redirect anyway
                        }
                        window.location.href = onLogout.redirectTo ?? "/";
                      }}
                    >
                      {user.logout?.label ?? "Cerrar sesion"}
                    </button>
                  ) : null}
                </>
              ) : !hideAuth ? (
                <>
                  <a
                    className="button secondary"
                    href={loginHref}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ingresar
                  </a>
                  <a
                    className="button"
                    href={registerHref}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Crear cuenta
                  </a>
                </>
              ) : null}
              <small className="mobile-panel-meta">Fosforo {currentYear}</small>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
