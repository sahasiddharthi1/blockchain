import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { BackgroundOrbs } from "@/components/layout/background-orbs";
export function AuthenticatedLayout({ children }) {
    return (_jsxs("div", { className: "flex min-h-screen bg-grid", children: [_jsx(BackgroundOrbs, {}), _jsx(AppSidebar, {}), _jsxs("div", { className: "relative z-10 flex flex-1 flex-col md:pl-64", children: [_jsx(AppHeader, {}), _jsx("main", { className: "flex-1 p-4 sm:p-6 lg:p-8", children: children })] })] }));
}
