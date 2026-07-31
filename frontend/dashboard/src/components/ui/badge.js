import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors", {
    variants: {
        variant: {
            default: "border-transparent bg-[var(--color-primary-weak)] text-[var(--color-primary)]",
            secondary: "border-transparent bg-[var(--color-surface-muted)] text-[var(--color-foreground-muted)]",
            outline: "bg-transparent text-[var(--color-foreground)] border-[var(--color-border)]",
            success: "border-transparent bg-[var(--color-success-weak)] text-[var(--color-success)]",
            warn: "border-transparent bg-[var(--color-warn-weak)] text-[var(--color-warn)]",
            danger: "border-transparent bg-[var(--color-danger-weak)] text-[var(--color-danger)]",
            info: "border-transparent bg-[var(--color-info-weak)] text-[var(--color-info)]",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
export function Badge({ className, variant, dot, children, ...props }) {
    return (_jsxs("div", { className: cn(badgeVariants({ variant }), className), ...props, children: [dot && _jsx("span", { className: "mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" }), children] }));
}
