import { useState } from "react";
import { api } from "../../lib/api";
import { useWebSocket } from "../../lib/useWebSocket";
import { Wifi, WifiOff, LogOut, User } from "lucide-react";

export default function Settings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loggedIn = Boolean(localStorage.getItem("lf_access_token"));
  const { connected } = useWebSocket();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);
    try {
      const { access_token, refresh_token } =
        mode === "login" ? await api.login(email, password) : await api.register(email, password);
      localStorage.setItem("lf_access_token", access_token);
      localStorage.setItem("lf_refresh_token", refresh_token);
      localStorage.setItem("ledgerforge-auth", "true");
      setStatus("Signed in — mining is now enabled.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  function handleLogout() {
    localStorage.removeItem("lf_access_token");
    localStorage.removeItem("lf_refresh_token");
    localStorage.removeItem("ledgerforge-auth");
    setStatus("Signed out");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-paper-muted">Operator authentication and system status.</p>
      </div>

      <div className="rounded-xl border border-border bg-ink-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              connected ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            }`}>
              {connected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold">WebSocket Connection</h3>
              <p className="text-xs text-paper-muted">Live updates for mining, blocks, and transactions</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            connected ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-success" : "bg-danger"}`} />
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {loggedIn ? (
        <div className="rounded-xl border border-border bg-ink-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-soft text-signal">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Authenticated</h3>
                <p className="text-xs text-paper-muted">You're signed in as an operator.</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-ink-overlay hover:border-border-light"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
          {status && <div className="mt-4 text-sm text-success">{status}</div>}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-ink-card p-6">
          <h3 className="text-sm font-semibold mb-4">Operator Login</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 text-paper-muted cursor-pointer">
                <input
                  type="radio"
                  checked={mode === "login"}
                  onChange={() => setMode("login")}
                  className="accent-signal"
                />
                Log in
              </label>
              <label className="flex items-center gap-2 text-paper-muted cursor-pointer">
                <input
                  type="radio"
                  checked={mode === "register"}
                  onChange={() => setMode("register")}
                  className="accent-signal"
                />
                Register
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5">Email</label>
              <input
                type="email"
                placeholder="operator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-paper-muted mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Min 12 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={12}
                required
                className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90"
            >
              {mode === "login" ? "Log in" : "Register"}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-5 py-3 text-sm text-danger" role="alert">
          {error}
        </div>
      )}
      {status && !loggedIn && <div className="text-sm text-success">{status}</div>}
    </div>
  );
}
