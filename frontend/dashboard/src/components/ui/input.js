import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
export function Input({ className, ...props }) {
    return (_jsx("input", { className: cn("flex h-10 w-full rounded-control border border-subtle bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-weak)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className), ...props }));
}
