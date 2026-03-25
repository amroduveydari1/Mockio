"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_FILE_TYPES = ["image/png", "image/svg+xml"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface Logo {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

interface UploadResult {
  success?: boolean;
  error?: string;
  logo?: Logo;
}

export async function uploadLogo(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated. Please sign in to upload logos." };
  }

  const file = formData.get("file") as File;
  const name = formData.get("name") as string;

  if (!file) {
    return { error: "No file provided" };
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Please upload a PNG or SVG file only." };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: `File size must be less than 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` };
  }

  // Generate unique file path
  const fileExt = file.type === "image/svg+xml" ? "svg" : "png";
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("logos")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return { error: `Failed to upload file: ${uploadError.message}` };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("logos").getPublicUrl(fileName);

  // Save logo record to database
  const { data: logoData, error: dbError } = await supabase
    .from("logos")
    .insert({
      user_id: user.id,
      name: name || file.name.replace(/\.[^/.]+$/, ""),
      file_url: publicUrl,
      file_path: fileName,
      file_size: file.size,
      file_type: file.type,
    })
    .select()
    .single();

  if (dbError) {
    // If database insert fails, clean up the uploaded file
    await supabase.storage.from("logos").remove([fileName]);
    console.error("Database insert error:", dbError);
    return { error: `Failed to save logo: ${dbError.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/upload");
  
  return { success: true, logo: logoData as Logo };
}

export async function getUserLogos() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("logos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { logos: data };
}

export async function deleteLogo(logoId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get logo file path
  const { data: logo } = await supabase
    .from("logos")
    .select("file_path")
    .eq("id", logoId)
    .eq("user_id", user.id)
    .single();

  if (!logo) {
    return { error: "Logo not found" };
  }

  // Delete from storage
  await supabase.storage.from("logos").remove([logo.file_path]);

  // Delete from database
  const { error } = await supabase
    .from("logos")
    .delete()
    .eq("id", logoId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getMockupCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mockup_categories")
    .select("*, mockup_templates(count)")
    .order("display_order", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { categories: data };
}

export async function getMockupTemplates(categoryId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("mockup_templates")
    .select("*, mockup_categories(slug)")
    .eq("is_active", true);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { templates: data };
}

export async function generateMockup(
  logoId: string,
  templateId: string,
  name: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check user's mockup limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("mockups_generated, monthly_limit, subscription_tier")
    .eq("id", user.id)
    .single();

  if (
    profile &&
    profile.subscription_tier === "free" &&
    profile.mockups_generated >= profile.monthly_limit
  ) {
    return { error: "Monthly mockup limit reached. Please upgrade to Pro." };
  }

  // In a real app, this would call a mockup generation service
  // For now, we'll create a placeholder record

  const mockupPath = `${user.id}/mockups/${Date.now()}.png`;
  const mockupUrl = `/api/placeholder/800/600`; // Placeholder URL

  // Save generated mockup record
  const { data: mockupData, error: dbError } = await supabase
    .from("generated_mockups")
    .insert({
      user_id: user.id,
      logo_id: logoId,
      template_id: templateId,
      name: name,
      result_url: mockupUrl,
      result_path: mockupPath,
    })
    .select()
    .single();

  if (dbError) {
    return { error: dbError.message };
  }

  // Increment user's mockup count
  await supabase
    .from("profiles")
    .update({ mockups_generated: (profile?.mockups_generated || 0) + 1 })
    .eq("id", user.id);

  revalidatePath("/generated");
  revalidatePath("/dashboard");
  return { success: true, mockup: mockupData };
}

export async function getUserMockups() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("generated_mockups")
    .select("*, logos(name), mockup_templates(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { mockups: data };
}

export async function deleteMockup(mockupId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get mockup file path
  const { data: mockup } = await supabase
    .from("generated_mockups")
    .select("result_path")
    .eq("id", mockupId)
    .eq("user_id", user.id)
    .single();

  if (!mockup) {
    return { error: "Mockup not found" };
  }

  // Delete from storage
  await supabase.storage.from("mockups").remove([mockup.result_path]);

  // Delete from database
  const { error } = await supabase
    .from("generated_mockups")
    .delete()
    .eq("id", mockupId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/generated");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Save a generated mockup image to Supabase Storage
 * This accepts the image as a base64 data URL from client-side generation
 */
export async function saveGeneratedMockup(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const imageData = formData.get("image") as string; // base64 data URL
  const name = formData.get("name") as string;
  const logoId = formData.get("logoId") as string | null;
  const templateId = formData.get("templateId") as string;

  if (!imageData || !name || !templateId) {
    return { error: "Missing required fields" };
  }

  // Check user's mockup limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("mockups_generated, monthly_limit, subscription_tier")
    .eq("id", user.id)
    .single();

  if (
    profile &&
    profile.subscription_tier === "free" &&
    profile.mockups_generated >= profile.monthly_limit
  ) {
    return { error: "Monthly mockup limit reached. Please upgrade to Pro." };
  }

  try {
    // Convert base64 to blob
    const base64Data = imageData.split(",")[1];
    const binaryData = Buffer.from(base64Data, "base64");

    // Generate unique file path
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("mockups")
      .upload(fileName, binaryData, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { error: `Failed to upload mockup: ${uploadError.message}` };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("mockups").getPublicUrl(fileName);

    // Save record to database
    const { data: mockupData, error: dbError } = await supabase
      .from("generated_mockups")
      .insert({
        user_id: user.id,
        logo_id: logoId || null,
        template_id: templateId,
        name: name,
        result_url: publicUrl,
        result_path: fileName,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file
      await supabase.storage.from("mockups").remove([fileName]);
      console.error("Database insert error:", dbError);
      return { error: `Failed to save mockup: ${dbError.message}` };
    }

    // Increment user's mockup count
    if (profile) {
      await supabase
        .from("profiles")
        .update({ mockups_generated: (profile.mockups_generated || 0) + 1 })
        .eq("id", user.id);
    }

    revalidatePath("/generated");
    revalidatePath("/dashboard");

    return { success: true, mockup: mockupData };
  } catch (error) {
    console.error("Save mockup error:", error);
    return { error: "Failed to save mockup" };
  }
}
