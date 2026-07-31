import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { AuthenticatedLayout } from "@/layouts/authenticated";
import Dashboard from "@/features/dashboard";
import Explorer from "@/features/explorer";
import Mining from "@/features/mining";
import Wallet from "@/features/wallet";
import Transactions from "@/features/transactions";
import Analytics from "@/features/analytics";
import Network from "@/features/network";
import Profile from "@/features/profile";
import Settings from "@/features/settings";
const Loading = () => (_jsx("div", { className: "flex min-h-[50vh] items-center justify-center", children: _jsx("div", { className: "h-8 w-8 rounded-full border-2 border-signal border-t-transparent animate-spin" }) }));
export default function AuthenticatedRoutes() {
    return (_jsx(AuthenticatedLayout, { children: _jsx(Suspense, { fallback: _jsx(Loading, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/explorer", element: _jsx(Explorer, {}) }), _jsx(Route, { path: "/mining", element: _jsx(Mining, {}) }), _jsx(Route, { path: "/wallet", element: _jsx(Wallet, {}) }), _jsx(Route, { path: "/transactions", element: _jsx(Transactions, {}) }), _jsx(Route, { path: "/analytics", element: _jsx(Analytics, {}) }), _jsx(Route, { path: "/network", element: _jsx(Network, {}) }), _jsx(Route, { path: "/profile", element: _jsx(Profile, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }) }) }));
}
