import { jsx as _jsx } from "react/jsx-runtime";
import { lazy, Suspense } from "react";
const LandingPage = lazy(() => import("@/features/landing"));
export default function LandingPageWrapper() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "flex min-h-screen items-center justify-center bg-[var(--bg-base)]", children: _jsx("div", { className: "h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" }) }), children: _jsx(LandingPage, {}) }));
}
