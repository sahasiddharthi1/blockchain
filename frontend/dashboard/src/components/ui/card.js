import { jsx as _jsx } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
const cardVariants = cva("rounded-card border-subtle shadow-card transition duration-200", {
    variants: {
        variant: {
            default: "surface",
            muted: "surface-muted",
            sunken: "surface-sunken",
        },
        hoverable: {
            true: "shadow-card-hover hover:-translate-y-0.5",
            false: "",
        },
    },
    defaultVariants: {
        variant: "default",
        hoverable: false,
    },
});
export function Card({ className, variant, hoverable, ...props }) {
    return _jsx("div", { className: cn(cardVariants({ variant, hoverable }), className), ...props });
}
export function CardHeader({ className, ...props }) {
    return _jsx("div", { className: cn("px-5 py-4", className), ...props });
}
export function CardBody({ className, ...props }) {
    return _jsx("div", { className: cn("px-5 py-4", className), ...props });
}
export function CardFooter({ className, ...props }) {
    return _jsx("div", { className: cn("px-5 py-4 border-t border-[var(--color-border)]", className), ...props });
}
