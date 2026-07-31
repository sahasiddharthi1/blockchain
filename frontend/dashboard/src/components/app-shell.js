import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
import { Home, Compass, Pickaxe, Wallet, BarChart3, Network, User, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: _jsx(Home, { size: 18 }) },
    { to: "/explorer", label: "Explorer", icon: _jsx(Compass, { size: 18 }) },
    { to: "/mining", label: "Mining", icon: _jsx(Pickaxe, { size: 18 }) },
    { to: "/wallet", label: "Wallet", icon: _jsx(Wallet, { size: 18 }) },
    { to: "/transactions", label: "Transactions", icon: _jsx(Wallet, { size: 18 }) },
    { to: "/analytics", label: "Analytics", icon: _jsx(BarChart3, { size: 18 }) },
    { to: "/network", label: "Network", icon: _jsx(Network, { size: 18 }) },
    { to: "/profile", label: "Profile", icon: _jsx(User, { size: 18 }) },
];
export function AppShell({ children }) {
    return (_jsxs("div", { className: "min-h-screen bg-[var(--color-background)]", children: [_jsx("aside", { className: "fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-[var(--color-border)] bg-[var(--color-surface)]", children: _jsxs("div", { className: "flex h-full flex-col", children: [_jsxs("div", { className: "flex h-16 items-center justify-between px-5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-8 w-8 rounded-lg bg-[var(--color-primary)] shadow-card" }), _jsx("div", { className: "text-lg font-semibold tracking-tight text-[var(--color-ink)]", children: "Ledgerforge" })] }), _jsx(ThemeToggle, {})] }), _jsxs("nav", { className: "flex-1 overflow-y-auto px-3 py-4", children: [_jsx("div", { className: "mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-weak)]", children: "Platform" }), _jsx("ul", { className: "space-y-1", children: NAV_ITEMS.map((item) => (_jsx("li", { children: _jsxs(NavLink, { to: item.to, className: ({ isActive }) => cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", isActive
                                                ? "bg-[var(--accent-weak)] text-[var(--accent)]"
                                                : "text-[var(--text)] hover:bg-[var(--bg-layer-2)]"), children: [_jsx("span", { className: "shrink-0", children: item.icon }), _jsx("span", { className: "truncate", children: item.label })] }) }, item.to))) }), _jsx("div", { className: "mt-6 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-weak)]", children: "System" }), _jsx("ul", { className: "space-y-1", children: _jsx("li", { children: _jsxs(NavLink, { to: "/settings", className: ({ isActive }) => cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors", isActive
                                                ? "bg-[var(--accent-weak)] text-[var(--accent)]"
                                                : "text-[var(--text)] hover:bg-[var(--bg-layer-2)]"), children: [_jsx(Settings, { size: 18 }), _jsx("span", { className: "truncate", children: "Settings" })] }) }) })] }), _jsx("div", { className: "border-t border-[var(--border)] p-3", children: _jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-layer-2)] p-3", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-[var(--accent)]" }), _jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "truncate text-sm font-medium text-[var(--text-strong)]", children: "User" }), _jsx("div", { className: "truncate text-xs text-[var(--text-weak)]", children: "user@example.com" })] })] }) })] }) }), _jsx("div", { className: "pl-[260px]", children: _jsx("main", { className: "min-h-[calc(100vh-64px)] p-6 lg:p-10", children: children }) })] }));
}
