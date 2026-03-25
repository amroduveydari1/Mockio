"use client";

import Image from "next/image";
import { Download, Eye, Lock } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface MockupCardProps {
  id: string;
  name: string;
  imageUrl: string;
  isPremium?: boolean;
  isOwned?: boolean;
  onPreview?: () => void;
  onDownload?: () => void;
  onSelect?: () => void;
  className?: string;
}

export function MockupCard({
  name,
  imageUrl,
  isPremium = false,
  isOwned = false,
  onPreview,
  onDownload,
  onSelect,
  className,
}: MockupCardProps) {
  const isLocked = isPremium && !isOwned;

  return (
    <div
      className={cn(
        "group relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-all duration-200 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-950/50",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className={cn(
            "object-cover transition-transform duration-300 group-hover:scale-105",
            isLocked && "blur-sm"
          )}
        />

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-center gap-2 text-white">
              <Lock size={24} />
              <span className="text-sm font-medium">Pro Only</span>
            </div>
          </div>
        )}

        {/* Hover Actions */}
        {!isLocked && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            {onPreview && (
              <button
                onClick={onPreview}
                className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
              >
                <Eye size={20} className="text-neutral-900" />
              </button>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
              >
                <Download size={20} className="text-neutral-900" />
              </button>
            )}
          </div>
        )}

        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute top-3 right-3">
            <Badge variant="warning">Pro</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-white truncate">
          {name}
        </h3>
        {onSelect && !isLocked && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-3"
            onClick={onSelect}
          >
            Use Template
          </Button>
        )}
        {isLocked && (
          <Button variant="outline" size="sm" className="w-full mt-3">
            Upgrade to Pro
          </Button>
        )}
      </div>
    </div>
  );
}
