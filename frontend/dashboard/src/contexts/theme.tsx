import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

export type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
};

const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "ledgerforge-ui-theme" }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [toast, setToast] = useState<{ mode: "light" | "dark" } | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effective: "light" | "dark" = "light";

    if (theme === "system") {
      effective = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      effective = theme;
    }

    root.classList.add(effective);
    setResolved(effective);
    setToast({ mode: effective });

    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const value = {
    theme,
    setTheme,
    resolved,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl animate-fade-in-up"
          style={{ borderColor: "var(--color-border)", background: "var(--color-ink-card)" }}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg border"
            style={{ background: toast.mode === "light" ? "#f1ecfb" : "#0b0715", borderColor: "var(--color-border)" }}
          >
            <Check className="h-4 w-4" style={{ color: toast.mode === "light" ? "#6956a8" : "#7c5cfc" }} />
          </span>
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--color-paper)" }}>
              {toast.mode === "light" ? "Light mode" : "Dark mode"}
            </div>
            <div className="text-xs" style={{ color: "var(--color-paper-muted)" }}>
              Theme applied across all screens
            </div>
          </div>
        </div>
      )}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
