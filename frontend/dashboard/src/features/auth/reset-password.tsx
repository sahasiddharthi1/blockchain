import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import AuthLayout from "./auth-layout";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("This reset link is invalid or incomplete.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Set new password" subtitle="Enter your new password below.">
      {done ? (
        <div className="mt-8 space-y-5">
          <div className="rounded-xl border border-success/30 bg-success-soft px-5 py-4 text-sm text-paper" role="status">
            Your password has been updated. You can now sign in with your new password.
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-xs font-medium text-paper-muted mb-1.5">New Password</label>
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
          <div>
            <label className="block text-xs font-medium text-paper-muted mb-1.5">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? "Resetting…" : "Reset Password"}
          </button>
          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm text-danger" role="alert">
              {error}
            </div>
          )}
          <div className="text-center text-sm text-paper-muted">
            <Link to="/login" className="text-signal hover:text-signal/80 transition-colors">Back to sign in</Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}