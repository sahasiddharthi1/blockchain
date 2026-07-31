import { useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
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

type CommandProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof commandVariants> & {
  onOpenChange?: (open: boolean) => void;
};

export function Command({ className, open, onOpenChange, ...props }: CommandProps) {
  useEffect(() => {
    if (!open) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className={cn(commandVariants({ open }), className)}>
      <div className="w-full max-w-xl rounded-xl border border-border bg-ink-card">
        {props.children}
      </div>
    </div>
  );
}

export function CommandInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center border-b border-border px-4">
      <svg className="mr-3 h-4 w-4 text-paper-weak" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input className={cn("h-12 w-full bg-transparent text-sm text-paper placeholder:text-paper-weak focus:outline-none", className)} {...props} />
    </div>
  );
}
