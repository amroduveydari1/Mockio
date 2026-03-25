import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  mockupCount: number;
  className?: string;
}

export function CategoryCard({
  name,
  slug,
  description,
  thumbnailUrl,
  mockupCount,
  className,
}: CategoryCardProps) {
  return (
    <Link
      href={`/mockups/${slug}`}
      className={cn(
        "group relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-200/50 dark:hover:shadow-neutral-950/50 hover:-translate-y-1",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
            <p className="text-sm text-white/80">{description}</p>
            <p className="text-xs text-white/60 mt-2">
              {mockupCount} templates
            </p>
          </div>
          <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm group-hover:bg-white group-hover:text-neutral-900 transition-all">
            <ArrowRight
              size={20}
              className="text-white group-hover:text-neutral-900 transition-colors"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
