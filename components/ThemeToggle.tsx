"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

type ThemeToggleProps = {
  className?: string;
};

const STORAGE_KEY = "truetone-theme";
const THEME_EVENT = "truetone-theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function updateTheme(nextTheme: Theme) {
    applyTheme(nextTheme);
  }

  return (
    <div
      className={`inline-grid grid-cols-2 items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface) p-1 text-(--color-muted) shadow-[0_18px_40px_-28px_color-mix(in_oklch,var(--color-shadow)_55%,transparent)] ${className}`}
    >
      <button
        type="button"
        aria-label="Use light theme"
        aria-pressed={theme === "light"}
        onClick={() => updateTheme("light")}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3.5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] whitespace-nowrap transition ${
          theme === "light"
            ? "bg-(--color-accent) text-(--color-accent-foreground)"
            : "text-(--color-muted) hover:bg-(--color-surface-strong) hover:text-(--color-foreground)"
        }`}
      >
        <SunMedium className="size-3.5" />
        Light
      </button>

      <button
        type="button"
        aria-label="Use dark theme"
        aria-pressed={theme === "dark"}
        onClick={() => updateTheme("dark")}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3.5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.18em] whitespace-nowrap transition ${
          theme === "dark"
            ? "bg-(--color-accent) text-(--color-accent-foreground)"
            : "text-(--color-muted) hover:bg-(--color-surface-strong) hover:text-(--color-foreground)"
        }`}
      >
        <MoonStar className="size-3.5" />
        Dark
      </button>
    </div>
  );
}