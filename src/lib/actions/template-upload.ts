"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadTemplatePipeline } from "@/lib/template-upload";
import { revalidatePath } from "next/cache";

export interface UploadTemplateResult {
  success: boolean;
  error?: string;
  templateId?: string;
  assetUrl?: string;
  previewUrl?: string;
}

/**
 * Server action: upload a new mockup template.
 *
 * Expects FormData with:
 *  - name: string
 *  - categoryId: string (UUID)
 *  - file: File
 *  - isPremium: "true" | "false" (optional, defaults to false)
 */
export async function uploadTemplate(
  formData: FormData
): Promise<UploadTemplateResult> {
  // ── Auth check ──────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  if (user.email !== "amrdwedari1@gmail.com") {
    return { success: false, error: "Unauthorized. Admin access only." };
  }

  // ── Extract fields ──────────────────────────────────────────────────────
  const name = formData.get("name") as string | null;
  const categoryId = formData.get("categoryId") as string | null;
  const file = formData.get("file") as File | null;
  const isPremium = formData.get("isPremium") === "true";

  if (!name || !name.trim()) {
    return { success: false, error: "Template name is required." };
  }
  if (!categoryId) {
    return { success: false, error: "Category is required." };
  }
  if (!file || file.size === 0) {
    return { success: false, error: "An image file is required." };
  }

  // ── Resolve category slug ──────────────────────────────────────────────
  const { data: category, error: catError } = await supabase
    .from("mockup_categories")
    .select("slug")
    .eq("id", categoryId)
    .single();

  if (catError || !category) {
    return { success: false, error: "Invalid category." };
  }

  // ── Run pipeline ───────────────────────────────────────────────────────
  const result = await uploadTemplatePipeline({
    name: name.trim(),
    categoryId,
    categorySlug: category.slug,
    file,
    isPremium,
  });

  if (result.success) {
    revalidatePath("/mockups");
    revalidatePath("/admin/templates");
  }

  return result;
}

/**
 * Server action: fetch all categories for the upload form dropdown.
 */
export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mockup_categories")
    .select("id, name, slug")
    .order("display_order", { ascending: true });

  if (error) {
    return { error: error.message, categories: [] };
  }

  return { categories: data ?? [] };
}
