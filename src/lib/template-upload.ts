import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/server";

// ─── Configuration ───────────────────────────────────────────────────────────

const SOURCE_BUCKET = "mockups";
const PREVIEW_BUCKET = "mockup-previews";
const PREVIEW_WIDTH = 500;
const PREVIEW_QUALITY = 75;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// ─── File Naming ─────────────────────────────────────────────────────────────

/**
 * Sanitize a string into a URL-safe slug.
 * Removes special characters, replaces spaces/underscores with hyphens,
 * collapses consecutive hyphens, and lowercases the result.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // strip non-word chars except spaces/hyphens
    .replace(/[\s_]+/g, "-") // spaces & underscores → hyphens
    .replace(/-+/g, "-") // collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * Build a deterministic storage path for the original asset.
 * Result: `<categorySlug>/<slugified-name>.jpg`
 */
export function buildAssetPath(
  categorySlug: string,
  name: string,
  extension: string
): string {
  const slug = slugify(name);
  const ts = Date.now();
  return `${categorySlug}/${slug}-${ts}.${extension}`;
}

/**
 * Build the preview path from the original asset path.
 * e.g. "apparel/my-shirt-1711000000.jpg" → "apparel/my-shirt-1711000000-preview.jpg"
 */
export function buildPreviewPath(assetPath: string): string {
  const lastDot = assetPath.lastIndexOf(".");
  if (lastDot === -1) return `${assetPath}-preview.jpg`;
  return `${assetPath.slice(0, lastDot)}-preview.jpg`;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Invalid file type "${file.type}". Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: ${MAX_FILE_SIZE / 1024 / 1024} MB`;
  }
  return null;
}

/**
 * Extract file extension from MIME type or fall back to filename extension.
 */
export function getExtension(file: File): string {
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  if (mimeMap[file.type]) return mimeMap[file.type];
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}

// ─── Sharp Preview ───────────────────────────────────────────────────────────

/**
 * Resize an image buffer to a JPEG preview (500px width, quality 75, mozjpeg).
 */
export async function generatePreviewBuffer(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize({ width: PREVIEW_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: PREVIEW_QUALITY, mozjpeg: true })
    .toBuffer();
}

// ─── Supabase Storage ────────────────────────────────────────────────────────

/**
 * Upload a buffer to a Supabase Storage bucket. Returns the public URL.
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Storage upload failed (${bucket}/${path}): ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

// ─── Full Upload Pipeline ────────────────────────────────────────────────────

export interface TemplateUploadInput {
  name: string;
  categoryId: string;
  categorySlug: string;
  file: File;
  isPremium: boolean;
}

export interface TemplateUploadResult {
  success: boolean;
  error?: string;
  templateId?: string;
  assetUrl?: string;
  previewUrl?: string;
}

/**
 * End-to-end template upload pipeline:
 * 1. Validate the file
 * 2. Upload original to "mockups" bucket
 * 3. Generate and upload preview to "mockup-previews" bucket
 * 4. Insert row in mockup_templates
 */
export async function uploadTemplatePipeline(
  input: TemplateUploadInput
): Promise<TemplateUploadResult> {
  const { name, categoryId, categorySlug, file, isPremium } = input;

  // 1. Validate
  const validationError = validateFile(file);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const extension = getExtension(file);
  const assetPath = buildAssetPath(categorySlug, name, extension);
  const previewPath = buildPreviewPath(assetPath);

  console.log(`[template-upload] Starting pipeline for "${name}"`);
  console.log(`[template-upload] Asset path: ${SOURCE_BUCKET}/${assetPath}`);
  console.log(`[template-upload] Preview path: ${PREVIEW_BUCKET}/${previewPath}`);

  try {
    // 2. Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);
    console.log(
      `[template-upload] Original size: ${(originalBuffer.length / 1024).toFixed(1)} KB`
    );

    // 3. Upload original
    const assetUrl = await uploadToStorage(
      SOURCE_BUCKET,
      assetPath,
      originalBuffer,
      file.type
    );
    console.log(`[template-upload] Uploaded original: ${assetUrl}`);

    // 4. Generate preview
    const previewBuffer = await generatePreviewBuffer(originalBuffer);
    console.log(
      `[template-upload] Preview size: ${(previewBuffer.length / 1024).toFixed(1)} KB`
    );

    // 5. Upload preview
    const previewUrl = await uploadToStorage(
      PREVIEW_BUCKET,
      previewPath,
      previewBuffer,
      "image/jpeg"
    );
    console.log(`[template-upload] Uploaded preview: ${previewUrl}`);

    // 6. Insert database row
    const supabase = createAdminClient();
    const { data, error: dbError } = await supabase
      .from("mockup_templates")
      .insert({
        name,
        category_id: categoryId,
        asset_url: assetUrl,
        preview_url: previewUrl,
        is_premium: isPremium,
        is_active: true,
        template_data: null,
      })
      .select("id")
      .single();

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    console.log(`[template-upload] Created template row: ${data.id}`);

    return {
      success: true,
      templateId: data.id,
      assetUrl,
      previewUrl,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[template-upload] Pipeline failed: ${message}`);
    return { success: false, error: message };
  }
}
