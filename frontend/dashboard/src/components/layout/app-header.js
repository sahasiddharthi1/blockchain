import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Search, Blocks, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: Blocks },
    { to: "/explorer", label: "Explorer" },
    { to: "/mining", label: "Mining" },
    { to: "/wallet", label: "Wallet" },
    { to: "/transactions", label: "Transactions" },
    { to: "/analytics", label: "Analytics" },
    { to: "/network", label: "Network" },
    { to: "/profile", label: "Profile" },
    { to: "/settings", label: "Settings" },
];
export function AppHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("ledgerforge-auth");
        localStorage.removeItem("lf_access_token");
        localStorage.removeItem("lf_refresh_token");
        navigate("/login");
    };
    return (_jsxs(_Fragment, { children: [_jsx("header", { className: "sticky top-0 z-20 h-16 border-b border-border bg-ink/80 backdrop-blur-xl", children: _jsxs("div", { className: "flex h-full items-center justify-between px-4 lg:px-6", children: [_jsx("button", { onClick: () => setMobileOpen(!mobileOpen), className: "md:hidden text-paper-muted hover:text-paper", children: mobileOpen ? _jsx(X, { className: "h-5 w-5" }) : _jsx(Menu, { className: "h-5 w-5" }) }), _jsxs("div", { className: "hidden md:flex relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-paper-weak" }), _jsx("input", { placeholder: "Search blocks, transactions, addresses...", className: "w-full rounded-lg border border-border bg-ink-overlay px-9 py-2 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ThemeToggle, {}), _jsxs("span", { className: "hidden sm:flex items-center gap-2 rounded-lg border border-border bg-ink-overlay px-3 py-1.5 text-xs text-paper-muted", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-success" }), "All systems normal"] })] })] }) }), mobileOpen && (_jsxs("div", { className: "fixed inset-0 z-30 md:hidden", children: [_jsx("div", { className: "absolute inset-0 bg-ink/80 backdrop-blur-sm", onClick: () => setMobileOpen(false) }), _jsx("div", { className: "absolute left-0 top-16 bottom-0 w-64 sidebar-surface p-4 overflow-y-auto", children: _jsxs("nav", { className: "space-y-1", children: [NAV_ITEMS.map((item) => (_jsx(NavLink, { to: item.to, onClick: () => setMobileOpen(false), className: ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${isActive ? "bg-signal-soft text-signal font-medium" : "text-paper-muted hover:text-paper hover:bg-ink-overlay"}`, children: item.label }, item.to))), _jsx("button", { onClick: handleLogout, className: "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-paper-muted hover:text-paper hover:bg-ink-overlay mt-4 border-t border-border pt-4", children: "Log out" })] }) })] }))] }));
}
