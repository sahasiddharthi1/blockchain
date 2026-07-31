import Link from "next/link";
import { Blocks } from "lucide-react";

export const metadata = {
  title: "Sign Up — Ledgerforge",
  description: "Create your Ledgerforge account and start building on the blockchain.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-signal to-accent-blue">
              <Blocks className="h-4 w-4 text-white" />
            </div>
            Ledgerforge
          </Link>
          <Link href="/" className="text-sm text-paper-muted hover:text-paper transition-colors">
            Home
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="bg-gradient-to-r from-signal to-accent-cyan bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Create your account
            </h1>
            <p className="mt-3 text-sm text-paper-muted">
              Start building on the Ledgerforge blockchain today.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-ink-card p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-paper-muted mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  disabled
                  className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 transition-all opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-paper-muted mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="Min 12 characters"
                  disabled
                  className="w-full rounded-xl border border-border bg-ink-overlay px-4 py-2.5 text-sm text-paper placeholder:text-paper-weak outline-none focus:border-signal/50 transition-all opacity-60"
                />
              </div>
              <Link
                href="https://blockchain-five-virid.vercel.app/register"
                className="flex w-full items-center justify-center rounded-xl bg-signal px-4 py-2.5 text-sm font-semibold text-ink transition-all hover:bg-signal/90"
              >
                Go to Registration
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-paper-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-signal hover:text-signal/80 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
