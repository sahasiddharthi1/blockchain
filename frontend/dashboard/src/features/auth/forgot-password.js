import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import AuthLayout from "./auth-layout";
export default function ForgotPasswordPage() {
    return (_jsx(AuthLayout, { title: "Reset your password", subtitle: "Enter your email and we'll send you a reset link.", children: _jsxs("form", { className: "mt-8 space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-paper-muted mb-1.5", children: "Email" }), _jsx("input", { type: "email", placeholder: "you@example.com", className: "w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all" })] }), _jsx("button", { type: "submit", className: "w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90", children: "Send Reset Link" }), _jsx("div", { className: "text-center text-sm text-paper-muted", children: _jsx(Link, { to: "/login", className: "text-signal hover:text-signal/80 transition-colors", children: "Back to sign in" }) })] }) }));
}
