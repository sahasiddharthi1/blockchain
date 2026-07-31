import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
const LandingPage = lazy(() => import("@/features/landing"));
const LoginPage = lazy(() => import("@/features/auth/login"));
const RegisterPage = lazy(() => import("@/features/auth/register"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/features/auth/reset-password"));
const AuthenticatedRoutes = lazy(() => import("@/routes/authenticated"));
const LoadingRoute = () => (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-ink", children: _jsx("div", { className: "h-8 w-8 rounded-full border-2 border-signal border-t-transparent animate-spin" }) }));
export default function Router() {
    return (_jsx(Suspense, { fallback: _jsx(LoadingRoute, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPasswordPage, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPasswordPage, {}) }), _jsx(Route, { path: "/*", element: _jsx(ProtectedRoute, {}) })] }) }));
}
function ProtectedRoute() {
    const isAuth = typeof window !== "undefined" && Boolean(localStorage.getItem("ledgerforge-auth"));
    return isAuth ? _jsx(AuthenticatedRoutes, {}) : _jsx(Navigate, { to: "/login", replace: true });
}
