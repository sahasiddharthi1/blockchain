import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { formatCompactHash } from "@/lib/format";
export default function BlockchainExplorer() {
    const [blocks, setBlocks] = useState([]);
    const [height, setHeight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { lastEvent } = useWebSocket();
    async function load() {
        try {
            setLoading(true);
            const res = await api.listBlocks(0, 50);
            setBlocks(res.blocks.slice().reverse());
            setHeight(res.height);
            setError(null);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load blocks");
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
    }, []);
    useEffect(() => {
        if (lastEvent?.topic === "block:new") {
            load();
        }
    }, [lastEvent]);
    if (loading && blocks.length === 0)
        return _jsx("p", { children: "Loading chain\u2026" });
    if (error)
        return _jsxs("p", { role: "alert", children: ["Error: ", error] });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-[var(--text-strong)]", children: "Blockchain Explorer" }), _jsxs("p", { className: "text-sm text-[var(--text-weak)]", children: ["Chain height: ", height] })] }), _jsx("button", { onClick: load, className: "btn btn-secondary", children: "Refresh" })] }), _jsx("div", { className: "card overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-[var(--border)]", children: [_jsx("th", { className: "px-4 py-3 font-semibold text-[var(--text-weak)]", children: "Index" }), _jsx("th", { className: "px-4 py-3 font-semibold text-[var(--text-weak)]", children: "Hash" }), _jsx("th", { className: "px-4 py-3 font-semibold text-[var(--text-weak)]", children: "Prev Hash" }), _jsx("th", { className: "px-4 py-3 font-semibold text-[var(--text-weak)]", children: "Txs" }), _jsx("th", { className: "px-4 py-3 font-semibold text-[var(--text-weak)]", children: "Nonce" })] }) }), _jsx("tbody", { children: blocks.map((b) => (_jsxs("tr", { className: "border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-layer-2)]", children: [_jsx("td", { className: "px-4 py-3 font-medium text-[var(--text-strong)]", children: b.index }), _jsx("td", { className: "px-4 py-3 font-mono text-xs text-[var(--text-weak)]", title: b.hash, children: formatCompactHash(b.hash) }), _jsx("td", { className: "px-4 py-3 font-mono text-xs text-[var(--text-weak)]", title: b.prev_hash, children: b.prev_hash ? formatCompactHash(b.prev_hash) : "—" }), _jsx("td", { className: "px-4 py-3 text-[var(--text-strong)]", children: b.transactions?.length ?? 0 }), _jsx("td", { className: "px-4 py-3 font-mono text-xs text-[var(--text-strong)]", children: b.nonce })] }, b.index))) })] }) }) })] }));
}
