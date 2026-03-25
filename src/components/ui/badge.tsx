import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "premium";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base - refined, premium pill style
          "inline-flex items-center font-medium rounded-full",
          "transition-colors duration-150",
          {
            // Sizes
            "px-2 py-0.5 text-[11px]": size === "sm",
            "px-2.5 py-1 text-xs": size === "md",
            // Variants - subtle, muted colors
            "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300":
              variant === "default",
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400":
              variant === "success",
            "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400":
              variant === "warning",
            "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400":
              variant === "error",
            "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400":
              variant === "info",
            // Premium - gradient border effect
            "bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-700 dark:from-violet-500/20 dark:to-fuchsia-500/20 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/20":
              variant === "premium",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, type BadgeProps };
