import { cn } from "@/lib/cn";

export function KpiCard({ className, label, value, delta, icon }: { className?: string; label: string; value: string; delta?: string; icon?: React.ReactNode }) {
  return (
    <div className={cn("surface rounded-card border-subtle shadow-card p-5", className)}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground-weak)]">{label}</div>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">{value}</div>
      {delta && <div className="mt-1 text-xs text-[var(--color-foreground-muted)]">{delta}</div>}
    </div>
  );
}
