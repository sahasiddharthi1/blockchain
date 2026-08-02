import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { api } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { Wifi, WifiOff, LogOut, User } from "lucide-react";
export default function Settings() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState("login");
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const loggedIn = Boolean(localStorage.getItem("lf_access_token"));
    const { connected } = useWebSocket();
    async function handleSubmit(e) {
        e.preventDefault();
        setStatus(null);
        setError(null);
        try {
            const { access_token, refresh_token } = mode === "login" ? await api.login(email, password) : await api.register(email, password);
            localStorage.setItem("lf_access_token", access_token);
            localStorage.setItem("lf_refresh_token", refresh_token);
            localStorage.setItem("ledgerforge-auth", "true");
            setStatus("Signed in — mining is now enabled.");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        }
    }
    function handleLogout() {
        localStorage.removeItem("lf_access_token");
        localStorage.removeItem("lf_refresh_token");
        localStorage.removeItem("ledgerforge-auth");
        setStatus("Signed out");
    }
    return (_jsxs("div", { className: "mx-auto max-w-3xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Settings" }), _jsx("p", { className: "mt-1 text-sm text-paper-muted", children: "Operator authentication and system status." })] }), _jsx("div", { className: "rounded-xl border border-border bg-ink-card p-6", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-xl ${connected ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`, children: connected ? _jsx(Wifi, { className: "h-5 w-5" }) : _jsx(WifiOff, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold", children: "WebSocket Connection" }), _jsx("p", { className: "text-xs text-paper-muted", children: "Live updates for mining, blocks, and transactions" })] })] }), _jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${connected ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`, children: [_jsx("span", { className: `h-1.5 w-1.5 rounded-full ${connected ? "bg-success" : "bg-danger"}` }), connected ? "Connected" : "Disconnected"] })] }) }), loggedIn ? (_jsxs("div", { className: "rounded-xl border border-border bg-ink-card p-6", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-signal-soft text-signal", children: _jsx(User, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold", children: "Authenticated" }), _jsx("p", { className: "text-xs text-paper-muted", children: "You're signed in as an operator." })] })] }), _jsxs("button", { onClick: handleLogout, className: "inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-ink-overlay hover:border-border-light", children: [_jsx(LogOut, { className: "h-4 w-4" }), "Log out"] })] }), status && _jsx("div", { className: "mt-4 text-sm text-success", children: status })] })) : (_jsxs("div", { className: "rounded-xl border border-border bg-ink-card p-6", children: [_jsx("h3", { className: "text-sm font-semibold mb-4", children: "Operator Login" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("label", { className: "flex items-center gap-2 text-paper-muted cursor-pointer", children: [_jsx("input", { type: "radio", checked: mode === "login", onChange: () => setMode("login"), className: "accent-signal" }), "Log in"] }), _jsxs("label", { className: "flex items-center gap-2 text-paper-muted cursor-pointer", children: [_jsx("input", { type: "radio", checked: mode === "register", onChange: () => setMode("register"), className: "accent-signal" }), "Register"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-paper-muted mb-1.5", children: "Email" }), _jsx("input", { type: "email", placeholder: "operator@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-paper-muted mb-1.5", children: "Password" }), _jsx("input", { type: "password", placeholder: "Min 12 characters", value: password, onChange: (e) => setPassword(e.target.value), minLength: 12, required: true, className: "w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all" })] }), _jsx("button", { type: "submit", className: "w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90", children: mode === "login" ? "Log in" : "Register" })] })] })), error && (_jsx("div", { className: "rounded-xl border border-danger/30 bg-danger-soft px-5 py-3 text-sm text-danger", role: "alert", children: error })), status && !loggedIn && _jsx("div", { className: "text-sm text-success", children: status })] }));
}
