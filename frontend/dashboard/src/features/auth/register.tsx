import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import AuthLayout from "./auth-layout";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { access_token, refresh_token } = await api.register(email, password);
      localStorage.setItem("lf_access_token", access_token);
      localStorage.setItem("lf_refresh_token", refresh_token);
      localStorage.setItem("ledgerforge-auth", "true");
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg.includes("already registered")
        ? "An account with this email already exists. Please sign in instead."
        : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Start building on the Ledgerforge blockchain.">
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-paper-muted mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
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
            disabled={loading}
            className="w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger" role="alert">
              {error}
            </div>
          )}
        </div>
        <div className="text-center text-sm text-paper-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-signal hover:text-signal/80 transition-colors font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
