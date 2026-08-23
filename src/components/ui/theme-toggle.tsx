"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const preferenceEvent = "dini-theme-preference-change";

function readTheme(storageKey: string): Theme {
  const saved = window.localStorage.getItem(storageKey);
  if (saved === "dark" || saved === "light") return saved;

  return "light";
}

export function useLocalTheme(storageKey: string) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const updateFromStorage = () => setTheme(readTheme(storageKey));
    const handlePreferenceChange = (event: Event) => {
      const detail = (event as CustomEvent<{ storageKey?: string }>).detail;
      if (detail?.storageKey === storageKey) updateFromStorage();
    };

    updateFromStorage();
    window.addEventListener("storage", updateFromStorage);
    window.addEventListener(preferenceEvent, handlePreferenceChange);

    return () => {
      window.removeEventListener("storage", updateFromStorage);
      window.removeEventListener(preferenceEvent, handlePreferenceChange);
    };
  }, [storageKey]);

  function selectTheme(nextTheme: Theme) {
    window.localStorage.setItem(storageKey, nextTheme);
    setTheme(nextTheme);
    window.dispatchEvent(
      new CustomEvent(preferenceEvent, { detail: { storageKey, theme: nextTheme } }),
    );
  }

  return { selectTheme, theme };
}

export function ThemeToggle({
  label,
  storageKey,
  variant = "segmented",
  visuallyHiddenLabel = false,
}: {
  label: string;
  storageKey: string;
  variant?: "segmented" | "switch";
  visuallyHiddenLabel?: boolean;
}) {
  const { selectTheme, theme } = useLocalTheme(storageKey);

  if (variant === "switch") {
    const dark = theme === "dark";
    const nextTheme = dark ? "light" : "dark";

    return (
      <fieldset>
        <legend
          className={
            visuallyHiddenLabel
              ? "sr-only"
              : "mb-2 text-sm font-bold text-[var(--color-ink)]"
          }
        >
          {label}
        </legend>
        <div className="flex flex-wrap items-center gap-3">
          <button
            aria-label={`Switch to ${nextTheme} mode`}
            aria-pressed={dark}
            className="group relative inline-flex h-11 w-24 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-1 shadow-sm transition hover:border-[var(--color-brand-blue)] focus-visible:ring-3 focus-visible:ring-[var(--color-brand-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] focus-visible:outline-none"
            onClick={() => selectTheme(nextTheme)}
            type="button"
          >
            <span
              className="grid w-1/2 place-items-center text-amber-500"
              aria-hidden="true"
            >
              <SunIcon />
            </span>
            <span
              className="grid w-1/2 place-items-center text-[var(--color-brand-blue)]"
              aria-hidden="true"
            >
              <MoonIcon />
            </span>
            <span
              aria-hidden="true"
              className={`absolute top-1 grid h-9 w-9 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm transition-transform duration-200 ease-out ${dark ? "translate-x-12" : "translate-x-0"}`}
            >
              {dark ? <MoonIcon /> : <SunIcon />}
            </span>
          </button>
          <span
            className="text-sm font-bold text-[var(--color-muted)]"
            aria-live="polite"
          >
            {dark ? "Dark mode" : "Light mode"}
          </span>
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset>
      <legend
        className={
          visuallyHiddenLabel
            ? "sr-only"
            : "mb-2 text-sm font-bold text-[var(--color-ink)]"
        }
      >
        {label}
      </legend>
      <div
        aria-label={label}
        className="inline-flex rounded-[var(--radius-control)] border border-[var(--color-border)] p-1"
        role="group"
      >
        {(["light", "dark"] as const).map((option) => {
          const active = theme === option;
          return (
            <button
              aria-pressed={active}
              className={`min-h-10 rounded-[calc(var(--radius-control)-0.25rem)] px-4 text-sm font-bold transition ${active ? "bg-[var(--color-brand-blue)] text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)]"}`}
              key={option}
              onClick={() => selectTheme(option)}
              type="button"
            >
              {option === "light" ? "Light" : "Dark"}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SunIcon() {
  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M20.5 15.2A8.5 8.5 0 018.8 3.5 8.5 8.5 0 1019 19.2c.5-1.2.9-2.6 1.5-4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
