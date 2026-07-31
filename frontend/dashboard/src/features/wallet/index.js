import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { api } from "../../lib/api";
import { Wallet, Copy, Check, Search } from "lucide-react";
export default function WalletPage() {
    const [created, setCreated] = useState(null);
    const [lookupAddress, setLookupAddress] = useState("");
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    async function handleCreate() {
        setError(null);
        try {
            const wallet = await api.createWallet();
            setCreated(wallet);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Failed to create wallet");
        }
    }
    async function handleLookup(e) {
        e.preventDefault();
        setError(null);
        try {
            const res = await api.getBalance(lookupAddress.trim());
            setBalance(res.balance);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Failed to fetch balance");
        }
    }
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsxs("div", { className: "mx-auto max-w-4xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Wallet" }), _jsx("p", { className: "mt-1 text-sm text-paper-muted", children: "Generate wallets and check balances on the Ledgerforge chain." })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs("div", { className: "rounded-xl border border-border bg-ink-card p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-signal-soft text-signal", children: _jsx(Wallet, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold", children: "Generate Wallet" }), _jsx("p", { className: "text-xs text-paper-muted", children: "Create a new ECDSA key pair" })] })] }), _jsx("button", { onClick: handleCreate, className: "w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90", children: "Generate new wallet" }), created && (_jsxs("div", { className: "mt-4 rounded-xl border border-border bg-ink-overlay p-4 space-y-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-xs font-medium text-paper-muted", children: "Address" }), _jsx("button", { onClick: () => copyToClipboard(created.address), className: "text-paper-weak hover:text-paper transition-colors", children: copied ? _jsx(Check, { className: "h-3.5 w-3.5 text-success" }) : _jsx(Copy, { className: "h-3.5 w-3.5" }) })] }), _jsx("code", { className: "block text-xs font-mono text-paper break-all bg-ink px-2 py-1 rounded", children: created.address })] }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-medium text-paper-muted", children: "Private key (shown once \u2014 save it now)" }), _jsx("code", { className: "block mt-1 text-xs font-mono text-warning break-all bg-ink px-2 py-1 rounded", children: created.private_key })] })] }))] }), _jsxs("div", { className: "rounded-xl border border-border bg-ink-card p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/10 text-accent-cyan", children: _jsx(Search, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold", children: "Check Balance" }), _jsx("p", { className: "text-xs text-paper-muted", children: "Look up any address balance" })] })] }), _jsxs("form", { onSubmit: handleLookup, className: "space-y-3", children: [_jsx("input", { value: lookupAddress, onChange: (e) => setLookupAddress(e.target.value), placeholder: "Enter address (LF...)", className: "w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all" }), _jsx("button", { type: "submit", className: "w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-paper transition-all hover:bg-ink-overlay hover:border-border-light", children: "Check" })] }), balance !== null && (_jsx("div", { className: "mt-4 rounded-xl border border-border bg-ink-overlay p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-medium text-paper-muted", children: "Balance" }), _jsxs("span", { className: "text-lg font-bold text-signal", children: [balance, " LGF"] })] }) }))] })] }), error && (_jsx("div", { className: "rounded-xl border border-danger/30 bg-danger-soft px-5 py-3 text-sm text-danger", role: "alert", children: error }))] }));
}
