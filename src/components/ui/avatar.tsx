import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-[11px]",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
    xl: "w-14 h-14 text-base",
  };

  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 ring-2 ring-white dark:ring-zinc-900 shadow-sm",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  const initials = fallback
    ? fallback
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium ring-2 ring-white dark:ring-zinc-900 shadow-sm",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
