import { cn } from "@/lib/cn";

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  initials?: string;
};

export function Avatar({ className, initials, children, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-weak)] text-sm font-semibold text-[var(--color-primary)]",
        className
      )}
      {...props}
    >
      {initials || children}
    </div>
  );
}
