import Link from "next/link";
import {
  Upload,
  Grid3X3,
  Image,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

// Mock data for demonstration
const recentMockups = [
  { id: "1", name: "Business Card Mockup", date: "2 hours ago" },
  { id: "2", name: "T-Shirt Design", date: "Yesterday" },
  { id: "3", name: "iPhone Screen", date: "3 days ago" },
];

const quickStats = [
  { label: "Mockups Created", value: "24", icon: Image, trend: "+12%" },
  { label: "Templates Used", value: "8", icon: Grid3X3, trend: "+5%" },
  { label: "Downloads", value: "156", icon: TrendingUp, trend: "+28%" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

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
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="bordered" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Icon
                    size={20}
                    className="text-neutral-700 dark:text-neutral-300"
                  />
                </div>
                <Badge variant="success">{stat.trend}</Badge>
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {stat.label}
              </p>
            </Card>
          );
        })}
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
                      <p className="text-sm text-neutral-500">{mockup.date}</p>
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
