import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Search, ArrowUpRight, ArrowDownRight, Pickaxe } from "lucide-react";
import { api } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
const tooltipStyle = {
    contentStyle: { background: "#181828", border: "1px solid #2a2a40", borderRadius: "8px", fontSize: "12px", color: "#e8e8ed" },
    labelStyle: { color: "#9a9aae" },
};
function decodeTx(raw, blockIndex) {
    try {
        const json = atob(raw);
        const tx = JSON.parse(json);
        return {
            id: tx.id || raw.slice(0, 16),
            type: tx.from === "coinbase" ? "mining" : "receive",
            status: "confirmed",
            amount: tx.amount || 0,
            from: tx.from || "unknown",
            to: tx.to || "unknown",
            block: blockIndex,
            time: tx.timestamp ? new Date(tx.timestamp / 1e6).toISOString() : new Date().toISOString(),
        };
    }
    catch {
        return {
            id: raw.slice(0, 16),
            type: "data",
            status: "confirmed",
            amount: 0,
            from: "genesis",
            to: "genesis",
            block: blockIndex,
            time: new Date().toISOString(),
        };
    }
}
export default function TransactionsPage() {
    const [txs, setTxs] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { subscribe } = useWebSocket();
    useEffect(() => {
        api.listBlocks(0, 50).then((res) => {
            setBlocks(res.blocks);
            const all = [];
            for (const block of res.blocks) {
                for (const raw of block.transactions) {
                    const decoded = decodeTx(raw, block.index);
                    if (decoded)
                        all.push(decoded);
                }
            }
            setTxs(all);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);
    useEffect(() => {
        const unsub = subscribe("block:new", (payload) => {
            const block = payload;
            setBlocks((prev) => [block, ...prev].slice(0, 50));
            const newTxs = [];
            for (const raw of block.transactions) {
                const decoded = decodeTx(raw, block.index);
                if (decoded)
                    newTxs.push(decoded);
            }
            if (newTxs.length > 0)
                setTxs((prev) => [...newTxs, ...prev]);
        });
        return unsub;
    }, [subscribe]);
    const sorted = [...blocks].sort((a, b) => a.index - b.index);
    const chartData = sorted.map((b) => ({ index: b.index, txs: b.transactions.length }));
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [_jsxs("div", { className: "animate-fade-in", children: [_jsx("h1", { className: "bg-gradient-to-r from-signal to-accent-cyan bg-clip-text text-2xl font-bold tracking-tight text-transparent", children: "Transactions" }), _jsx("p", { className: "mt-1 text-sm text-paper-muted", children: loading ? "Loading..." : `${txs.length} transactions found` })] }), _jsxs("div", { className: "relative max-w-md animate-fade-in-up animate-fade-in-up-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-paper-weak" }), _jsx("input", { placeholder: "Search by ID, sender, or receiver...", className: "w-full rounded-xl border border-border bg-ink-card px-9 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all" })] }), chartData.length > 1 && (_jsxs("div", { className: "card-hover rounded-xl border border-border bg-ink-card p-5 animate-fade-in-up animate-fade-in-up-2", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-sm font-semibold text-paper", children: "Transaction Volume" }), _jsx("span", { className: "text-xs text-paper-muted", children: "Txns per block" })] }), _jsx("div", { className: "h-48", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e1e30" }), _jsx(XAxis, { dataKey: "index", stroke: "#6a6a7e", tick: { fontSize: 11 } }), _jsx(YAxis, { stroke: "#6a6a7e", tick: { fontSize: 11 }, allowDecimals: false }), _jsx(Tooltip, { ...tooltipStyle }), _jsx(Bar, { dataKey: "txs", fill: "#22d3ee", radius: [3, 3, 0, 0] })] }) }) })] })), _jsx("div", { className: "card-hover rounded-xl border border-border bg-ink-card overflow-hidden animate-fade-in-up animate-fade-in-up-3", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border", children: [_jsx("th", { className: "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-paper-weak", children: "Type" }), _jsx("th", { className: "px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-paper-weak", children: "Amount" }), _jsx("th", { className: "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-paper-weak", children: "From" }), _jsx("th", { className: "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-paper-weak", children: "To" }), _jsx("th", { className: "px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-paper-weak", children: "Block" })] }) }), _jsx("tbody", { className: "divide-y divide-border", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-5 py-8 text-center text-sm text-paper-weak", children: "Loading transactions..." }) })) : txs.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-5 py-8 text-center text-sm text-paper-weak", children: "No transactions yet." }) })) : (txs.map((tx, i) => (_jsxs("tr", { className: `transition-colors hover:bg-ink-overlay animate-fade-in-up animate-fade-in-up-${(i % 8) + 1}`, children: [_jsx("td", { className: "px-5 py-3", children: _jsxs("span", { className: "flex items-center gap-1.5 text-sm capitalize", children: [tx.type === "send" ? _jsx(ArrowUpRight, { className: "h-3.5 w-3.5 text-danger" }) :
                                                        tx.type === "receive" || tx.type === "mining" ? _jsx(ArrowDownRight, { className: "h-3.5 w-3.5 text-success" }) :
                                                            _jsx(Pickaxe, { className: "h-3.5 w-3.5 text-signal" }), tx.type] }) }), _jsxs("td", { className: `px-5 py-3 text-right text-sm font-semibold ${tx.type === "send" ? "text-danger" : "text-success"}`, children: [tx.type === "send" ? "-" : "+", tx.amount.toFixed(2)] }), _jsx("td", { className: "px-5 py-3 font-mono text-xs text-paper-muted max-w-[120px] truncate", children: tx.from }), _jsx("td", { className: "px-5 py-3 font-mono text-xs text-paper-muted max-w-[120px] truncate", children: tx.to }), _jsxs("td", { className: "px-5 py-3 text-right text-xs text-paper-muted", children: ["#", tx.block] })] }, tx.id + i)))) })] }) }) })] }));
}
