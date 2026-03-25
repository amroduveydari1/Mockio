import Link from "next/link";
import {
  Upload,
  Grid3X3,
  Image,
  TrendingUp,
  ArrowRight,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  // Fetch real stats
  let mockupsCreated = 0;
  let templatesUsed = 0;
  let downloads = 0;
  let recentMockups: Array<{ id: string; name: string; created_at: string }> = [];

  if (user) {
    // Count mockups created
    const { count: mockupsCount } = await supabase
      .from("generated_mockups")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    mockupsCreated = typeof mockupsCount === "number" ? mockupsCount : 0;

    // Count unique templates used
    const { data: templatesUsedRows } = await supabase
      .from("generated_mockups")
      .select("template_id")
      .eq("user_id", user.id);
    templatesUsed = templatesUsedRows
      ? new Set(templatesUsedRows.map((row: any) => row.template_id)).size
      : 0;

    // Sum downloads (if field exists)
    const { data: downloadsRows } = await supabase
      .from("generated_mockups")
      .select("downloads")
      .eq("user_id", user.id);
    downloads = downloadsRows
      ? downloadsRows.reduce((sum: number, row: any) => sum + (row.downloads || 0), 0)
      : 0;

    // Fetch recent mockups (latest 5)
    const { data: recentRows } = await supabase
      .from("generated_mockups")
      .select("id, template_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    // Optionally join with template name
    if (recentRows && recentRows.length > 0) {
      // Fetch template names in batch
      const templateIds = recentRows.map((row: any) => row.template_id);
      const { data: templateRows } = await supabase
        .from("mockup_templates")
        .select("id, name")
        .in("id", templateIds);
      const templateMap = new Map(
        (templateRows || []).map((t: any) => [t.id, t.name])
      );
      recentMockups = recentRows.map((row: any) => ({
        id: row.id,
        name: templateMap.get(row.template_id) || "Mockup",
        created_at: row.created_at,
      }));
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Welcome back, {firstName}!
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Here&apos;s what&apos;s happening with your mockups.
        </p>
      </div>

      {/* Generate Brand Set CTA */}
      <Link href="/generate">
        <Card
          variant="bordered"
          className="p-6 mb-8 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles
                  size={24}
                  className="text-white dark:text-zinc-900"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                    Generate Brand Set™
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    New
                  </span>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  One logo → complete brand presentation across packaging, cards, screens & signage
                </p>
              </div>
            </div>
            <ArrowRight
              size={20}
              className="text-neutral-400 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </Card>
      </Link>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/upload">
          <Card
            variant="bordered"
            className="p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                <Upload
                  size={24}
                  className="text-neutral-700 dark:text-neutral-300"
                />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  Upload Logo
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Start a new mockup
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/mockups">
          <Card
            variant="bordered"
            className="p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                <Grid3X3
                  size={24}
                  className="text-neutral-700 dark:text-neutral-300"
                />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  Browse Templates
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Explore mockup library
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/generated">
          <Card
            variant="bordered"
            className="p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                <Image
                  size={24}
                  className="text-neutral-700 dark:text-neutral-300"
                />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  My Mockups
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  View generated designs
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card variant="bordered" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Image size={20} className="text-neutral-700 dark:text-neutral-300" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {mockupsCreated}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Mockups Created
          </p>
        </Card>
        <Card variant="bordered" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Grid3X3 size={20} className="text-neutral-700 dark:text-neutral-300" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {templatesUsed}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Templates Used
          </p>
        </Card>
        <Card variant="bordered" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <TrendingUp size={20} className="text-neutral-700 dark:text-neutral-300" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {downloads}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Downloads
          </p>
        </Card>
      </div>

      {/* Recent Mockups */}
      <Card variant="bordered">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Recent Mockups
          </h2>
          <Link href="/generated">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <CardContent className="p-0">
          {recentMockups.length > 0 ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {recentMockups.map((mockup) => (
                <div
                  key={mockup.id}
                  className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Image
                        size={20}
                        className="text-neutral-500 dark:text-neutral-400"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {mockup.name}
                      </p>
                      <p className="text-sm text-neutral-500">{new Date(mockup.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Open
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                <Image
                  size={28}
                  className="text-neutral-400 dark:text-neutral-500"
                />
              </div>
              <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
                No mockups yet
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Upload your first logo to get started
              </p>
              <Link href="/upload">
                <Button>
                  <Plus size={18} />
                  Create Mockup
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
