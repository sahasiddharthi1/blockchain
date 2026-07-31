import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Blocks, Compass, Pickaxe, Wallet, ArrowLeftRight, BarChart3, Network, User, Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
const GROUPS = [
    {
        title: "Platform", items: [
            { to: "/dashboard", label: "Dashboard", icon: Blocks },
            { to: "/explorer", label: "Explorer", icon: Compass },
            { to: "/mining", label: "Mining", icon: Pickaxe },
            { to: "/wallet", label: "Wallet", icon: Wallet },
            { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
            { to: "/analytics", label: "Analytics", icon: BarChart3 },
            { to: "/network", label: "Network", icon: Network },
        ],
    },
    {
        title: "Account", items: [
            { to: "/profile", label: "Profile", icon: User },
            { to: "/settings", label: "Settings", icon: Settings },
        ],
    },
];
export function AppSidebar() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("ledgerforge-auth");
        localStorage.removeItem("lf_access_token");
        localStorage.removeItem("lf_refresh_token");
        navigate("/login");
    };
    return (_jsxs("aside", { className: "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 sidebar-surface", children: [_jsxs("div", { className: "flex h-16 items-center gap-3 px-5 border-b border-border/60", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-signal to-accent-blue", children: _jsx(Blocks, { className: "h-4 w-4 text-white" }) }), _jsx("span", { className: "font-semibold tracking-tight text-paper", children: "Ledgerforge" })] }), _jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-4", children: GROUPS.map((group) => (_jsxs("div", { className: "mb-4", children: [_jsx("div", { className: "px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-widest text-paper-weak", children: group.title }), _jsx("ul", { className: "space-y-0.5", children: group.items.map((item) => (_jsx("li", { children: _jsxs(NavLink, { to: item.to, className: ({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${isActive
                                        ? "bg-signal-soft text-signal font-medium shadow-[inset_0_0_0_1px_rgba(124,92,252,0.25)]"
                                        : "text-paper-muted hover:text-paper hover:bg-ink-overlay"}`, children: [_jsx(item.icon, { className: "h-4 w-4 shrink-0" }), _jsx("span", { className: "truncate", children: item.label })] }) }, item.to))) })] }, group.title))) }), _jsx("div", { className: "border-t border-border/60 p-3", children: _jsxs("button", { onClick: handleLogout, className: "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-paper-muted transition-all hover:text-paper hover:bg-ink-overlay", children: [_jsx(LogOut, { className: "h-4 w-4 shrink-0" }), _jsx("span", { children: "Log out" })] }) })] }));
}
