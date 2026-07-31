import { cva, type VariantProps } from "class-variance-authority";
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

type CardProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export function Card({ className, variant, hoverable, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, hoverable }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4 border-t border-[var(--color-border)]", className)} {...props} />;
}
