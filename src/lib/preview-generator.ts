import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// ─── Configuration ───────────────────────────────────────────────────────────

const PREVIEW_WIDTH = 500;
const PREVIEW_QUALITY = 75;
const SOURCE_BUCKET = "mockups";
const PREVIEW_BUCKET = "mockup-previews";

// ─── Admin Client ────────────────────────────────────────────────────────────

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the preview storage path from the original asset path.
 * e.g. "digital-screen/digital-screen-01.jpg" → "digital-screen/digital-screen-01-preview.jpg"
 */
export function buildPreviewPath(originalPath: string): string {
  const lastDot = originalPath.lastIndexOf(".");
  if (lastDot === -1) {
    return `${originalPath}-preview.jpg`;
  }
  return `${originalPath.slice(0, lastDot)}-preview.jpg`;
}

/**
 * Download a file from a Supabase Storage bucket.
 * Returns the raw Buffer.
 */
async function downloadFromStorage(
  supabase: ReturnType<typeof createAdminClient>,
  bucket: string,
  path: string
): Promise<Buffer> {
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error(
      `Failed to download ${bucket}/${path}: ${error?.message ?? "no data"}`
    );
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Resize and compress an image buffer to a JPEG preview.
 */
async function resizeToPreview(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize({ width: PREVIEW_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: PREVIEW_QUALITY, mozjpeg: true })
    .toBuffer();
}

/**
 * Upload a buffer to Supabase Storage, overwriting if it already exists.
 */
async function uploadToStorage(
  supabase: ReturnType<typeof createAdminClient>,
  bucket: string,
  path: string,
  buffer: Buffer
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) {
    throw new Error(
      `Failed to upload ${bucket}/${path}: ${error.message}`
    );
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Download an original mockup, generate a resized preview, and upload it.
 *
 * @param originalPath - Path inside the source bucket (e.g. "digital-screen/digital-screen-01.jpg")
 * @returns The public URL of the uploaded preview image.
 */
export async function generateAndUploadPreview(
  originalPath: string
): Promise<string> {
  const supabase = createAdminClient();
  const previewPath = buildPreviewPath(originalPath);

  console.log(`[preview] Downloading original: ${SOURCE_BUCKET}/${originalPath}`);
  const originalBuffer = await downloadFromStorage(
    supabase,
    SOURCE_BUCKET,
    originalPath
  );
  console.log(`[preview] Original size: ${(originalBuffer.length / 1024).toFixed(1)} KB`);

  console.log(`[preview] Resizing to ${PREVIEW_WIDTH}px width, quality ${PREVIEW_QUALITY}...`);
  const previewBuffer = await resizeToPreview(originalBuffer);
  console.log(`[preview] Preview size: ${(previewBuffer.length / 1024).toFixed(1)} KB`);

  console.log(`[preview] Uploading to: ${PREVIEW_BUCKET}/${previewPath}`);
  const publicUrl = await uploadToStorage(
    supabase,
    PREVIEW_BUCKET,
    previewPath,
    previewBuffer
  );
  console.log(`[preview] Uploaded: ${publicUrl}`);

  return publicUrl;
}

/**
 * Update the preview_url column for a mockup_templates row whose asset_url
 * contains the given original path.
 *
 * @param originalPath - The asset path used to match the template row.
 * @param previewUrl   - The public URL of the generated preview.
 * @returns The id of the updated row, or null if no match was found.
 */
export async function updateTemplatePreviewUrl(
  originalPath: string,
  previewUrl: string
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("mockup_templates")
    .update({ preview_url: previewUrl })
    .ilike("asset_url", `%${originalPath}%`)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to update mockup_templates for "${originalPath}": ${error.message}`
    );
  }

  if (!data) {
    console.warn(
      `[preview] No mockup_templates row matched asset_url containing "${originalPath}".`
    );
    return null;
  }

  console.log(`[preview] Updated template ${data.id} with preview_url.`);
  return data.id;
}

/**
 * Update the preview_url column for a specific mockup_templates row by ID.
 *
 * @param templateId - The UUID of the template row to update.
 * @param previewUrl - The public URL of the generated preview.
 * @returns The id of the updated row.
 */
export async function updateTemplatePreviewUrlById(
  templateId: string,
  previewUrl: string
): Promise<string> {
  const supabase = createAdminClient();

  console.log(`[preview] Updating template row by ID: ${templateId}`);

  const { data, error } = await supabase
    .from("mockup_templates")
    .update({ preview_url: previewUrl })
    .eq("id", templateId)
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Failed to update mockup_templates id "${templateId}": ${error.message}`
    );
  }

  console.log(`[preview] Updated template ${data.id} with preview_url.`);
  return data.id;
}

/**
 * End-to-end: generate a preview for a single asset and update its template row.
 *
 * @param originalPath - Path inside the source bucket.
 * @param templateId   - Optional UUID to update directly instead of matching by asset_url.
 * @returns Object with the public URL and updated template id (if any).
 */
export async function processTemplatePreview(
  originalPath: string,
  templateId?: string
): Promise<{
  previewUrl: string;
  templateId: string | null;
}> {
  const previewUrl = await generateAndUploadPreview(originalPath);

  const updatedId = templateId
    ? await updateTemplatePreviewUrlById(templateId, previewUrl)
    : await updateTemplatePreviewUrl(originalPath, previewUrl);

  return { previewUrl, templateId: updatedId };
}
