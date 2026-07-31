import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import AuthLayout from "./auth-layout";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { access_token, refresh_token } = await api.login(email, password);
            localStorage.setItem("lf_access_token", access_token);
            localStorage.setItem("lf_refresh_token", refresh_token);
            localStorage.setItem("ledgerforge-auth", "true");
            navigate("/dashboard");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(AuthLayout, { title: "Sign in", subtitle: "Enter your credentials to access your blockchain workspace.", children: _jsxs("form", { onSubmit: handleSubmit, className: "mt-8 space-y-5", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-paper-muted mb-1.5", children: "Email" }), _jsx("input", { type: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-paper-muted mb-1.5", children: "Password" }), _jsx("input", { type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all" })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("label", { className: "flex items-center gap-2 text-paper-muted cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "rounded accent-signal" }), "Remember me"] }), _jsx(Link, { to: "/forgot-password", className: "text-signal hover:text-signal/80 transition-colors", children: "Forgot password?" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90 disabled:opacity-50", children: loading ? "Signing in..." : "Sign In" }), error && (_jsx("div", { className: "rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger", role: "alert", children: error }))] }), _jsxs("div", { className: "text-center text-sm text-paper-muted", children: ["Don't have an account?", " ", _jsx(Link, { to: "/register", className: "text-signal hover:text-signal/80 transition-colors font-medium", children: "Create one" })] })] }) }));
}
