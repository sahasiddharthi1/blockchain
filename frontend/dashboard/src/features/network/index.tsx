import { useEffect, useState } from "react";
import { Server, Globe, Activity, Plus, Wifi, WifiOff, ShieldCheck } from "lucide-react";
import { api, type Block } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const tooltipStyle = {
  contentStyle: { background: "#181828", border: "1px solid #2a2a40", borderRadius: "8px", fontSize: "12px", color: "#e8e8ed" },
  labelStyle: { color: "#9a9aae" },
};

export default function NetworkPage() {
  const [height, setHeight] = useState(0);
  const [chainValid, setChainValid] = useState(true);
  const [latestBlock, setLatestBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const { connected, subscribe } = useWebSocket();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.listBlocks(0, 1),
      api.analyticsSummary(),
    ]).then(([blocks, analytics]) => {
      setHeight(analytics.chain_height || blocks.height);
      setChainValid(analytics.chain_valid);
      if (blocks.blocks.length > 0) setLatestBlock(blocks.blocks[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsub1 = subscribe("block:new", (payload) => {
      setLatestBlock(payload as Block);
    });
    const unsub2 = subscribe("blockchain:height", (payload) => {
      setHeight(payload as number);
    });
    return () => { unsub1(); unsub2(); };
  }, [subscribe]);

  const nodes = [
    { id: "node_api", region: "API Server", status: connected ? "online" : "offline", latency: connected ? "8ms" : "—", version: "v1.0.0", score: 98 },
    { id: "node_ws", region: "WebSocket Hub", status: connected ? "online" : "offline", latency: connected ? "12ms" : "—", version: "v1.0.0", score: 95 },
    { id: "node_chain", region: "Blockchain Core", status: "online", latency: "2ms", version: "v1.0.0", score: 100 },
    { id: "node_mempool", region: "Mempool", status: "online", latency: "3ms", version: "v1.0.0", score: 97 },
  ];

  const radialData = nodes.map((n) => ({
    name: n.region,
    score: n.score,
    fill: n.status === "online" ? "#22c55e" : "#ef4444",
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-signal to-accent-cyan bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Network
          </h1>
          <p className="mt-1 text-sm text-paper-muted">
            {connected ? (
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success glow-pulse" /> Connected</span>
            ) : (
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" /> Disconnected</span>
            )}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-ink-overlay hover:border-border-light active:scale-95">
          <Plus className="h-4 w-4" />
          Add Node
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Connected Nodes", value: nodes.filter((n) => n.status === "online").length.toString(), icon: Server },
          { label: "Network Status", value: chainValid ? "Healthy" : "Unhealthy", icon: Activity,
            color: chainValid ? "text-success" : "text-danger" },
          { label: "Chain Status", value: chainValid ? "Valid" : "Invalid", icon: ShieldCheck,
            color: chainValid ? "text-success" : "text-danger" },
          { label: "Latest Height", value: loading ? "..." : height.toLocaleString(), icon: Globe },
        ].map((s, i) => (
          <div key={s.label} className={`card-hover group relative overflow-hidden rounded-xl border border-border bg-ink-card p-5 animate-fade-in-up animate-fade-in-up-${i + 1}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-signal/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-paper-muted">{s.label}</span>
              <s.icon className={`h-4 w-4 ${(s as any).color || "text-signal"}`} />
            </div>
            <div className={`relative mt-3 text-xl font-bold tracking-tight ${(s as any).color || ""}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 animate-fade-in-up animate-fade-in-up-5">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-paper mb-4">Network Services</h2>
          <div className="card-hover rounded-xl border border-border bg-ink-card divide-y divide-border">
            {nodes.map((node, i) => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
                className={`flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-ink-overlay text-left animate-fade-in-up animate-fade-in-up-${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    node.status === "online" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                  }`}>
                    {node.status === "online" ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{node.region}</div>
                    <div className="text-xs font-mono text-paper-weak">{node.id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-paper-weak">
                  {node.latency !== "—" && (
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" /> {node.latency}
                    </span>
                  )}
                  <span className="hidden sm:inline">{node.version}</span>
                  <span className={`hidden sm:inline capitalize ${
                    node.status === "online" ? "text-success" : "text-danger"
                  }`}>{node.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-paper mb-4">Node Health</h2>
          <div className="card-hover rounded-xl border border-border bg-ink-card p-5 animate-fade-in-up animate-fade-in-up-6">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="30%" outerRadius="80%" data={radialData} startAngle={180} endAngle={0}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <Tooltip {...tooltipStyle} />
                  <RadialBar dataKey="score" cornerRadius={8} background={{ fill: "#1e1e30" }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {latestBlock && (
        <div className="animate-fade-in-up animate-fade-in-up-7">
          <h2 className="text-sm font-semibold text-paper mb-4">Latest Block</h2>
          <div className="card-hover rounded-xl border border-border bg-ink-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-signal to-accent-blue">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">Block #{latestBlock.index}</div>
                  <span className="text-xs text-paper-weak">{latestBlock.transactions.length} tx</span>
                </div>
                <div className="mt-1 text-xs font-mono text-paper-muted truncate">{latestBlock.hash}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
