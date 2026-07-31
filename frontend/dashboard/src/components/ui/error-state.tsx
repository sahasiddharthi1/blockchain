import { cn } from "@/lib/cn";

export function ErrorState({ className, title, message, onRetry }: { className?: string; title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-danger-weak)] text-[var(--color-danger)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="heading-2 text-base text-[var(--color-foreground)]">{title || "Something went wrong"}</div>
      {message && <p className="mt-2 max-w-sm text-sm text-body">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary mt-5">
          Retry
        </button>
      )}
    </div>
  );
}
