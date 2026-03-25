"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/mockups", label: "Mockups" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="text-white dark:text-zinc-900 font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-[17px] text-zinc-900 dark:text-white tracking-tight">
              Mockio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              <div className="w-20 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button size="sm">
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Button>
                </Link>
                <div className="relative group">
                  <button className="flex items-center p-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150">
                    <Avatar
                      src={user.user_metadata?.avatar_url}
                      fallback={user.user_metadata?.full_name || user.email}
                      size="sm"
                    />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-56 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <LogoutButton className="w-full justify-start" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-150"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            isOpen ? "max-h-80 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-1 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-all duration-150"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              {isLoading ? (
                <div className="w-full h-9 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
              ) : user ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full">
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Button>
                  </Link>
                  <LogoutButton className="justify-center" />
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
