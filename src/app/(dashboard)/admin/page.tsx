import Link from "next/link";
import {
  LayoutGrid,
  FolderOpen,
  Users,
  Image,
  ArrowRight,
  ImagePlus,
  Layers,
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { getAdminStats } from "@/lib/actions/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const statCards = [
    { label: "Templates", value: stats.templates, icon: LayoutGrid, href: "/admin/templates" },
    { label: "Categories", value: stats.categories, icon: FolderOpen, href: "/admin/categories" },
    { label: "Users", value: stats.users, icon: Users, href: "#" },
    { label: "Generated Mockups", value: stats.mockups, icon: Image, href: "#" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
            <Layers size={16} className="text-white dark:text-zinc-900" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Admin Panel
          </h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage templates, categories, and monitor platform usage.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card variant="bordered" className="p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                  <stat.icon size={18} className="text-zinc-600 dark:text-zinc-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {stat.label}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/templates/new">
          <Card variant="bordered" className="p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                <ImagePlus size={22} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Upload Template</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Add a new mockup template</p>
              </div>
              <ArrowRight size={18} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/templates">
          <Card variant="bordered" className="p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                <LayoutGrid size={22} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Manage Templates</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Edit, toggle, delete templates</p>
              </div>
              <ArrowRight size={18} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/categories">
          <Card variant="bordered" className="p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                <FolderOpen size={22} className="text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Manage Categories</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Add, edit, reorder categories</p>
              </div>
              <ArrowRight size={18} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
