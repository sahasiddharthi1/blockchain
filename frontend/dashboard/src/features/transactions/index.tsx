import { useEffect, useState } from "react";
import { Search, ArrowUpRight, ArrowDownRight, Pickaxe } from "lucide-react";
import { api, type Block } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const tooltipStyle = {
  contentStyle: { background: "#181828", border: "1px solid #2a2a40", borderRadius: "8px", fontSize: "12px", color: "#e8e8ed" },
  labelStyle: { color: "#9a9aae" },
};

interface TxDisplay {
  id: string;
  type: string;
  status: string;
  amount: number;
  from: string;
  to: string;
  block: number | null;
  time: string;
}

function decodeTx(raw: string, blockIndex: number): TxDisplay | null {
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
  } catch {
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
  const [txs, setTxs] = useState<TxDisplay[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    api.listBlocks(0, 50).then((res) => {
      setBlocks(res.blocks);
      const all: TxDisplay[] = [];
      for (const block of res.blocks) {
        for (const raw of block.transactions) {
          const decoded = decodeTx(raw, block.index);
          if (decoded) all.push(decoded);
        }
      }
      setTxs(all);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsub = subscribe("block:new", (payload) => {
      const block = payload as Block;
      setBlocks((prev) => [block, ...prev].slice(0, 50));
      const newTxs: TxDisplay[] = [];
      for (const raw of block.transactions) {
        const decoded = decodeTx(raw, block.index);
        if (decoded) newTxs.push(decoded);
      }
      if (newTxs.length > 0) setTxs((prev) => [...newTxs, ...prev]);
    });
    return unsub;
  }, [subscribe]);

  const sorted = [...blocks].sort((a, b) => a.index - b.index);
  const chartData = sorted.map((b) => ({ index: b.index, txs: b.transactions.length }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="animate-fade-in">
        <h1 className="bg-gradient-to-r from-signal to-accent-cyan bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-paper-muted">
          {loading ? "Loading..." : `${txs.length} transactions found`}
        </p>
      </div>

      <div className="relative max-w-md animate-fade-in-up animate-fade-in-up-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-paper-weak" />
        <input
          placeholder="Search by ID, sender, or receiver..."
          className="w-full rounded-xl border border-border bg-ink-card px-9 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
        />
      </div>

      {chartData.length > 1 && (
        <div className="card-hover rounded-xl border border-border bg-ink-card p-5 animate-fade-in-up animate-fade-in-up-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-paper">Transaction Volume</h2>
            <span className="text-xs text-paper-muted">Txns per block</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                <XAxis dataKey="index" stroke="#6a6a7e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6a6a7e" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="txs" fill="#22d3ee" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card-hover rounded-xl border border-border bg-ink-card overflow-hidden animate-fade-in-up animate-fade-in-up-3">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-paper-weak">Type</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-paper-weak">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-paper-weak">From</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-paper-weak">To</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-paper-weak">Block</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-paper-weak">Loading transactions...</td></tr>
              ) : txs.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-paper-weak">No transactions yet.</td></tr>
              ) : (
                txs.map((tx, i) => (
                  <tr key={tx.id + i} className={`transition-colors hover:bg-ink-overlay animate-fade-in-up animate-fade-in-up-${(i % 8) + 1}`}>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-sm capitalize">
                        {tx.type === "send" ? <ArrowUpRight className="h-3.5 w-3.5 text-danger" /> :
                         tx.type === "receive" || tx.type === "mining" ? <ArrowDownRight className="h-3.5 w-3.5 text-success" /> :
                         <Pickaxe className="h-3.5 w-3.5 text-signal" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-right text-sm font-semibold ${
                      tx.type === "send" ? "text-danger" : "text-success"
                    }`}>
                      {tx.type === "send" ? "-" : "+"}{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-paper-muted max-w-[120px] truncate">{tx.from}</td>
                    <td className="px-5 py-3 font-mono text-xs text-paper-muted max-w-[120px] truncate">{tx.to}</td>
                    <td className="px-5 py-3 text-right text-xs text-paper-muted">#{tx.block}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
