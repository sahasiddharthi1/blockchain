import { useEffect, useState } from "react";
import { Search, Blocks, Clock } from "lucide-react";
import { api, type Block } from "../../lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const tooltipStyle = {
  contentStyle: { background: "#181828", border: "1px solid #2a2a40", borderRadius: "8px", fontSize: "12px", color: "#e8e8ed" },
  labelStyle: { color: "#9a9aae" },
};

export default function ExplorerPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listBlocks(0, 50).then((res) => {
      setBlocks(res.blocks);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sorted = [...blocks].sort((a, b) => a.index - b.index);
  const chartData = sorted.map((b) => ({ index: b.index, txs: b.transactions.length }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="animate-fade-in">
        <h1 className="bg-gradient-to-r from-signal to-accent-cyan bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          Explorer
        </h1>
        <p className="mt-1 text-sm text-paper-muted">
          {loading ? "Loading..." : `${blocks.length} blocks on the chain`}
        </p>
      </div>

      <div className="relative max-w-md animate-fade-in-up animate-fade-in-up-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-paper-weak" />
        <input
          placeholder="Search block hash, height, or address..."
          className="w-full rounded-xl border border-border bg-ink-card px-9 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
        />
      </div>

      {chartData.length > 1 && (
        <div className="card-hover rounded-xl border border-border bg-ink-card p-5 animate-fade-in-up animate-fade-in-up-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-paper">Chain Growth</h2>
            <span className="text-xs text-paper-muted">Transactions per block</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                <XAxis dataKey="index" stroke="#6a6a7e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6a6a7e" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="txs" fill="#7c5cfc" radius={[3, 3, 0, 0]} />
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
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-paper-weak">Height</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-paper-weak">Hash</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-paper-weak">Timestamp</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-paper-weak">Txs</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-paper-weak">Nonce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-paper-weak">Loading...</td></tr>
              ) : blocks.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-paper-weak">No blocks mined yet.</td></tr>
              ) : (
                [...blocks].reverse().map((block, i) => (
                  <tr key={block.hash} className={`transition-colors hover:bg-ink-overlay animate-fade-in-up animate-fade-in-up-${i + 1}`}>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Blocks className="h-3.5 w-3.5 text-signal" />
                        #{block.index}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-paper-muted max-w-[200px] truncate" title={block.hash}>
                      {block.hash.slice(0, 24)}...
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-paper-muted">
                        <Clock className="h-3 w-3" />
                        {new Date(block.timestamp / 1e6).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-paper-muted">{block.transactions.length}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-paper-muted">{block.nonce}</td>
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
