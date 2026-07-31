import { jsx as _jsx } from "react/jsx-runtime";
import { useTheme } from "@/contexts/theme";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
export function ThemeToggle() {
    const { setTheme, resolved } = useTheme();
    const toggle = () => setTheme(resolved === "dark" ? "light" : "dark");
    return (_jsx("button", { onClick: toggle, className: "inline-flex items-center justify-center rounded-lg border border-border bg-ink-card p-2 text-paper-muted transition-all hover:text-paper hover:bg-ink-overlay", "aria-label": "Toggle theme", children: _jsx(motion.span, { initial: { rotate: -90, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, exit: { rotate: 90, opacity: 0 }, transition: { duration: 0.2 }, children: resolved === "dark" ? _jsx(Sun, { size: 18 }) : _jsx(Moon, { size: 18 }) }, resolved) }));
}
