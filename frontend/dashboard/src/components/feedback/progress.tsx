import { cn } from "@/lib/cn";

export function Progress({ className, value, max = 100, label }: { className?: string; value: number; max?: number; label?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      {(label || value !== undefined) && (
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--color-foreground-weak)]">
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-[var(--color-surface-sunken)]">
        <div className="h-2 rounded-full bg-[var(--color-primary)] transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
