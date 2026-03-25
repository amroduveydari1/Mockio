"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Filter, Check } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { MockupCard } from "@/components";


// TODO: Integrate real template data from Supabase or API here.

const categoryNames: { [key: string]: string } = {
  "business-cards": "Business Cards",
  signage: "Signage",
  apparel: "Apparel",
  packaging: "Packaging",
  digital: "Digital Screens",
  stationery: "Stationery",
  print: "Print",
  "social-media": "Social Media",
};

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.category as string;
  const logoName = searchParams.get("logo");
  const categoryName = categoryNames[categorySlug] || "Mockups";


  const [templateCount, setTemplateCount] = useState<number | null>(null);
  const [recentMockups, setRecentMockups] = useState<any[]>([]);
  const [stats, setStats] = useState({
    mockupsCreated: null as number | null,
    templatesUsed: null as number | null,
    downloads: null as number | null,
  });
  // Use Supabase browser client for client-side fetch
  useEffect(() => {
    async function fetchTemplateCount() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      // Get the category id for this slug
      const { data: cat } = await supabase
        .from("mockup_categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();
      if (!cat) {
        setTemplateCount(0);
        return;
      }
      // Count templates for this category
      const { count } = await supabase
        .from("mockup_templates")
        .select("id", { count: "exact", head: true })
        .eq("category_id", cat.id)
        .eq("is_active", true);
      setTemplateCount(typeof count === "number" ? count : 0);
    }
    fetchTemplateCount();
  }, [categorySlug]);

  useEffect(() => {
    async function fetchRecentMockups() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      // Get the category id for this slug
      const { data: cat } = await supabase
        .from("mockup_categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();
      if (!cat) {
        setRecentMockups([]);
        return;
      }
      // Fetch recent mockups for this category (limit 5)
      const { data: mockups } = await supabase
        .from("generated_mockups")
        .select("id, name, created_at, template:mockup_templates(name), image_url")
        .eq("category_id", cat.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentMockups(mockups || []);
    }
    fetchRecentMockups();
  }, [categorySlug]);

  useEffect(() => {
    async function fetchStats() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      // Get the category id for this slug
      const { data: cat } = await supabase
        .from("mockup_categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();
      if (!cat) {
        setStats({ mockupsCreated: 0, templatesUsed: 0, downloads: 0 });
        return;
      }
      // Count mockups created for this category
      const { count: mockupsCreated } = await supabase
        .from("generated_mockups")
        .select("id", { count: "exact", head: true })
        .eq("category_id", cat.id);
      // Count unique templates used for this category
      const { data: templatesUsedRows } = await supabase
        .from("generated_mockups")
        .select("template_id")
        .eq("category_id", cat.id);
      const templatesUsed = templatesUsedRows
        ? new Set(templatesUsedRows.map((row: any) => row.template_id)).size
        : 0;
      // Sum downloads for this category
      const { data: downloadsRows } = await supabase
        .from("generated_mockups")
        .select("downloads")
        .eq("category_id", cat.id);
      const downloads = downloadsRows
        ? downloadsRows.reduce((sum: number, row: any) => sum + (row.downloads || 0), 0)
        : 0;
      setStats({
        mockupsCreated: typeof mockupsCreated === "number" ? mockupsCreated : 0,
        templatesUsed,
        downloads,
      });
    }
    fetchStats();
  }, [categorySlug]);

  // Robust new user detection
  const isNewUser = !stats.mockupsCreated;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/mockups"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={16} />
          Back to categories
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {categoryName}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {templateCount === null && "Loading templates..."}
              {templateCount !== null && templateCount > 0 && (
                <>
                  {templateCount} template{templateCount !== 1 ? "s" : ""} available
                </>
              )}
              {templateCount !== null && templateCount === 0 && "No templates available. Please check back later."}
              {logoName && (
                <span className="ml-2">
                  • Using logo: <span className="font-medium">{logoName}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      {/* Stats Section - Real Data Only */}
      {!isNewUser && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow border">
            <div className="text-xs text-neutral-500 mb-1 font-medium">Mockups Created</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.mockupsCreated === null ? "-" : stats.mockupsCreated}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow border">
            <div className="text-xs text-neutral-500 mb-1 font-medium">Templates Used</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.templatesUsed === null ? "-" : stats.templatesUsed}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow border">
            <div className="text-xs text-neutral-500 mb-1 font-medium">Downloads</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stats.downloads === null ? "-" : stats.downloads}
            </div>
          </div>
        </div>
      )}
      {/* Recent Mockups Section */}
      {!isNewUser && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Recent Mockups</h2>
          {recentMockups.length === 0 ? (
            <p className="text-neutral-500">No recent mockups found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recentMockups.map((mockup) => (
                <div key={mockup.id} className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
                  <div className="aspect-[4/3] w-full rounded mb-3 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {mockup.image_url && (
                      <img src={mockup.image_url} alt={mockup.name} className="object-contain w-full h-full" />
                    )}
                  </div>
                  <div className="font-medium text-neutral-900 dark:text-white truncate">{mockup.name}</div>
                  <div className="text-xs text-neutral-500 truncate">{mockup.template?.name}</div>
                  <div className="text-xs text-neutral-400 mt-1">
                    {new Date(mockup.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {isNewUser && (
        <div className="mt-12 text-center text-neutral-500 text-lg">
          Welcome! Your account is new. You haven't created any mockups in this category yet.
        </div>
      )}
    </div>
  );
}
