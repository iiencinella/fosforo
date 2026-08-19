import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "fosforo-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial: Theme = stored === "light" ? "light" : "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      aria-label={`Cambiar a tema ${nextTheme === "light" ? "claro" : "oscuro"}`}
    >
      <span className="theme-toggle__text">
        {theme === "dark" ? "Oscuro" : "Claro"}
      </span>
      <span className="theme-toggle__thumb" aria-hidden="true" />
    </button>
  );
}
