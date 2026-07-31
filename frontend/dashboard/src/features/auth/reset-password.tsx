import { Link } from "react-router-dom";
import AuthLayout from "./auth-layout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Set new password" subtitle="Enter your new password below.">
      <form className="mt-8 space-y-5">
        <div>
          <label className="block text-xs font-medium text-paper-muted mb-1.5">New Password</label>
          <input
            type="password"
            placeholder="Min 12 characters"
            className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-paper-muted mb-1.5">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20 transition-all"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-signal/90"
        >
          Reset Password
        </button>
        <div className="text-center text-sm text-paper-muted">
          <Link to="/login" className="text-signal hover:text-signal/80 transition-colors">Back to sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
