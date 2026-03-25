import { Sidebar } from "@/components/layout";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar
        user={{
          email: user?.email || "",
          full_name: user?.user_metadata?.full_name,
          avatar_url: user?.user_metadata?.avatar_url,
        }}
      />

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-screen pt-16 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
