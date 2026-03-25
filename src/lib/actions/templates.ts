"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { TemplateDataPayload } from "@/lib/template-editor-utils";

export async function getTemplatesForEditor() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mockup_templates")
    .select("id, name, preview_url, asset_url, template_data, mockup_categories(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { templates: data };
}

export async function getTemplateById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mockup_templates")
    .select("id, name, preview_url, asset_url, template_data")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { template: data };
}

export async function saveTemplateData(
  templateId: string,
  payload: TemplateDataPayload
) {
  // Use the admin client to bypass RLS (no UPDATE policy on mockup_templates)
  try {
    const admin = createAdminClient();

    const { error } = await admin
      .from("mockup_templates")
      .update({ template_data: payload })
      .eq("id", templateId);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    return { error: e.message || "Failed to save template data" };
  }
}
