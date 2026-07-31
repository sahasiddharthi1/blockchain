import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
export function KpiCard({ className, label, value, delta, icon }) {
    return (_jsxs("div", { className: cn("surface rounded-card border-subtle shadow-card p-5", className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground-weak)]", children: label }), icon] }), _jsx("div", { className: "mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]", children: value }), delta && _jsx("div", { className: "mt-1 text-xs text-[var(--color-foreground-muted)]", children: delta })] }));
}
