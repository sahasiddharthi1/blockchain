import type { ReactNode } from "react";
import { Blocks } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-signal to-accent-blue">
                <Blocks className="h-4 w-4 text-white" />
              </div>
              Ledgerforge
            </Link>
            <h2 className="mt-6 text-2xl font-bold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-paper-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-signal/5 via-ink-raised to-accent-cyan/5 items-center justify-center p-12 border-l border-border">
        <div className="max-w-md text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-signal-soft text-signal mb-6">
            <Blocks className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">Blockchain infrastructure, productized</h3>
          <p className="mt-3 text-sm text-paper-muted leading-relaxed">
            Mine blocks, manage wallets, explore the chain, and monitor network health — all from one dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
