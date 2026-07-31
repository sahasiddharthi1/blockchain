import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/cn";
const NAV = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/explorer", label: "Explorer" },
    { to: "/mining", label: "Mining" },
    { to: "/wallet", label: "Wallet" },
    { to: "/transactions", label: "Transactions" },
    { to: "/analytics", label: "Analytics" },
    { to: "/network", label: "Network" },
    { to: "/profile", label: "Profile" },
    { to: "/settings", label: "Settings" },
];
export function MobileNav() {
    const [open, setOpen] = useState(false);
    return (_jsxs("div", { className: "md:hidden", children: [_jsx("button", { onClick: () => setOpen((v) => !v), className: "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)]", children: open ? _jsx(X, { size: 18 }) : _jsx(Menu, { size: 18 }) }), open && (_jsx("div", { className: "fixed inset-0 z-40 bg-[var(--color-background)]/80 p-4 backdrop-blur", children: _jsxs("div", { className: "mx-auto max-w-sm rounded-card border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-8 w-8 rounded-lg bg-[var(--color-primary)]" }), _jsx("div", { className: "heading-2 text-lg text-[var(--color-foreground)]", children: "Ledgerforge" })] }), _jsx(ThemeToggle, {})] }), _jsx("nav", { className: "mt-6 flex flex-col gap-1", children: NAV.map((item) => (_jsx(NavLink, { to: item.to, onClick: () => setOpen(false), className: ({ isActive }) => cn("rounded-lg px-3 py-2 text-sm", isActive ? "bg-[var(--color-primary-weak)] text-[var(--color-primary)]" : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-surface-muted)]"), children: item.label }, item.to))) })] }) }))] }));
}
