import { useState, useEffect, useCallback } from "react";
import { Play, Square, Pickaxe, Blocks, Hash, Zap } from "lucide-react";
import { api, type Block } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const tooltipStyle = {
  contentStyle: { background: "#181828", border: "1px solid #2a2a40", borderRadius: "8px", fontSize: "12px", color: "#e8e8ed" },
  labelStyle: { color: "#9a9aae" },
};

export default function MiningPage() {
  const [state, setState] = useState<"idle" | "mining" | "stopped">("idle");
  const [lastBlock, setLastBlock] = useState<Block | null>(null);
  const [blockCount, setBlockCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mining, setMining] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const { connected, subscribe } = useWebSocket();

  useEffect(() => {
    api.listBlocks(0, 20).then((res) => {
      setBlocks(res.blocks);
      setBlockCount(res.total);
      if (res.blocks.length > 0) setLastBlock(res.blocks[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const unsub = subscribe("block:new", (payload) => {
      const block = payload as Block;
      setBlocks((prev) => [block, ...prev].slice(0, 20));
      setLastBlock(block);
      setBlockCount((c) => c + 1);
      setState("idle");
      setMining(false);
    });
    return unsub;
  }, [subscribe]);

  const handleMine = useCallback(async () => {
    if (mining) return;
    setMining(true);
    setState("mining");
    setError(null);
    try {
      const block = await api.mineNow();
      setBlocks((prev) => [block, ...prev].slice(0, 20));
      setLastBlock(block);
      setBlockCount((c) => c + 1);
      setState("idle");
    } catch (err) {
      setState("stopped");
      setError(err instanceof Error ? err.message : "Mining failed");
    } finally {
      setMining(false);
    }
  }, [mining]);

  const sorted = [...blocks].sort((a, b) => a.index - b.index);
  const chartData = sorted.map((b) => ({ index: b.index, nonce: b.nonce, difficulty: b.difficulty }));
  const hashrateData = chartData.map((d) => ({ ...d, nonce: d.nonce > 0 ? Math.round(d.nonce / 1000) : 0 }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-signal to-accent-cyan bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Mining
          </h1>
          <p className="mt-1 text-sm text-paper-muted">
            {connected ? (
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success glow-pulse" /> Live</span>
            ) : (
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" /> Disconnected</span>
            )}
          </p>
        </div>
        <button
          onClick={handleMine}
          disabled={mining}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 ${
            mining ? "bg-danger text-white" : "bg-signal text-white hover:bg-signal/90 hover:shadow-[0_0_24px_-4px_var(--color-signal)]"
          }`}
        >
          {mining ? <Square className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
          {mining ? "Mining..." : "Mine Block"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Status", value: mining ? "Mining" : state === "stopped" ? "Stopped" : "Idle", icon: Zap,
            color: mining ? "text-success" : state === "stopped" ? "text-danger" : "text-paper-muted" },
          { label: "Blocks Mined", value: blockCount.toLocaleString(), icon: Blocks },
          { label: "Last Block", value: lastBlock ? `#${lastBlock.index}` : "—", icon: Pickaxe },
          { label: "Last Nonce", value: lastBlock ? lastBlock.nonce.toLocaleString() : "—", icon: Hash, mono: true },
        ].map((s, i) => (
          <div key={s.label} className={`card-hover group relative overflow-hidden rounded-xl border border-border bg-ink-card p-5 animate-fade-in-up animate-fade-in-up-${i + 1}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-signal/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-paper-muted">{s.label}</span>
              <s.icon className="h-4 w-4 text-signal" />
            </div>
            <div className={`relative mt-3 text-xl font-bold tracking-tight ${(s as any).color || ""} ${(s as any).mono ? "font-mono text-base" : ""}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up animate-fade-in-up-5">
        <div className="card-hover rounded-xl border border-border bg-ink-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-paper">Nonce Trend</h2>
            <span className="text-xs text-paper-muted">Mining effort per block</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hashrateData}>
                <defs>
                  <linearGradient id="nonceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c5cfc" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7c5cfc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                <XAxis dataKey="index" stroke="#6a6a7e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6a6a7e" tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="nonce" stroke="#7c5cfc" strokeWidth={2} fill="url(#nonceGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-hover rounded-xl border border-border bg-ink-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-paper">Difficulty Trend</h2>
            <span className="text-xs text-paper-muted">Mining difficulty per block</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="diffGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                <XAxis dataKey="index" stroke="#6a6a7e" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6a6a7e" tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="difficulty" stroke="#22d3ee" strokeWidth={2} fill="url(#diffGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up animate-fade-in-up-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-paper">Mining Progress</h2>
          <div className="card-hover rounded-xl border border-border bg-ink-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 rounded-full bg-ink-overlay overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-signal to-accent-cyan transition-all duration-500"
                  style={{ width: mining ? "100%" : "0%" }}
                />
              </div>
              <span className="text-sm font-medium text-paper-muted">{mining ? "Finding nonce..." : "Ready"}</span>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-paper">Recent Mined Blocks</h2>
          <div className="card-hover rounded-xl border border-border bg-ink-card divide-y divide-border">
            {!lastBlock ? (
              <div className="px-5 py-8 text-center text-sm text-paper-weak">No blocks mined yet.</div>
            ) : (
              [lastBlock].map((block) => (
                <div key={block.hash} className="flex items-center justify-between px-5 py-3.5 hover:bg-ink-overlay transition-colors">
                  <div className="flex items-center gap-2">
                    <Blocks className="h-4 w-4 text-signal" />
                    <span className="text-sm font-medium">Block #{block.index}</span>
                  </div>
                  <div className="text-xs text-paper-weak font-mono">{block.hash.slice(0, 16)}...</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-paper">Last Block Details</h2>
          <div className="card-hover rounded-xl border border-border bg-ink-card p-5">
            {lastBlock ? (
              <div className="space-y-4">
                {[
                  { label: "Index", value: `#${lastBlock.index}` },
                  { label: "Hash", value: lastBlock.hash.slice(0, 16) + "...", mono: true },
                  { label: "Nonce", value: lastBlock.nonce.toLocaleString(), mono: true },
                  { label: "Difficulty", value: lastBlock.difficulty.toLocaleString() },
                  { label: "Transactions", value: lastBlock.transactions.length.toLocaleString() },
                  { label: "Prev Hash", value: lastBlock.prev_hash.slice(0, 12) + "...", mono: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-paper-muted">{item.label}</span>
                    <span className={`text-sm font-medium text-paper ${item.mono ? "font-mono text-xs" : ""}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-paper-weak">No blocks mined yet.</div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-5 py-3 text-sm text-danger animate-fade-in" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
