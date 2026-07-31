import { useEffect, useState } from "react";
import { api, Block } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { formatCompactHash } from "@/lib/format";

export default function BlockchainExplorer() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [height, setHeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lastEvent } = useWebSocket();

  async function load() {
    try {
      setLoading(true);
      const res = await api.listBlocks(0, 50);
      setBlocks(res.blocks.slice().reverse());
      setHeight(res.height);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load blocks");
    } finally {
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

  if (loading && blocks.length === 0) return <p>Loading chain…</p>;
  if (error) return <p role="alert">Error: {error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Blockchain Explorer</h1>
          <p className="text-sm text-[var(--text-weak)]">Chain height: {height}</p>
        </div>
        <button onClick={load} className="btn btn-secondary">Refresh</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 font-semibold text-[var(--text-weak)]">Index</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-weak)]">Hash</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-weak)]">Prev Hash</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-weak)]">Txs</th>
                <th className="px-4 py-3 font-semibold text-[var(--text-weak)]">Nonce</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.index} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-layer-2)]">
                  <td className="px-4 py-3 font-medium text-[var(--text-strong)]">{b.index}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text-weak)]" title={b.hash}>
                    {formatCompactHash(b.hash)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text-weak)]" title={b.prev_hash}>
                    {b.prev_hash ? formatCompactHash(b.prev_hash) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-strong)]">{b.transactions?.length ?? 0}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text-strong)]">{b.nonce}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
