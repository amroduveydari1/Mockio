"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  GripVertical,
} from "lucide-react";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/admin";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  mockup_templates: { count: number }[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState({ name: "", slug: "", description: "", display_order: 0 });
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFields, setNewFields] = useState({ name: "", slug: "", description: "", displayOrder: "0" });
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const res = await getAdminCategories();
    setCategories((res.categories ?? []) as Category[]);
    setLoading(false);
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.append("name", newFields.name);
    formData.append("slug", newFields.slug);
    formData.append("description", newFields.description);
    formData.append("displayOrder", newFields.displayOrder);

    const res = await createCategory(formData);
    if (res.error) {
      setError(res.error);
      return;
    }
    setShowNewForm(false);
    setNewFields({ name: "", slug: "", description: "", displayOrder: "0" });
    await loadCategories();
  }

  async function handleUpdate(id: string) {
    setActionId(id);
    const res = await updateCategory(id, {
      name: editFields.name,
      slug: editFields.slug,
      description: editFields.description || undefined,
      display_order: editFields.display_order,
    });
    if (res.error) {
      setError(res.error);
    } else {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, name: editFields.name, slug: editFields.slug, description: editFields.description, display_order: editFields.display_order }
            : c
        )
      );
    }
    setEditingId(null);
    setActionId(null);
  }

  async function handleDelete(id: string) {
    setActionId(id);
    setError(null);
    const res = await deleteCategory(id);
    if (res.error) {
      setError(res.error);
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    setConfirmDeleteId(null);
    setActionId(null);
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Categories
            </h1>
            <Badge variant="info">{categories.length}</Badge>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-8">
            Manage mockup categories.
          </p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          {showNewForm ? <X size={16} /> : <Plus size={16} />}
          {showNewForm ? "Cancel" : "New Category"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* New Category Form */}
      {showNewForm && (
        <Card variant="bordered" className="mb-6">
          <CardContent className="p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  placeholder="e.g. Business Cards"
                  value={newFields.name}
                  onChange={(e) => {
                    setNewFields({ ...newFields, name: e.target.value, slug: autoSlug(e.target.value) });
                  }}
                  required
                />
                <Input
                  label="Slug"
                  placeholder="e.g. business-card"
                  value={newFields.slug}
                  onChange={(e) => setNewFields({ ...newFields, slug: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Description"
                    placeholder="Brief description"
                    value={newFields.description}
                    onChange={(e) => setNewFields({ ...newFields, description: e.target.value })}
                  />
                </div>
                <Input
                  label="Display Order"
                  type="number"
                  value={newFields.displayOrder}
                  onChange={(e) => setNewFields({ ...newFields, displayOrder: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  <Plus size={14} />
                  Create Category
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-zinc-400" size={28} />
        </div>
      )}

      {/* Categories List */}
      {!loading && categories.length > 0 && (
        <div className="space-y-2">
          {categories.map((cat) => {
            const templateCount = cat.mockup_templates?.[0]?.count ?? 0;
            const isEditing = editingId === cat.id;

            return (
              <Card key={cat.id} variant="bordered" className={cn("transition-colors", isEditing && "ring-2 ring-zinc-900 dark:ring-zinc-100")}>
                <div className="p-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="Name"
                          value={editFields.name}
                          onChange={(e) => setEditFields({ ...editFields, name: e.target.value })}
                        />
                        <Input
                          label="Slug"
                          value={editFields.slug}
                          onChange={(e) => setEditFields({ ...editFields, slug: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <Input
                            label="Description"
                            value={editFields.description}
                            onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                          />
                        </div>
                        <Input
                          label="Order"
                          type="number"
                          value={editFields.display_order.toString()}
                          onChange={(e) => setEditFields({ ...editFields, display_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                          <X size={14} /> Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleUpdate(cat.id)} disabled={actionId === cat.id}>
                          {actionId === cat.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="text-zinc-300 dark:text-zinc-600">
                        <GripVertical size={16} />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-zinc-600 dark:text-zinc-400">
                          {cat.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-zinc-900 dark:text-white">{cat.name}</h3>
                          <Badge variant="info">{templateCount} templates</Badge>
                          <span className="text-xs text-zinc-400 font-mono">/{cat.slug}</span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-zinc-500 mt-0.5 truncate">{cat.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-zinc-400 mr-2">#{cat.display_order}</span>
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditFields({
                              name: cat.name,
                              slug: cat.slug,
                              description: cat.description || "",
                              display_order: cat.display_order,
                            });
                          }}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        {confirmDeleteId === cat.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(cat.id)}
                              disabled={actionId === cat.id}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              {actionId === cat.id ? <Loader2 size={12} className="animate-spin" /> : "Delete"}
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 text-xs text-zinc-500">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(cat.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          No categories yet. Create one above.
        </div>
      )}
    </div>
  );
}
