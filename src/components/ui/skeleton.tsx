import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-md",
        className
      )}
    />
  );
}
