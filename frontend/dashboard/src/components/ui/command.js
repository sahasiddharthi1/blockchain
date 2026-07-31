import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
const commandVariants = cva("fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4", {
    variants: {
        open: {
            true: "block",
            false: "hidden",
        },
    },
    defaultVariants: { open: false },
});
export function Command({ className, open, onOpenChange, ...props }) {
    useEffect(() => {
        if (!open)
            return;
        const down = (e) => {
            if (e.key === "Escape")
                onOpenChange?.(false);
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [open, onOpenChange]);
    if (!open)
        return null;
    return (_jsx("div", { className: cn(commandVariants({ open }), className), children: _jsx("div", { className: "w-full max-w-xl rounded-xl border border-border bg-ink-card", children: props.children }) }));
}
export function CommandInput({ className, ...props }) {
    return (_jsxs("div", { className: "flex items-center border-b border-border px-4", children: [_jsxs("svg", { className: "mr-3 h-4 w-4 text-paper-weak", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })] }), _jsx("input", { className: cn("h-12 w-full bg-transparent text-sm text-paper placeholder:text-paper-weak focus:outline-none", className), ...props })] }));
}
