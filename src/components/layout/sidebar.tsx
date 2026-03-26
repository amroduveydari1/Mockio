"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Grid3X3,
  Image,
  Settings,
  Menu,
  X,
  SlidersHorizontal,
  Sparkles,
  ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar } from "@/components/ui";
import { LogoutButton } from "@/components/logout-button";

const ADMIN_EMAIL = "amrdwedari1@gmail.com";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Brand Set", icon: Sparkles },
  { href: "/upload", label: "Upload Logo", icon: Upload },
  { href: "/mockups", label: "Mockup Library", icon: Grid3X3 },
  { href: "/generated", label: "My Mockups", icon: Image },
  { href: "/template-editor", label: "Template Editor", icon: SlidersHorizontal },
  { href: "/admin", label: "Admin Panel", icon: ImagePlus, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
            <span className="text-white dark:text-zinc-900 font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-[17px] text-zinc-900 dark:text-white tracking-tight">
            Mockio
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-150"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-zinc-950/20 dark:bg-zinc-950/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[260px] bg-white dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="text-white dark:text-zinc-900 font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-[17px] text-zinc-900 dark:text-white tracking-tight">
              Mockio
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {sidebarLinks
              .filter((link) => !link.adminOnly || user?.email === ADMIN_EMAIL)
              .map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
                    )}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={user?.avatar_url}
              fallback={user?.full_name || user?.email}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-zinc-900 dark:text-white truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
