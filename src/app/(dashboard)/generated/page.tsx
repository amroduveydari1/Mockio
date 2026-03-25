"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Eye, Trash2, Search, Grid, List, X } from "lucide-react";
import { Button, Input, Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

// TODO: Integrate real generated mockups from Supabase or API here.

export default function GeneratedMockupsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  // Placeholder: No generated mockups until real data is integrated.
  const [previewMockup, setPreviewMockup] = useState<any | null>(null);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          My Mockups
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          View and download your generated mockups
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <Input
            placeholder="Search mockups..."
            className="pl-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500 mr-2">View:</span>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              view === "grid"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              view === "list"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* No mockups to display until real data is integrated */}
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
          <Grid size={28} className="text-neutral-400 dark:text-neutral-500" />
        </div>
        <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
          No mockups found
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {searchQuery
            ? "Try a different search term"
            : "Generate your first mockup to see it here"}
        </p>
      </div>

      {/* No preview modal until real data is integrated */}
    </div>
  );
}
