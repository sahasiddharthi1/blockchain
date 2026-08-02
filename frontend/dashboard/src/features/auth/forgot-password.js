import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import AuthLayout from "./auth-layout";
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState(null);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // The API always reports success (to avoid account enumeration), so
            // show the neutral "check your inbox" message regardless.
            await api.forgotPassword(email);
            setSent(true);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(AuthLayout, { title: "Reset your password", subtitle: "Enter your email and we'll send you a reset link.", children: sent ? (_jsxs("div", { className: "mt-8 space-y-5", children: [_jsxs("div", { className: "rounded-xl border border-success/30 bg-success-soft px-5 py-4 text-sm text-paper", role: "status", children: ["If an account exists for ", _jsx("span", { className: "font-medium", children: email }), ", a password reset link has been sent. Check your inbox (and spam folder)."] }), _jsx(Link, { to: "/login", className: "block rounded-xl border border-border px-4 py-2.5 text-center text-sm font-medium text-paper transition-colors hover:bg-ink-overlay hover:border-border-light", children: "Back to sign in" })] })) : (_jsxs("form", { onSubmit: handleSubmit, className: "mt-8 space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-paper-muted mb-1.5", children: "Email" }), _jsx("input", { type: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90 disabled:opacity-50", children: loading ? "Sending…" : "Send Reset Link" }), error && (_jsx("div", { className: "rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger", role: "alert", children: error })), _jsx("div", { className: "text-center text-sm text-paper-muted", children: _jsx(Link, { to: "/login", className: "text-signal hover:text-signal/80 transition-colors", children: "Back to sign in" }) })] })) }));
}
