import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
export function Avatar({ className, initials, children, ...props }) {
    return (_jsx("div", { className: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-weak)] text-sm font-semibold text-[var(--color-primary)]", className), ...props, children: initials || children }));
}
