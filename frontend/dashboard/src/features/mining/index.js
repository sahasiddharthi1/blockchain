import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { Play, Square, Pickaxe, Blocks, Hash, Zap } from "lucide-react";
import { api } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
const tooltipStyle = {
    contentStyle: { background: "#181828", border: "1px solid #2a2a40", borderRadius: "8px", fontSize: "12px", color: "#e8e8ed" },
    labelStyle: { color: "#9a9aae" },
};
export default function MiningPage() {
    const [state, setState] = useState("idle");
    const [lastBlock, setLastBlock] = useState(null);
    const [blockCount, setBlockCount] = useState(0);
    const [error, setError] = useState(null);
    const [mining, setMining] = useState(false);
    const [blocks, setBlocks] = useState([]);
    const { connected, subscribe } = useWebSocket();
    useEffect(() => {
        api.listBlocks(0, 20).then((res) => {
            setBlocks(res.blocks);
            setBlockCount(res.total);
            if (res.blocks.length > 0)
                setLastBlock(res.blocks[0]);
        }).catch(() => { });
    }, []);
    useEffect(() => {
        const unsub = subscribe("block:new", (payload) => {
            const block = payload;
            setBlocks((prev) => [block, ...prev].slice(0, 20));
            setLastBlock(block);
            setBlockCount((c) => c + 1);
            setState("idle");
            setMining(false);
        });
        return unsub;
    }, [subscribe]);
    const handleMine = useCallback(async () => {
        if (mining)
            return;
        setMining(true);
        setState("mining");
        setError(null);
        try {
            const block = await api.mineNow();
            setBlocks((prev) => [block, ...prev].slice(0, 20));
            setLastBlock(block);
            setBlockCount((c) => c + 1);
            setState("idle");
        }
        catch (err) {
            setState("stopped");
            setError(err instanceof Error ? err.message : "Mining failed");
        }
        finally {
            setMining(false);
        }
    }, [mining]);
    const sorted = [...blocks].sort((a, b) => a.index - b.index);
    const chartData = sorted.map((b) => ({ index: b.index, nonce: b.nonce, difficulty: b.difficulty }));
    const hashrateData = chartData.map((d) => ({ ...d, nonce: d.nonce > 0 ? Math.round(d.nonce / 1000) : 0 }));
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [_jsxs("div", { className: "animate-fade-in flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "bg-gradient-to-r from-signal to-accent-cyan bg-clip-text text-2xl font-bold tracking-tight text-transparent", children: "Mining" }), _jsx("p", { className: "mt-1 text-sm text-paper-muted", children: connected ? (_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-success glow-pulse" }), " Live"] })) : (_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-danger" }), " Disconnected"] })) })] }), _jsxs("button", { onClick: handleMine, disabled: mining, className: `inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 ${mining ? "bg-danger text-white" : "bg-signal text-white hover:bg-signal/90 hover:shadow-[0_0_24px_-4px_var(--color-signal)]"}`, children: [mining ? _jsx(Square, { className: "h-4 w-4 animate-pulse" }) : _jsx(Play, { className: "h-4 w-4" }), mining ? "Mining..." : "Mine Block"] })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
                    { label: "Status", value: mining ? "Mining" : state === "stopped" ? "Stopped" : "Idle", icon: Zap,
                        color: mining ? "text-success" : state === "stopped" ? "text-danger" : "text-paper-muted" },
                    { label: "Blocks Mined", value: blockCount.toLocaleString(), icon: Blocks },
                    { label: "Last Block", value: lastBlock ? `#${lastBlock.index}` : "—", icon: Pickaxe },
                    { label: "Last Nonce", value: lastBlock ? lastBlock.nonce.toLocaleString() : "—", icon: Hash, mono: true },
                ].map((s, i) => (_jsxs("div", { className: `card-hover group relative overflow-hidden rounded-xl border border-border bg-ink-card p-5 animate-fade-in-up animate-fade-in-up-${i + 1}`, children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-signal/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" }), _jsxs("div", { className: "relative flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-medium uppercase tracking-wider text-paper-muted", children: s.label }), _jsx(s.icon, { className: "h-4 w-4 text-signal" })] }), _jsx("div", { className: `relative mt-3 text-xl font-bold tracking-tight ${s.color || ""} ${s.mono ? "font-mono text-base" : ""}`, children: s.value })] }, s.label))) }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2 animate-fade-in-up animate-fade-in-up-5", children: [_jsxs("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Nonce Trend" }), _jsx("span", { className: "text-xs text-paper-muted", children: "Mining effort per block" })] }), _jsx("div", { className: "h-52", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: hashrateData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "nonceGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#7c5cfc", stopOpacity: 0.35 }), _jsx("stop", { offset: "100%", stopColor: "#7c5cfc", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e1e30" }), _jsx(XAxis, { dataKey: "index", stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(YAxis, { stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(Tooltip, { ...tooltipStyle }), _jsx(Area, { type: "monotone", dataKey: "nonce", stroke: "#7c5cfc", strokeWidth: 2, fill: "url(#nonceGrad)", dot: false })] }) }) })] }), _jsxs("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Difficulty Trend" }), _jsx("span", { className: "text-xs text-paper-muted", children: "Mining difficulty per block" })] }), _jsx("div", { className: "h-52", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: chartData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "diffGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#22d3ee", stopOpacity: 0.35 }), _jsx("stop", { offset: "100%", stopColor: "#22d3ee", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e1e30" }), _jsx(XAxis, { dataKey: "index", stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(YAxis, { stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(Tooltip, { ...tooltipStyle }), _jsx(Area, { type: "monotone", dataKey: "difficulty", stroke: "#22d3ee", strokeWidth: 2, fill: "url(#diffGrad)", dot: false })] }) }) })] })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3 animate-fade-in-up animate-fade-in-up-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Mining Progress" }), _jsx("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "flex-1 h-2 rounded-full bg-ink-overlay overflow-hidden", children: _jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-signal to-accent-cyan transition-all duration-500", style: { width: mining ? "100%" : "0%" } }) }), _jsx("span", { className: "text-sm font-medium text-paper-muted", children: mining ? "Finding nonce..." : "Ready" })] }) }), _jsx("h2", { className: "text-sm font-semibold text-paper", children: "Recent Mined Blocks" }), _jsx("div", { className: "card-hover rounded-xl border border-border bg-ink-card divide-y divide-border", children: !lastBlock ? (_jsx("div", { className: "px-5 py-8 text-center text-sm text-paper-weak", children: "No blocks mined yet." })) : ([lastBlock].map((block) => (_jsxs("div", { className: "flex items-center justify-between px-5 py-3.5 hover:bg-ink-overlay transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Blocks, { className: "h-4 w-4 text-signal" }), _jsxs("span", { className: "text-sm font-medium", children: ["Block #", block.index] })] }), _jsxs("div", { className: "text-xs text-paper-weak font-mono", children: [block.hash.slice(0, 16), "..."] })] }, block.hash)))) })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Last Block Details" }), _jsx("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: lastBlock ? (_jsx("div", { className: "space-y-4", children: [
                                        { label: "Index", value: `#${lastBlock.index}` },
                                        { label: "Hash", value: lastBlock.hash.slice(0, 16) + "...", mono: true },
                                        { label: "Nonce", value: lastBlock.nonce.toLocaleString(), mono: true },
                                        { label: "Difficulty", value: lastBlock.difficulty.toLocaleString() },
                                        { label: "Transactions", value: lastBlock.transactions.length.toLocaleString() },
                                        { label: "Prev Hash", value: lastBlock.prev_hash.slice(0, 12) + "...", mono: true },
                                    ].map((item) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-paper-muted", children: item.label }), _jsx("span", { className: `text-sm font-medium text-paper ${item.mono ? "font-mono text-xs" : ""}`, children: item.value })] }, item.label))) })) : (_jsx("div", { className: "py-4 text-center text-sm text-paper-weak", children: "No blocks mined yet." })) })] })] }), error && (_jsx("div", { className: "rounded-xl border border-danger/30 bg-danger-soft px-5 py-3 text-sm text-danger animate-fade-in", role: "alert", children: error }))] }));
}
