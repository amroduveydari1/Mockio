"use client";

import { useState } from "react";
import { User, CreditCard, Bell, Shield, LogOut } from "lucide-react";
import { Button, Input, Card, CardContent, Badge } from "@/components/ui";
import { signOut } from "@/lib/actions/auth";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <Card variant="bordered">
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
              <hr className="my-2 border-neutral-200 dark:border-neutral-800" />
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={18} />
                {isLoading ? "Signing out..." : "Sign out"}
              </button>
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card variant="bordered">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Profile Information
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Update your personal details
                </p>
              </div>
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="John Doe"
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      disabled
                    />
                  </div>
                  <Button>Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <Card variant="bordered">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Current Plan
                  </h2>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          Free Plan
                        </h3>
                        <Badge variant="default">Current</Badge>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                        10 mockups per month
                      </p>
                    </div>
                    <Button>Upgrade to Pro</Button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="bordered">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Usage
                  </h2>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Mockups Generated
                        </span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          3 / 10
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 dark:bg-white rounded-full"
                          style={{ width: "30%" }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <Card variant="bordered">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Notification Preferences
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Choose what updates you want to receive
                </p>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { label: "Email notifications", description: "Receive updates about your mockups" },
                    { label: "Marketing emails", description: "News, tips, and product updates" },
                    { label: "Security alerts", description: "Important account security notifications" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-800 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {item.label}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {item.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-neutral-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900 dark:peer-checked:bg-white"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <Card variant="bordered">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Change Password
                  </h2>
                </div>
                <CardContent className="p-6">
                  <form className="space-y-4 max-w-md">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                    />
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="••••••••"
                    />
                    <Button>Update Password</Button>
                  </form>
                </CardContent>
              </Card>

              <Card variant="bordered">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Delete Account
                  </h2>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
