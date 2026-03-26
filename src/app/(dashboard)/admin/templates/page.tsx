"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Button, Card, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  getAdminTemplates,
  toggleTemplateActive,
  toggleTemplatePremium,
  deleteTemplate,
  updateTemplateName,
} from "@/lib/actions/admin";

interface Template {
  id: string;
  name: string;
  preview_url: string | null;
  asset_url: string | null;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  template_data: any;
  mockup_categories: { name: string; slug: string } | null;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    const res = await getAdminTemplates();
    setTemplates((res.templates ?? []) as Template[]);
    setLoading(false);
  }

  async function handleToggleActive(id: string, current: boolean) {
    setActionId(id);
    await toggleTemplateActive(id, !current);
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_active: !current } : t))
    );
    setActionId(null);
  }

  async function handleTogglePremium(id: string, current: boolean) {
    setActionId(id);
    await toggleTemplatePremium(id, !current);
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_premium: !current } : t))
    );
    setActionId(null);
  }

  async function handleDelete(id: string) {
    setActionId(id);
    const res = await deleteTemplate(id);
    if (!res.error) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
    setConfirmDeleteId(null);
    setActionId(null);
  }

  async function handleSaveName(id: string) {
    if (!editName.trim()) return;
    setActionId(id);
    await updateTemplateName(id, editName.trim());
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: editName.trim() } : t))
    );
    setEditingId(null);
    setActionId(null);
  }

  const filtered = templates.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.mockup_categories?.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Templates
            </h1>
            <Badge variant="info">{templates.length}</Badge>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-8">
            Manage all mockup templates.
          </p>
        </div>
        <Link href="/admin/templates/new">
          <Button>
            <Plus size={16} />
            Upload Template
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input placeholder="Search templates…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-zinc-400" size={28} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          {search ? "No templates match your search." : "No templates yet."}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <Card variant="bordered" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Preview</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Category</th>
                  <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Premium</th>
                  <th className="text-center px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Data</th>
                  <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {filtered.map((t) => (
                  <tr key={t.id} className={cn("hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group", !t.is_active && "opacity-50")}>
                    <td className="px-4 py-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                        {t.preview_url ? (
                          <img src={t.preview_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No img</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === t.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            className="border border-zinc-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white w-40"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveName(t.id)}
                            autoFocus
                          />
                          <button onClick={() => handleSaveName(t.id)} className="p-1 text-emerald-500 hover:text-emerald-600"><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-zinc-400 hover:text-zinc-600"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-900 dark:text-white">{t.name}</span>
                          <button onClick={() => { setEditingId(t.id); setEditName(t.name); }} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-600 transition-opacity">
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-zinc-400 mt-0.5 font-mono">{t.id.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{t.mockup_categories?.name ?? "None"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(t.id, t.is_active)}
                        disabled={actionId === t.id}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                          t.is_active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200"
                        )}
                      >
                        {t.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                        {t.is_active ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePremium(t.id, t.is_premium)}
                        disabled={actionId === t.id}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                          t.is_premium
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 hover:bg-amber-100"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200"
                        )}
                      >
                        <Crown size={12} />
                        {t.is_premium ? "Premium" : "Free"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("text-xs", t.template_data ? "text-emerald-500" : "text-zinc-400")}>
                        {t.template_data ? "✓ Set" : "— None"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {t.asset_url && (
                          <a href={t.asset_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button onClick={() => { setEditingId(t.id); setEditName(t.name); }} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                          <Pencil size={14} />
                        </button>
                        {confirmDeleteId === t.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(t.id)} disabled={actionId === t.id} className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                              {actionId === t.id ? <Loader2 size={12} className="animate-spin" /> : "Delete"}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(t.id)} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
