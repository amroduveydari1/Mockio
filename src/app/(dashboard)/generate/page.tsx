"use client";

import Link from "next/link";
import { ArrowLeft, Button } from "lucide-react";

export default function GeneratePage() {
  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/mockups">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={18} />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Generate Mockup
            </h1>
          </div>
        </div>
      </div>
      <div className="text-center py-24 text-neutral-400">
        <p className="text-lg">Mockup generation coming soon. Please select a template from the dashboard to get started.</p>
      </div>
    </div>
  );
}
