import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Clock, Blocks, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, } from "recharts";
const tooltipStyle = {
    contentStyle: { background: "#181828", border: "1px solid #2a2a40", borderRadius: "8px", fontSize: "12px", color: "#e8e8ed" },
    labelStyle: { color: "#9a9aae" },
};
export default function AnalyticsPage() {
    const [blocks, setBlocks] = useState([]);
    const [height, setHeight] = useState(0);
    const [difficulty, setDifficulty] = useState(0);
    const [mempoolSize, setMempoolSize] = useState(0);
    const [chainValid, setChainValid] = useState(true);
    const [totalBlocks, setTotalBlocks] = useState(0);
    const [loading, setLoading] = useState(true);
    const { subscribe } = useWebSocket();
    useEffect(() => {
        api.listBlocks(0, 50).then((res) => {
            setBlocks(res.blocks);
            setTotalBlocks(res.total);
        }).catch(() => { });
        api.analyticsSummary().then((res) => {
            setHeight(res.chain_height);
            setDifficulty(res.difficulty);
            setMempoolSize(res.mempool_size);
            setChainValid(res.chain_valid);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);
    useEffect(() => {
        const unsub = subscribe("blockchain:height", (payload) => {
            setHeight(payload);
            setTotalBlocks((c) => c + 1);
        });
        return unsub;
    }, [subscribe]);
    const sorted = [...blocks].sort((a, b) => a.index - b.index);
    const totalTxns = blocks.reduce((s, b) => s + b.transactions.length, 0);
    const txnData = sorted.map((b) => ({ index: b.index, txs: b.transactions.length }));
    const diffData = sorted.map((b) => ({ index: b.index, difficulty: b.difficulty }));
    const blockTimeData = sorted.length > 1 ? sorted.slice(1).map((b, i) => ({
        index: b.index,
        seconds: ((b.timestamp - sorted[i].timestamp) / 1e6).toFixed(1),
    })) : [];
    const metrics = [
        { label: "Avg Block Time", value: blockTimeData.length > 0
                ? `${(blockTimeData.reduce((s, d) => s + Number(d.seconds), 0) / blockTimeData.length).toFixed(0)}s` : "—",
            icon: Clock },
        { label: "Difficulty", value: difficulty.toLocaleString(), icon: TrendingUp },
        { label: "Total Txns", value: totalTxns.toLocaleString(), icon: BarChart3 },
        { label: "Blocks Mined", value: totalBlocks.toLocaleString(), icon: Blocks },
    ];
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [_jsxs("div", { className: "animate-fade-in", children: [_jsx("h1", { className: "bg-gradient-to-r from-signal to-accent-cyan bg-clip-text text-2xl font-bold tracking-tight text-transparent", children: "Analytics" }), _jsx("p", { className: "mt-1 text-sm text-paper-muted", children: loading ? "Loading..." : `Chain height: #${height.toLocaleString()}` })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: metrics.map((m, i) => (_jsxs("div", { className: `card-hover group relative overflow-hidden rounded-xl border border-border bg-ink-card p-5 animate-fade-in-up animate-fade-in-up-${i + 1}`, children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-signal/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" }), _jsxs("div", { className: "relative flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-medium uppercase tracking-wider text-paper-muted", children: m.label }), _jsx(m.icon, { className: "h-4 w-4 text-signal" })] }), _jsx("div", { className: "relative mt-3 text-xl font-bold tracking-tight", children: loading ? _jsx("span", { className: "shimmer inline-block w-16 h-6 rounded" }) : m.value })] }, m.label))) }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2 animate-fade-in-up animate-fade-in-up-5", children: [_jsxs("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Transaction Volume" }), _jsx("span", { className: "text-xs text-paper-muted", children: "Per block" })] }), _jsx("div", { className: "h-52", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: txnData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "av", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#7c5cfc", stopOpacity: 0.4 }), _jsx("stop", { offset: "100%", stopColor: "#7c5cfc", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e1e30" }), _jsx(XAxis, { dataKey: "index", stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(YAxis, { stroke: "#6a6a7e", tick: { fontSize: 11 }, allowDecimals: false }), _jsx(Tooltip, { ...tooltipStyle }), _jsx(Area, { type: "monotone", dataKey: "txs", stroke: "#7c5cfc", strokeWidth: 2, fill: "url(#av)", dot: false })] }) }) })] }), _jsxs("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Difficulty Over Time" }), _jsx("span", { className: "text-xs text-paper-muted", children: "Mining difficulty per block" })] }), _jsx("div", { className: "h-52", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: diffData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "ad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#22d3ee", stopOpacity: 0.35 }), _jsx("stop", { offset: "100%", stopColor: "#22d3ee", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e1e30" }), _jsx(XAxis, { dataKey: "index", stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(YAxis, { stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(Tooltip, { ...tooltipStyle }), _jsx(Area, { type: "monotone", dataKey: "difficulty", stroke: "#22d3ee", strokeWidth: 2, fill: "url(#ad)", dot: false })] }) }) })] }), _jsxs("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Block Time" }), _jsx("span", { className: "text-xs text-paper-muted", children: "Seconds between consecutive blocks" })] }), _jsx("div", { className: "h-52", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: blockTimeData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e1e30" }), _jsx(XAxis, { dataKey: "index", stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(YAxis, { stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(Tooltip, { ...tooltipStyle }), _jsx(Bar, { dataKey: "seconds", fill: "#7c5cfc", radius: [3, 3, 0, 0] })] }) }) })] }), _jsxs("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-6", children: [_jsx("h3", { className: "text-sm font-semibold mb-2", children: "Chain Status" }), _jsxs("div", { className: "flex items-center gap-3 mt-4", children: [_jsx(ShieldCheck, { className: `h-8 w-8 ${chainValid ? "text-success" : "text-danger"}` }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-bold", children: chainValid ? "Chain Valid" : "Chain Invalid" }), _jsx("div", { className: "text-xs text-paper-muted", children: "Full hash-chain verification" })] })] }), _jsx("div", { className: "mt-6 space-y-3", children: [
                                    { label: "Chain Height", value: `#${height.toLocaleString()}` },
                                    { label: "Current Difficulty", value: difficulty.toLocaleString() },
                                    { label: "Mempool Size", value: mempoolSize.toLocaleString() },
                                    { label: "Total Blocks", value: totalBlocks.toLocaleString() },
                                    { label: "Total Transactions", value: totalTxns.toLocaleString() },
                                ].map((item) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-paper-muted", children: item.label }), _jsx("span", { className: "font-medium", children: loading ? _jsx("span", { className: "shimmer inline-block w-12 h-4 rounded" }) : item.value })] }, item.label))) }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { className: "text-paper-muted", children: "Mempool Pressure" }), _jsx("span", { className: "font-medium", children: mempoolSize.toLocaleString() })] }), _jsx("div", { className: "h-2 rounded-full bg-ink-overlay overflow-hidden", children: _jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-warning to-danger transition-all", style: { width: loading ? "0%" : `${Math.min((mempoolSize / 100) * 100, 100)}%` } }) })] })] })] })] }));
}
