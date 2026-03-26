"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = "amrdwedari1@gmail.com";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
  return user;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getAdminStats() {
  await requireAdmin();
  const admin = createAdminClient();

  const [
    { count: templateCount },
    { count: categoryCount },
    { count: userCount },
    { count: mockupCount },
  ] = await Promise.all([
    admin.from("mockup_templates").select("id", { count: "exact", head: true }),
    admin.from("mockup_categories").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("generated_mockups").select("id", { count: "exact", head: true }),
  ]);

  return {
    templates: templateCount ?? 0,
    categories: categoryCount ?? 0,
    users: userCount ?? 0,
    mockups: mockupCount ?? 0,
  };
}

// ─── Templates CRUD ───────────────────────────────────────────────────────────

export async function getAdminTemplates() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("mockup_templates")
    .select("*, mockup_categories(name, slug)")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, templates: [] };
  return { templates: data ?? [] };
}

export async function toggleTemplateActive(templateId: string, isActive: boolean) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("mockup_templates")
    .update({ is_active: isActive })
    .eq("id", templateId);

  if (error) return { error: error.message };

  revalidatePath("/admin/templates");
  revalidatePath("/mockups");
  return { success: true };
}

export async function toggleTemplatePremium(templateId: string, isPremium: boolean) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("mockup_templates")
    .update({ is_premium: isPremium })
    .eq("id", templateId);

  if (error) return { error: error.message };

  revalidatePath("/admin/templates");
  return { success: true };
}

export async function deleteTemplate(templateId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: template } = await admin
    .from("mockup_templates")
    .select("asset_url, preview_url")
    .eq("id", templateId)
    .single();

  const { error } = await admin
    .from("mockup_templates")
    .delete()
    .eq("id", templateId);

  if (error) return { error: error.message };

  revalidatePath("/admin/templates");
  revalidatePath("/mockups");
  return { success: true };
}

export async function updateTemplateName(templateId: string, name: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("mockup_templates")
    .update({ name })
    .eq("id", templateId);

  if (error) return { error: error.message };

  revalidatePath("/admin/templates");
  return { success: true };
}

// ─── Categories CRUD ──────────────────────────────────────────────────────────

export async function getAdminCategories() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("mockup_categories")
    .select("*, mockup_templates(count)")
    .order("display_order", { ascending: true });

  if (error) return { error: error.message, categories: [] };
  return { categories: data ?? [] };
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;

  if (!name || !slug) return { error: "Name and slug are required." };

  const { data, error } = await admin
    .from("mockup_categories")
    .insert({ name, slug, description, display_order: displayOrder })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/mockups");
  return { success: true, id: data.id };
}

export async function updateCategory(
  categoryId: string,
  fields: { name?: string; slug?: string; description?: string; display_order?: number }
) {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("mockup_categories")
    .update(fields)
    .eq("id", categoryId);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/mockups");
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  // Check for templates using this category
  const { count } = await admin
    .from("mockup_templates")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (count && count > 0) {
    return { error: `Cannot delete: ${count} template(s) are using this category. Remove or reassign them first.` };
  }

  const { error } = await admin
    .from("mockup_categories")
    .delete()
    .eq("id", categoryId);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/mockups");
  return { success: true };
}
