"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({
  className,
  showIcon = true,
  children,
}: LogoutButtonProps) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <button
      onClick={handleSignOut}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors",
        className
      )}
    >
      {showIcon && <LogOut size={18} />}
      {children || "Sign out"}
    </button>
  );
}
