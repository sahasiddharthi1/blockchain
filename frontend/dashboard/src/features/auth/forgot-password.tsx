import { Link } from "react-router-dom";
import AuthLayout from "./auth-layout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      <form className="mt-8 space-y-5">
        <div>
          <label className="block text-xs font-medium text-paper-muted mb-1.5">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90"
        >
          Send Reset Link
        </button>
        <div className="text-center text-sm text-paper-muted">
          <Link to="/login" className="text-signal hover:text-signal/80 transition-colors">Back to sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
