import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
export function Table({ className, ...props }) {
    return (_jsx("div", { className: "relative w-full overflow-auto rounded-card border-subtle", children: _jsx("table", { className: cn("w-full caption-bottom text-sm", className), ...props }) }));
}
export function TableHeader({ className, ...props }) {
    return _jsx("thead", { className: cn("border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/60", className), ...props });
}
export function TableBody({ className, ...props }) {
    return _jsx("tbody", { className: cn("[&_tr:last-child]:border-0", className), ...props });
}
export function TableRow({ className, ...props }) {
    return _jsx("tr", { className: cn("border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-muted)]/50", className), ...props });
}
export function TableHead({ className, ...props }) {
    return _jsx("th", { className: cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground-weak)]", className), ...props });
}
export function TableCell({ className, ...props }) {
    return _jsx("td", { className: cn("px-4 py-3 align-middle", className), ...props });
}
