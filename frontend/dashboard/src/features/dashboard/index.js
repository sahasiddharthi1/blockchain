import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Blocks, Pickaxe, Activity, TrendingUp, ArrowUpRight } from "lucide-react";
import { api } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, } from "recharts";
const tooltipStyle = {
    contentStyle: {
        background: "#181828",
        border: "1px solid #2a2a40",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#e8e8ed",
    },
    labelStyle: { color: "#9a9aae" },
};
export default function Dashboard() {
    const [blocks, setBlocks] = useState([]);
    const [height, setHeight] = useState(0);
    const [difficulty, setDifficulty] = useState(0);
    const [mempoolSize, setMempoolSize] = useState(0);
    const [chainValid, setChainValid] = useState(true);
    const [loading, setLoading] = useState(true);
    const { connected, subscribe } = useWebSocket();
    useEffect(() => {
        api.listBlocks(0, 20).then((res) => {
            setBlocks(res.blocks);
            setHeight(res.height);
            setLoading(false);
        }).catch(() => setLoading(false));
        api.analyticsSummary().then((res) => {
            setDifficulty(res.difficulty);
            setMempoolSize(res.mempool_size);
            setChainValid(res.chain_valid);
        }).catch(() => { });
    }, []);
    useEffect(() => {
        const unsub = subscribe("block:new", (payload) => {
            const block = payload;
            setBlocks((prev) => [block, ...prev].slice(0, 20));
            setHeight((h) => Math.max(h, block.index + 1));
        });
        return unsub;
    }, [subscribe]);
    useEffect(() => {
        const unsub = subscribe("blockchain:height", (payload) => {
            setHeight(payload);
        });
        return unsub;
    }, [subscribe]);
    const sorted = [...blocks].sort((a, b) => a.index - b.index);
    const txnData = sorted.map((b) => ({ index: b.index, txs: b.transactions.length }));
    const blockTimeData = sorted.length > 1 ? sorted.slice(1).map((b, i) => ({
        index: b.index,
        seconds: ((b.timestamp - sorted[i].timestamp) / 1e6).toFixed(1),
    })) : [];
    const totalTxns = blocks.reduce((s, b) => s + b.transactions.length, 0);
    const stats = [
        { label: "Chain Height", value: height.toLocaleString(), icon: Blocks },
        { label: "Total Transactions", value: totalTxns.toLocaleString(), icon: Activity },
        { label: "Difficulty", value: difficulty.toLocaleString(), icon: TrendingUp },
        { label: "Chain Valid", value: chainValid ? "Yes" : "No", icon: Pickaxe, color: chainValid ? "text-success" : "text-danger" },
    ];
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-8", children: [_jsxs("div", { className: "animate-fade-in flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "bg-gradient-to-r from-signal to-accent-cyan bg-clip-text text-2xl font-bold tracking-tight text-transparent", children: "Dashboard" }), _jsx("p", { className: "mt-1 text-sm text-paper-muted", children: connected ? (_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-success glow-pulse" }), " Live"] })) : (_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-danger" }), " Disconnected"] })) })] }), _jsxs("a", { href: "/mining", className: "inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90 hover:shadow-[0_0_24px_-4px_var(--color-signal)] active:scale-95", children: [_jsx(Pickaxe, { className: "h-4 w-4" }), "Mine Blocks", _jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })] })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: stats.map((s, i) => (_jsxs("div", { className: `card-hover group relative overflow-hidden rounded-xl border border-border bg-ink-card p-5 animate-fade-in-up animate-fade-in-up-${i + 1}`, children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-signal/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" }), _jsxs("div", { className: "relative flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-medium uppercase tracking-wider text-paper-muted", children: s.label }), _jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-signal-soft text-signal group-hover:scale-110 transition-transform", children: _jsx(s.icon, { className: "h-4 w-4" }) })] }), _jsx("div", { className: `relative mt-3 text-2xl font-bold tracking-tight ${s.color || ""}`, children: loading ? _jsx("span", { className: "shimmer inline-block w-20 h-6 rounded" }) : s.value })] }, s.label))) }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2 animate-fade-in-up animate-fade-in-up-5", children: [_jsxs("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Block Production" }), _jsx("span", { className: "text-xs text-paper-muted", children: "Transactions per block" })] }), _jsx("div", { className: "h-56", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: txnData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "txnGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#7c5cfc", stopOpacity: 0.4 }), _jsx("stop", { offset: "100%", stopColor: "#7c5cfc", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e1e30" }), _jsx(XAxis, { dataKey: "index", stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(YAxis, { stroke: "#6a6a7e", tick: { fontSize: 11 }, allowDecimals: false }), _jsx(Tooltip, { ...tooltipStyle }), _jsx(Area, { type: "monotone", dataKey: "txs", stroke: "#7c5cfc", strokeWidth: 2, fill: "url(#txnGrad)", dot: false })] }) }) })] }), _jsxs("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Block Time" }), _jsx("span", { className: "text-xs text-paper-muted", children: "Seconds between blocks" })] }), _jsx("div", { className: "h-56", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: blockTimeData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e1e30" }), _jsx(XAxis, { dataKey: "index", stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(YAxis, { stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(Tooltip, { ...tooltipStyle }), _jsx(Bar, { dataKey: "seconds", fill: "#22d3ee", radius: [3, 3, 0, 0] })] }) }) })] })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3 animate-fade-in-up animate-fade-in-up-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Recent Blocks" }), _jsx("a", { href: "/explorer", className: "text-xs font-medium text-signal hover:text-signal/80 transition-colors", children: "View all" })] }), _jsx("div", { className: "rounded-xl border border-border bg-ink-card divide-y divide-border", children: loading ? (_jsx("div", { className: "px-5 py-8 text-center text-sm text-paper-weak", children: "Loading blocks..." })) : blocks.length === 0 ? (_jsx("div", { className: "px-5 py-8 text-center text-sm text-paper-weak", children: "No blocks yet. Start mining!" })) : (blocks.slice(0, 6).map((block, i) => (_jsxs("div", { className: `card-hover flex items-center justify-between px-5 py-3.5 transition-all hover:bg-ink-overlay animate-fade-in-up animate-fade-in-up-${i + 1}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-signal-soft text-signal", children: _jsx(Blocks, { className: "h-4 w-4" }) }), _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-medium", children: ["Block #", block.index] }), _jsxs("div", { className: "text-xs font-mono text-paper-weak", children: [block.hash.slice(0, 20), "..."] })] })] }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-paper-weak", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Activity, { className: "h-3 w-3" }), new Date(block.timestamp / 1e6).toLocaleTimeString()] }), _jsxs("span", { children: [block.transactions.length, " tx"] })] })] }, block.hash)))) })] }), _jsxs("div", { className: "space-y-4 animate-fade-in-up animate-fade-in-up-7", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Mining Status" }), _jsx("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: _jsx("div", { className: "space-y-4", children: [
                                        { label: "Status", value: connected ? "Connected" : "Offline", color: connected ? "text-success" : "text-danger" },
                                        { label: "Difficulty", value: difficulty.toLocaleString() },
                                        { label: "Mempool Size", value: mempoolSize.toLocaleString() },
                                        { label: "Chain Valid", value: chainValid ? "Yes" : "No", color: chainValid ? "text-success" : "text-danger" },
                                    ].map((item) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-paper-muted", children: item.label }), _jsx("span", { className: `text-sm font-medium ${item.color || "text-paper"}`, children: loading ? _jsx("span", { className: "shimmer inline-block w-12 h-4 rounded" }) : item.value })] }, item.label))) }) }), _jsx("h2", { className: "text-sm font-semibold text-paper", children: "Chain Height" }), _jsx("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-signal to-accent-blue", children: _jsx(Blocks, { className: "h-6 w-6 text-white" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold tracking-tight", children: loading ? _jsx("span", { className: "shimmer inline-block w-16 h-7 rounded" }) : `#${height.toLocaleString()}` }), _jsx("div", { className: "text-xs text-paper-weak", children: connected ? "Live" : "Last known" })] })] }) })] })] })] }));
}
