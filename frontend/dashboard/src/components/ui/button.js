import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-control text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px", {
    variants: {
        variant: {
            primary: "bg-[var(--color-primary)] text-white hover:brightness-110",
            secondary: "bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-subtle hover:border-strong",
            ghost: "bg-transparent text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]",
            danger: "bg-[var(--color-danger)] text-white hover:brightness-110",
            link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
            outline: "bg-transparent border border-subtle text-[var(--color-foreground)] hover:border-strong",
        },
        size: {
            xs: "h-8 px-3 text-xs",
            sm: "h-9 px-3 text-sm",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10",
        },
    },
    defaultVariants: {
        variant: "primary",
        size: "md",
    },
});
export function Button({ className, variant, size, loading, children, disabled, ...props }) {
    return (_jsx("button", { className: cn(buttonVariants({ variant, size, className })), disabled: disabled || loading, ...props, children: loading ? _jsx("span", { className: "h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" }) : children }));
}
