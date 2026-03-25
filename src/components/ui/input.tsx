import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[13px] font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            // Base styles - refined, premium feel
            "w-full px-3.5 py-2.5 text-sm",
            "bg-white dark:bg-zinc-900/50",
            "border border-zinc-200 dark:border-zinc-800",
            "rounded-xl",
            "text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
            // Focus states - subtle and elegant
            "focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10",
            "focus:border-zinc-400 dark:focus:border-zinc-600",
            // Transitions
            "transition-all duration-200 ease-out",
            // Hover state
            "hover:border-zinc-300 dark:hover:border-zinc-700",
            // Error state
            error && "border-red-400 dark:border-red-500 focus:ring-red-500/10",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-2 text-[13px] text-zinc-500 dark:text-zinc-500">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-[13px] text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, type InputProps };
