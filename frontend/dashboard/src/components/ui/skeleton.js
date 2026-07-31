import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
export function Skeleton({ className, ...props }) {
    return (_jsx("div", { className: cn("animate-pulse rounded-md bg-[var(--color-surface-sunken)]", className), ...props }));
}
