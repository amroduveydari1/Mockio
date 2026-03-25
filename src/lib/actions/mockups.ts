"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { renderMockup, generateThumbnail } from "@/lib/mockup-renderer";
import type { TemplateMetadata } from "@/lib/mockup-renderer";

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

  console.log("[SERVER DEBUG] getMockupCategories data:", JSON.stringify(data, null, 2));
  console.log("[SERVER DEBUG] getMockupCategories error:", error);

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

  console.log("[SERVER DEBUG] getMockupTemplates categoryId:", categoryId);
  console.log("[SERVER DEBUG] getMockupTemplates data:", JSON.stringify(data, null, 2));
  console.log("[SERVER DEBUG] getMockupTemplates error:", error);

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

  // --- Check user's mockup limit ---
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

  // --- 1. Fetch the logo ---
  console.log("[generateMockup] Fetching logo:", logoId);
  const { data: logo, error: logoError } = await supabase
    .from("logos")
    .select("*")
    .eq("id", logoId)
    .eq("user_id", user.id)
    .single();

  if (logoError || !logo) {
    console.error("[generateMockup] Logo fetch failed:", logoError);
    return { error: `Logo not found: ${logoError?.message || "missing"}` };
  }
  console.log("[generateMockup] Logo found:", logo.name, logo.file_url);

  // --- 2. Fetch the template ---
  console.log("[generateMockup] Fetching template:", templateId);
  const { data: template, error: templateError } = await supabase
    .from("mockup_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (templateError || !template) {
    console.error("[generateMockup] Template fetch failed:", templateError);
    return { error: `Template not found: ${templateError?.message || "missing"}` };
  }
  console.log("[generateMockup] Template found:", template.name, "asset_url:", template.asset_url);

  if (!template.asset_url) {
    return { error: "Template has no asset_url. Cannot render mockup." };
  }

  // --- 3. Read template_data (auto-fallback if missing) ---
  const templateData: TemplateMetadata | null = template.template_data ?? null;
  if (templateData?.logoArea) {
    console.log("[generateMockup] Using template_data.logoArea:", templateData.logoArea);
  } else {
    console.log("[generateMockup] No logoArea in template_data — renderer will auto-fit");
  }

  // --- 4. Download the background image (template asset) ---
  console.log("[generateMockup] Downloading background image:", template.asset_url);
  let bgBuffer: Buffer;
  try {
    const bgResponse = await fetch(template.asset_url);
    if (!bgResponse.ok) {
      throw new Error(`HTTP ${bgResponse.status}: ${bgResponse.statusText}`);
    }
    bgBuffer = Buffer.from(await bgResponse.arrayBuffer());
    console.log("[generateMockup] Background downloaded, bytes:", bgBuffer.length);
  } catch (err: any) {
    console.error("[generateMockup] Background download failed:", err);
    return { error: `Failed to download template image: ${err.message}` };
  }

  // --- 5. Download the logo image ---
  console.log("[generateMockup] Downloading logo image:", logo.file_url);
  let logoBuffer: Buffer;
  try {
    const logoResponse = await fetch(logo.file_url);
    if (!logoResponse.ok) {
      throw new Error(`HTTP ${logoResponse.status}: ${logoResponse.statusText}`);
    }
    logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
    console.log("[generateMockup] Logo downloaded, bytes:", logoBuffer.length);
  } catch (err: any) {
    console.error("[generateMockup] Logo download failed:", err);
    return { error: `Failed to download logo image: ${err.message}` };
  }

  // --- 6. Render the mockup (sharp composite) ---
  console.log("[generateMockup] Rendering mockup...");
  let resultBuffer: Buffer;
  let thumbBuffer: Buffer;
  try {
    const rendered = await renderMockup({
      backgroundBuffer: bgBuffer,
      logoBuffer,
      templateData,
    });
    resultBuffer = rendered.buffer;
    console.log("[generateMockup] Render complete:", rendered.width, "x", rendered.height, "format:", rendered.format);
    console.log("[generateMockup] Used logoArea:", JSON.stringify(rendered.logoArea));

    thumbBuffer = await generateThumbnail(resultBuffer, 400);
    console.log("[generateMockup] Thumbnail generated");
  } catch (err: any) {
    console.error("[generateMockup] Image composition failed:", err);
    return { error: `Image composition failed: ${err.message}` };
  }

  // --- 7. Upload final image + thumbnail to Supabase Storage ---
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const mockupPath = `${user.id}/${timestamp}-${randomSuffix}.png`;
  const thumbPath = `${user.id}/${timestamp}-${randomSuffix}-thumb.png`;

  console.log("[generateMockup] Uploading mockup to storage:", mockupPath);
  const { error: uploadError } = await supabase.storage
    .from("generated-mockups")
    .upload(mockupPath, resultBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (uploadError) {
    console.error("[generateMockup] Mockup upload failed:", uploadError);
    return { error: `Failed to upload mockup: ${uploadError.message}` };
  }

  console.log("[generateMockup] Uploading thumbnail:", thumbPath);
  const { error: thumbUploadError } = await supabase.storage
    .from("generated-mockups")
    .upload(thumbPath, thumbBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (thumbUploadError) {
    console.warn("[generateMockup] Thumbnail upload failed (non-fatal):", thumbUploadError);
    // Continue — thumbnail is optional
  }

  // --- 8. Get public URLs ---
  const { data: { publicUrl: resultUrl } } = supabase.storage
    .from("generated-mockups")
    .getPublicUrl(mockupPath);

  let thumbnailUrl: string | null = null;
  if (!thumbUploadError) {
    const { data: { publicUrl: thumbUrl } } = supabase.storage
      .from("generated-mockups")
      .getPublicUrl(thumbPath);
    thumbnailUrl = thumbUrl;
  }

  console.log("[generateMockup] result_url:", resultUrl);
  console.log("[generateMockup] thumbnail_url:", thumbnailUrl);

  // --- 9. Save generated mockup record ---
  const { data: mockupData, error: dbError } = await supabase
    .from("generated_mockups")
    .insert({
      user_id: user.id,
      logo_id: logoId,
      template_id: templateId,
      name,
      result_url: resultUrl,
      result_path: mockupPath,
      thumbnail_url: thumbnailUrl,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded files on DB failure
    console.error("[generateMockup] DB insert failed:", dbError);
    await supabase.storage.from("generated-mockups").remove([mockupPath, thumbPath]);
    return { error: `Failed to save mockup record: ${dbError.message}` };
  }

  // --- 10. Increment user's mockup count ---
  await supabase
    .from("profiles")
    .update({ mockups_generated: (profile?.mockups_generated || 0) + 1 })
    .eq("id", user.id);

  // --- 11. Clean up logo after generation (temporary asset) ---
  console.log("[generateMockup] Cleaning up logo:", logo.file_path);
  await supabase.storage.from("logos").remove([logo.file_path]);
  await supabase.from("logos").delete().eq("id", logoId).eq("user_id", user.id);

  console.log("[generateMockup] Success! Mockup ID:", mockupData.id);
  revalidatePath("/generated");
  revalidatePath("/dashboard");
  revalidatePath("/upload");
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
  await supabase.storage.from("generated-mockups").remove([mockup.result_path]);

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

// ─── Brand Set™ Generation ───────────────────────────────────────────────────

import {
  runBrandSetPipeline,
  renderBrandSetItem,
  type BrandSetMetadata,
} from "@/lib/brand-set";

/** Target categories for a Brand Set, matched by slug. */
const BRAND_SET_CATEGORIES = [
  "packaging",
  "business-card",
  "digital-screen",
  "signage",
] as const;

interface BrandSetItemResult {
  id: string;
  category_slug: string;
  category_name: string;
  template_name: string;
  result_url: string;
  thumbnail_url: string | null;
}

interface BrandSetItemError {
  category_slug: string;
  error: string;
}

export async function generateBrandSet(logoId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // ── Check mockup limit (need at least 1 slot) ──
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

  // ── Validate logo ──
  console.log("[brandSet] Fetching logo:", logoId);
  const { data: logo, error: logoError } = await supabase
    .from("logos")
    .select("*")
    .eq("id", logoId)
    .eq("user_id", user.id)
    .single();

  if (logoError || !logo) {
    return { error: "Logo not found" };
  }

  // ── Download logo once (shared across all renders) ──
  console.log("[brandSet] Downloading logo:", logo.file_url);
  let logoBuffer: Buffer;
  try {
    const resp = await fetch(logo.file_url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    logoBuffer = Buffer.from(await resp.arrayBuffer());
    console.log("[brandSet] Logo downloaded, bytes:", logoBuffer.length);
  } catch (err: any) {
    return { error: `Failed to download logo: ${err.message}` };
  }

  // ── Fetch categories ──
  const { data: categories } = await supabase
    .from("mockup_categories")
    .select("id, name, slug")
    .in("slug", [...BRAND_SET_CATEGORIES]);

  if (!categories || categories.length === 0) {
    return { error: "No matching categories found for Brand Set generation." };
  }
  console.log("[brandSet] Found categories:", categories.map((c: any) => c.slug));

  // ── Batch-fetch all templates ──
  const categoryIds = categories.map((c: any) => c.id);
  const { data: allTemplates } = await supabase
    .from("mockup_templates")
    .select("*")
    .in("category_id", categoryIds)
    .eq("is_active", true)
    .not("asset_url", "is", null)
    .order("created_at", { ascending: false });

  if (!allTemplates || allTemplates.length === 0) {
    return { error: "No templates available for Brand Set generation." };
  }

  // ── Run intelligence pipeline: analyze → select → plan ──
  const { analysis, selections, brandSetId } = await runBrandSetPipeline(
    logoBuffer,
    categories,
    allTemplates,
    user.id
  );

  if (selections.length === 0) {
    return { error: "No suitable templates found for your logo." };
  }

  console.log(
    `[brandSet] Intelligence: aspect=${analysis.aspect} color=${analysis.colorType} complexity=${analysis.complexity} padding=${analysis.paddingMultiplier.toFixed(2)}`
  );

  // ── Render each mockup in parallel ──
  const results: BrandSetItemResult[] = [];
  const errors: BrandSetItemError[] = [];

  const renderPromises = selections.map(async (selection) => {
    try {
      console.log(`[brandSet] Rendering ${selection.category_slug}: "${selection.template.name}" (score=${selection.score})`);

      const rendered = await renderBrandSetItem({
        logoBuffer,
        analysis,
        selection,
        userId: user.id,
        brandSetId,
      });

      // ── Upload to storage ──
      const ts = Date.now();
      const rnd = Math.random().toString(36).substring(2, 8);
      const mockupPath = `${user.id}/${ts}-${rnd}-${rendered.category_slug}.png`;
      const thumbPath = `${user.id}/${ts}-${rnd}-${rendered.category_slug}-thumb.png`;

      const { error: upErr } = await supabase.storage
        .from("generated-mockups")
        .upload(mockupPath, rendered.mockupBuffer, { contentType: "image/png" });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

      const { error: thErr } = await supabase.storage
        .from("generated-mockups")
        .upload(thumbPath, rendered.thumbBuffer, { contentType: "image/png" });
      if (thErr) console.warn(`[brandSet] Thumb upload failed for ${rendered.category_slug}:`, thErr.message);

      const { data: { publicUrl: resultUrl } } = supabase.storage
        .from("generated-mockups")
        .getPublicUrl(mockupPath);

      let thumbnailUrl: string | null = null;
      if (!thErr) {
        const { data: { publicUrl: tu } } = supabase.storage
          .from("generated-mockups")
          .getPublicUrl(thumbPath);
        thumbnailUrl = tu;
      }

      // ── Save to DB with rich metadata ──
      const mockupName = `Brand Set – ${rendered.category_name}`;
      const { data: record, error: dbErr } = await supabase
        .from("generated_mockups")
        .insert({
          user_id: user.id,
          logo_id: logoId,
          template_id: rendered.template_id,
          name: mockupName,
          result_url: resultUrl,
          result_path: mockupPath,
          thumbnail_url: thumbnailUrl,
          metadata: rendered.metadata,
        })
        .select()
        .single();

      if (dbErr) throw new Error(`DB insert failed: ${dbErr.message}`);

      console.log(`[brandSet] ✓ ${rendered.category_slug} complete: ${record.id}`);

      results.push({
        id: record.id,
        category_slug: rendered.category_slug,
        category_name: rendered.category_name,
        template_name: rendered.template_name,
        result_url: resultUrl,
        thumbnail_url: thumbnailUrl,
      });
    } catch (err: any) {
      console.error(`[brandSet] ✗ ${selection.category_slug} failed:`, err.message);
      errors.push({ category_slug: selection.category_slug, error: err.message });
    }
  });

  await Promise.all(renderPromises);

  // ── Increment mockup count by number of successes ──
  if (results.length > 0 && profile) {
    await supabase
      .from("profiles")
      .update({
        mockups_generated: (profile.mockups_generated || 0) + results.length,
      })
      .eq("id", user.id);
  }

  console.log(`[brandSet] Done. ${results.length} success, ${errors.length} errors`);

  // ── Clean up logo after generation (temporary asset) ──
  console.log("[brandSet] Cleaning up logo:", logo.file_path);
  await supabase.storage.from("logos").remove([logo.file_path]);
  await supabase.from("logos").delete().eq("id", logoId).eq("user_id", user.id);
  console.log("[brandSet] Logo cleaned up");

  revalidatePath("/generated");
  revalidatePath("/dashboard");
  revalidatePath("/upload");

  return {
    success: results.length > 0,
    brand_set_id: brandSetId,
    items: results,
    errors: errors.map((e) => `${e.category_slug}: ${e.error}`),
    analysis: {
      aspect: analysis.aspect,
      colorType: analysis.colorType,
      complexity: analysis.complexity,
    },
  };
}
