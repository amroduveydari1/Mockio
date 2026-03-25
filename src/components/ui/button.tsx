import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles - refined for premium feel
          "relative inline-flex items-center justify-center font-medium transition-all duration-200 ease-out rounded-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950",
          "disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          {
            // Primary - Bold, confident
            "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:shadow-md dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white":
              variant === "primary",
            // Secondary - Subtle background
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700/80":
              variant === "secondary",
            // Ghost - Minimal, text-only feel
            "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/80":
              variant === "ghost",
            // Outline - Refined border
            "border border-zinc-200 bg-white/50 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100 dark:hover:border-zinc-700":
              variant === "outline",
            // Subtle - Ultra minimal
            "bg-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300":
              variant === "subtle",
            // Sizes - More spacious
            "text-[13px] px-3 py-1.5 gap-1.5 rounded-lg": size === "sm",
            "text-sm px-4 py-2 gap-2": size === "md",
            "text-[15px] px-5 py-2.5 gap-2.5": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
