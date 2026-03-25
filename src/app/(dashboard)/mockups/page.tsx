"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter } from "lucide-react";
import { Input, Button, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

import { Skeleton } from "../../../components/ui/skeleton";
import { CheckCircle, Sparkles } from "lucide-react";
import { getMockupTemplates, getMockupCategories } from "@/lib/actions/mockups";
import type { MockupTemplateConfig } from "@/lib/types/mockup-template";
import { createClient } from "@/lib/supabase/client";





const PLACEHOLDER_IMAGE = "/images/mockup-placeholder.png";
function getPreviewUrl(template: MockupTemplateConfig) {
  return template.thumbnailUrl || template.baseImageUrl || PLACEHOLDER_IMAGE;
}

function SafeImageWithSkeleton({
  src,
  alt,
  aspect = "aspect-[4/3]",
  className,
}: {
  src: string;
  alt: string;
  aspect?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const safeSrc = !src || error ? PLACEHOLDER_IMAGE : src;
  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900", aspect, className)}>
      {!loaded && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-xl animate-pulse" />
      )}
      <Image
        src={safeSrc}
        alt={alt}
        fill
        className={cn(
          "object-cover w-full h-full transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        unoptimized={safeSrc.startsWith("/api/") || safeSrc === PLACEHOLDER_IMAGE}
        priority={false}
        sizes="(max-width: 768px) 100vw, 25vw"
      />
    </div>
      )}



export default function MockupsPage() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; icon?: string; sort_order?: number; templateCount: number }>>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MockupTemplateConfig[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Added missing state for user stats and new user flag
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [userStats, setUserStats] = useState<{ mockupsCreated: number; templatesUsed: number; downloads: number }>({ mockupsCreated: 0, templatesUsed: 0, downloads: 0 });

  // Fetch categories from Supabase
  useEffect(() => {
    async function fetchCategories() {
      setIsLoadingCategories(true);
      setError(null);
      try {
        const result = await getMockupCategories();
        if (result.error) throw new Error(result.error);
        // Map and filter categories with at least one template
        const dbCategories = (result.categories || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          sort_order: cat.sort_order,
          templateCount: cat.mockup_templates?.[0]?.count || 0
        })).filter((cat: any) => cat.templateCount > 0);
        setCategories(dbCategories);
        // Auto-select first category if none selected
        if (!activeCategory && dbCategories.length > 0) {
          setActiveCategory(dbCategories[0].id);
        }
        console.log("Loaded categories:", dbCategories);
      } catch (err: any) {
        setError(err.message);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch templates from Supabase when category or search changes
  useEffect(() => {
    async function fetchTemplates() {
      if (!activeCategory) {
        setTemplates([]);
        return;
      }
      setIsLoadingTemplates(true);
      setError(null);
      try {
        console.log("Selected category ID:", activeCategory);
        const result = await getMockupTemplates(activeCategory);
        if (result.error) throw new Error(result.error);
        console.log("Templates query result:", result.templates);
        const mapped = (result.templates || []).map((t: any) => ({
          id: t.id,
          name: t.name,
          category: t.category_id, // store category_id for matching
          baseImageUrl: t.base_image_url || t.preview_url || "",
          thumbnailUrl: t.thumbnail_url || t.preview_url || t.base_image_url || "",
          logoPlacement: t.logo_placement || {},
          outputWidth: t.output_width || 800,
          outputHeight: t.output_height || 600,
          isPremium: t.is_premium || false
        }));
        setTemplates(mapped);
      } catch (err: any) {
        setError(err.message);
        setTemplates([]);
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Auto-select first available template when filtering or searching
  useEffect(() => {
    if (filteredTemplates.length === 0) {
      setSelectedId(null);
    } else if (!selectedId || !filteredTemplates.some((t) => t.id === selectedId)) {
      setSelectedId(filteredTemplates[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTemplates]);

  const selectedTemplate = templates.find((t: any) => t.id === selectedId) || null;
  const previewUrl = selectedTemplate ? getPreviewUrl(selectedTemplate) : null;

  useEffect(() => {
    async function checkNewUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsNewUser(null); // Not signed in
        return;
      }
      const { count } = await supabase
        .from("generated_mockups")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      setIsNewUser(typeof count === "number" ? count === 0 : null);
    }
    checkNewUser();
  }, []);

  useEffect(() => {
    async function fetchUserStats() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsNewUser(null);
        setUserStats({ mockupsCreated: 0, templatesUsed: 0, downloads: 0 });
        return;
      }
      // Count mockups created
      const { count: mockupsCreated } = await supabase
        .from("generated_mockups")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      // Count unique templates used
      const { data: templatesUsedRows } = await supabase
        .from("generated_mockups")
        .select("template_id")
        .eq("user_id", user.id);
      const templatesUsed = templatesUsedRows
        ? new Set(templatesUsedRows.map((row: any) => row.template_id)).size
        : 0;
      // Sum downloads
      const { data: downloadsRows } = await supabase
        .from("generated_mockups")
        .select("downloads")
        .eq("user_id", user.id);
      const downloads = downloadsRows
        ? downloadsRows.reduce((sum: number, row: any) => sum + (row.downloads || 0), 0)
        : 0;
      setUserStats({
        mockupsCreated: typeof mockupsCreated === "number" ? mockupsCreated : 0,
        templatesUsed,
        downloads,
      });
      setIsNewUser(!mockupsCreated);
    }
    fetchUserStats();
  }, []);

  return (
    <>
      {isNewUser === true ? (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center text-neutral-500 text-lg">
          Welcome! Your account is new. You haven't created any mockups yet.<br />
          Start by generating your first mockup!
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {selectedTemplate ? (
              <>
                <span className="font-semibold text-zinc-900 dark:text-white">{selectedTemplate.name}</span> selected
              </>
            ) : (
              "No template selected"
            )}
          </span>
          <Button
            size="lg"
            disabled={!selectedTemplate}
            className={cn(
              "rounded-full px-6 font-semibold shadow-md transition-all",
              selectedTemplate
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
            )}
            onClick={() => {
              if (selectedTemplate) {
                window.location.href = `/generate?template=${selectedTemplate.id}`;
              }
            }}
          >
            Generate
          </Button>
        </div>
      </div>
      {/* Stats Section - Always show, zero for new users */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow border">
          <div className="text-xs text-neutral-500 mb-1 font-medium">Mockups Created</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {userStats.mockupsCreated}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow border">
          <div className="text-xs text-neutral-500 mb-1 font-medium">Templates Used</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {userStats.templatesUsed}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow border">
          <div className="text-xs text-neutral-500 mb-1 font-medium">Downloads</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {userStats.downloads}
          </div>
        </div>
      </div>
      {/* New user empty state */}
      {isNewUser ? (
        <div className="max-w-2xl mx-auto px-4 py-24 text-center text-neutral-500 text-lg">
          Welcome! Your account is new. You haven't created any mockups yet.<br />
          Start by generating your first mockup!
        </div>
      ) : (
        <>
          {/* Preview Area */}
          {selectedTemplate && (
            <div className="mb-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-full md:w-1/2 max-w-xl mx-auto">
                <SafeImageWithSkeleton
                  src={previewUrl!}
                  alt={selectedTemplate.name}
                  aspect="aspect-[4/3]"
                  className="w-full border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-md bg-white dark:bg-zinc-950"
                />
              </div>
              <div className="flex-1 flex flex-col gap-4 items-center md:items-start justify-center">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">{selectedTemplate.name}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
                  {categories.find((cat) => cat.slug === selectedTemplate.category)?.name || selectedTemplate.category}
                </p>
                <Button
                  size="lg"
                  className="rounded-full px-8 font-semibold shadow-md"
                  onClick={() => window.location.href = `/generate?template=${selectedTemplate.id}`}
                >
                  Generate with this Template
                </Button>
              </div>
            </div>
          )}
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
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
          </div>
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {isLoadingCategories ? (
              <Skeleton className="w-32 h-8 rounded-full" />
            ) : categories.length === 0 ? (
              <span className="text-zinc-400">No categories found.</span>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    activeCategory === category.id
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  )}
                >
                  {category.name} <span className="ml-2 text-xs text-zinc-400">({category.templateCount})</span>
                </button>
              ))
            )}
          </div>
          {/* Results count */}
          <p className="text-sm text-zinc-500 mb-6">
            {isLoadingTemplates ? "Loading templates..." : error ? `Error: ${error}` : `${filteredTemplates.length} mockup${filteredTemplates.length !== 1 ? "s" : ""}`}
          </p>
          {/* Mockups Grid */}
          <div className={cn("grid gap-8", "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}> 
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-zinc-400">
                <span className="text-2xl mb-2">No templates found</span>
                <span className="text-base">Try a different category.</span>
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={selectedId === template.id}
                  onSelect={() => setSelectedId(template.id)}
                  categories={categories}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
      )}
    </>
  );
}



function TemplateCard({ template, selected, onSelect, categories }: { template: MockupTemplateConfig; selected: boolean; onSelect: () => void; categories: Array<{ id: string; name: string; slug: string }> }) {
  const previewUrl = getPreviewUrl(template);
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white dark:bg-zinc-950 transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden",
        selected
          ? "border-zinc-900 dark:border-zinc-100 ring-2 ring-primary/80 shadow-xl"
          : "border-zinc-200 dark:border-zinc-800"
      )}
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelect()}
    >
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10">
        {selected && (
          <Badge className="rounded-full px-2 py-1 bg-primary/90 text-white flex items-center gap-1 shadow">
            <CheckCircle size={16} className="mr-1" /> Selected
          </Badge>
        )}
      </div>
      <div className="absolute top-3 right-3 z-10">
        {template.isPremium && (
          <Badge className="rounded-full px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center gap-1 shadow">
            <Sparkles size={14} className="mr-1" /> Pro
          </Badge>
        )}
      </div>
      {/* Image */}
      <SafeImageWithSkeleton
        src={previewUrl}
        alt={template.name}
        aspect="aspect-[4/3]"
        className="w-full"
      />
      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none">
        <div className="bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pt-10 pb-3 min-h-[64px]">
          <div className="font-semibold text-white text-base drop-shadow">{template.name}</div>
          <div className="text-zinc-200 text-xs mt-0.5">
            {categories.find((cat) => cat.slug === template.category)?.name || template.category}
          </div>
        </div>
      </div>
      {/* Action */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-auto">
        <Button
          size="sm"
          variant={selected ? "primary" : "outline"}
          className={cn(
            "rounded-full px-4 font-medium shadow transition-all",
            selected
              ? "bg-primary text-white border-primary"
              : "bg-white/80 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
          )}
          tabIndex={-1}
        >
          {selected ? "Selected" : "Use Template"}
        </Button>
      </div>
    </div>
  );
}
