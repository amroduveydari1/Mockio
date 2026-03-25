import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "glass" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base - refined radius and transitions
          "rounded-2xl transition-all duration-200 ease-out",
          {
            // Default - clean, minimal
            "bg-white dark:bg-zinc-900/50": variant === "default",
            // Bordered - subtle, refined border
            "bg-white dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80":
              variant === "bordered",
            // Elevated - premium shadow
            "bg-white dark:bg-zinc-900/50 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]":
              variant === "elevated",
            // Glass - frosted glass effect
            "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]":
              variant === "glass",
            // Interactive - hover states for clickable cards
            "bg-white dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] cursor-pointer":
              variant === "interactive",
            // Padding options
            "p-0": padding === "none",
            "p-4": padding === "sm",
            "p-6": padding === "md",
            "p-8": padding === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/80",
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 py-5", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-b-2xl",
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter, type CardProps };
