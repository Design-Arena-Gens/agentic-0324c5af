import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "danger" | "muted" | "warning";
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-brand/15 text-brand border border-brand/30",
  success: "bg-success/10 text-success border border-success/30",
  danger: "bg-danger/10 text-danger border border-danger/30",
  warning: "bg-warning/10 text-warning border border-warning/30",
  muted: "bg-slate-800/70 text-slate-300 border border-slate-700/70"
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
