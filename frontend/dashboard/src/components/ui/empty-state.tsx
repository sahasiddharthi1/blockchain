import { cn } from "@/lib/cn";

export function EmptyState({ className, title, description, action }: { className?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-foreground-weak)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12h.01" />
          <path d="M7.5 7.5h.01" />
          <path d="M16.5 7.5h.01" />
          <path d="M7.5 16.5h.01" />
          <path d="M16.5 16.5h.01" />
        </svg>
      </div>
      <div className="heading-2 text-base text-[var(--color-foreground)]">{title}</div>
      {description && <p className="mt-2 max-w-sm text-sm text-body">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
