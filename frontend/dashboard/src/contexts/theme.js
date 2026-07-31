import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
const ThemeProviderContext = createContext(null);
export function ThemeProvider({ children, defaultTheme = "system", storageKey = "ledgerforge-ui-theme" }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(storageKey) || defaultTheme;
        }
        return defaultTheme;
    });
    const [resolved, setResolved] = useState("light");
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        let effective = "light";
        if (theme === "system") {
            effective = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        else {
            effective = theme;
        }
        root.classList.add(effective);
        setResolved(effective);
        setToast({ mode: effective });
        if (toastTimer.current)
            window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 2400);
    }, [theme]);
    useEffect(() => {
        return () => {
            if (toastTimer.current)
                window.clearTimeout(toastTimer.current);
        };
    }, []);
    const value = {
        theme,
        setTheme,
        resolved,
    };
    return (_jsxs(ThemeProviderContext.Provider, { value: value, children: [children, toast && (_jsxs("div", { role: "status", className: "fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl animate-fade-in-up", style: { borderColor: "var(--color-border)", background: "var(--color-ink-card)" }, children: [_jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-lg border", style: { background: toast.mode === "light" ? "#f1ecfb" : "#0b0715", borderColor: "var(--color-border)" }, children: _jsx(Check, { className: "h-4 w-4", style: { color: toast.mode === "light" ? "#6956a8" : "#7c5cfc" } }) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-semibold", style: { color: "var(--color-paper)" }, children: toast.mode === "light" ? "Light mode" : "Dark mode" }), _jsx("div", { className: "text-xs", style: { color: "var(--color-paper-muted)" }, children: "Theme applied across all screens" })] })] }))] }));
}
export function useTheme() {
    const context = useContext(ThemeProviderContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
