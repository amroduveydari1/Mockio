/**
 * CLI script to generate preview images for mockup templates.
 *
 * Usage:
 *   npx tsx scripts/generate-previews.ts <asset-path>
 *   npx tsx scripts/generate-previews.ts --all
 *
 * Examples:
 *   npx tsx scripts/generate-previews.ts digital-screen/digital-screen-01.jpg
 *   npx tsx scripts/generate-previews.ts --all
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Debug: confirm env vars loaded (remove once verified)
console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("HAS SERVICE ROLE:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

import { createClient } from "@supabase/supabase-js";
import {
  processTemplatePreview,
  buildPreviewPath,
} from "../src/lib/preview-generator";

// ─── Admin client for batch queries ─────────────────────────────────────────

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Batch: process all templates missing a preview ─────────────────────────

async function processAllTemplates() {
  const supabase = createAdminClient();

  const { data: templates, error } = await supabase
    .from("mockup_templates")
    .select("id, name, asset_url, preview_url")
    .is("preview_url", null)
    .not("asset_url", "is", null);

  if (error) {
    console.error("[batch] Failed to fetch templates:", error.message);
    process.exit(1);
  }

  if (!templates || templates.length === 0) {
    console.log("[batch] All templates already have previews. Nothing to do.");
    return;
  }

  console.log(`[batch] Found ${templates.length} templates without previews.\n`);

  let success = 0;
  let failed = 0;

  for (const template of templates) {
    const assetUrl: string = template.asset_url;
    // Extract the storage path from a full URL or use as-is if already a path
    const storagePath = assetUrl.includes("/storage/v1/")
      ? assetUrl.split("/object/public/mockups/")[1] ?? assetUrl
      : assetUrl;

    try {
      console.log(`\n── ${template.name} ──`);
      const result = await processTemplatePreview(storagePath);
      console.log(`   preview: ${result.previewUrl}`);
      success++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`   FAILED: ${message}`);
      failed++;
    }
  }

  console.log(`\n[batch] Done. ${success} succeeded, ${failed} failed.`);
}

// ─── Single asset ────────────────────────────────────────────────────────────

async function processSingle(assetPath: string, templateId?: string) {
  console.log(`\nProcessing: ${assetPath}`);
  console.log(`Preview will be: ${buildPreviewPath(assetPath)}`);
  if (templateId) {
    console.log(`Template ID: ${templateId}`);
  } else {
    console.log(`Template ID: (will match by asset_url)`);
  }
  console.log();

  const result = await processTemplatePreview(assetPath, templateId);

  console.log(`\n✓ Preview URL : ${result.previewUrl}`);
  console.log(`  Template ID : ${result.templateId ?? "(no matching row)"}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2];
  const templateId = process.argv[3];

  if (!arg) {
    console.error(
      "Usage:\n" +
        "  npx tsx scripts/generate-preview.ts <asset-path> [template-id]\n" +
        "  npx tsx scripts/generate-preview.ts --all"
    );
    process.exit(1);
  }

  if (arg === "--all") {
    await processAllTemplates();
  } else {
    await processSingle(arg, templateId);
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
