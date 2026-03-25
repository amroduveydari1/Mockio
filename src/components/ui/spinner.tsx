import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-[1.5px] border-zinc-200 dark:border-zinc-700 border-t-zinc-700 dark:border-t-zinc-200",
        {
          "w-3.5 h-3.5": size === "sm",
          "w-5 h-5": size === "md",
          "w-7 h-7": size === "lg",
        },
        className
      )}
    />
  );
}
