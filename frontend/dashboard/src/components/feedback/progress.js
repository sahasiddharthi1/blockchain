import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
export function Progress({ className, value, max = 100, label }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (_jsxs("div", { className: cn("w-full", className), children: [(label || value !== undefined) && (_jsxs("div", { className: "mb-2 flex items-center justify-between text-xs text-[var(--color-foreground-weak)]", children: [_jsx("span", { children: label }), _jsxs("span", { children: [Math.round(pct), "%"] })] })), _jsx("div", { className: "h-2 w-full rounded-full bg-[var(--color-surface-sunken)]", children: _jsx("div", { className: "h-2 rounded-full bg-[var(--color-primary)] transition-all duration-500", style: { width: `${pct}%` } }) })] }));
}
