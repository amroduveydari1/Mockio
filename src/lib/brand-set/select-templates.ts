/**
 * Smart Template Selection Engine
 *
 * Given logo analysis metadata and available templates, selects the best
 * template per category based on:
 * - Contrast matching (light logo → dark template, dark logo → light template)
 * - Premium preference (is_premium templates chosen first when available)
 * - Template configuration quality (templates with logoArea configured preferred)
 * - Fallback: always return at least one template per category if any exist
 */
import type { LogoAnalysis } from "./analyze-logo";
import type { TemplateMetadata } from "@/lib/mockup-renderer";

export interface TemplateCandidate {
  id: string;
  name: string;
  category_id: string;
  asset_url: string | null;
  template_data: TemplateMetadata | null;
  is_premium: boolean;
  is_active: boolean;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

export interface SelectedTemplate {
  category_slug: string;
  category_name: string;
  template: TemplateCandidate;
  /** Score from 0–100. Higher = better match. */
  score: number;
  reason: string;
}

/**
 * Score a template against logo analysis.
 */
function scoreTemplate(
  template: TemplateCandidate,
  analysis: LogoAnalysis
): { score: number; reason: string } {
  let score = 50; // base score
  const reasons: string[] = [];

  // ── Contrast matching ──
  const bgMode = template.template_data?.backgroundMode;
  if (bgMode) {
    if (
      (analysis.colorType === "light" && bgMode === "dark") ||
      (analysis.colorType === "dark" && bgMode === "light")
    ) {
      score += 20;
      reasons.push("good contrast");
    } else if (
      (analysis.colorType === "light" && bgMode === "light") ||
      (analysis.colorType === "dark" && bgMode === "dark")
    ) {
      score -= 15;
      reasons.push("poor contrast");
    }
    // bgMode === "auto" is neutral
  }

  // ── Template has logoArea configured → more reliable placement ──
  if (template.template_data?.logoArea) {
    score += 15;
    reasons.push("configured placement");
  }

  // ── Premium preference ──
  if (template.is_premium) {
    score += 10;
    reasons.push("premium");
  }

  // ── Has asset_url (required) ──
  if (!template.asset_url) {
    score = 0;
    reasons.push("no asset");
  }

  return { score, reason: reasons.join(", ") || "default" };
}

/**
 * Select the best template for each category.
 *
 * Rules:
 * - 1 template per category
 * - Avoid bad contrast
 * - Prefer premium templates
 * - Prefer configured templates (with logoArea)
 * - Fallback if none match well
 */
export function selectBestTemplates(
  analysis: LogoAnalysis,
  categories: CategoryInfo[],
  allTemplates: TemplateCandidate[]
): SelectedTemplate[] {
  const results: SelectedTemplate[] = [];

  for (const cat of categories) {
    const catTemplates = allTemplates.filter(
      (t) => t.category_id === cat.id && t.is_active && t.asset_url
    );

    if (catTemplates.length === 0) {
      console.warn(`[selectTemplates] No templates for category: ${cat.slug}`);
      continue;
    }

    // Score all templates in this category
    const scored = catTemplates.map((t) => ({
      template: t,
      ...scoreTemplate(t, analysis),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];
    console.log(
      `[selectTemplates] ${cat.slug}: "${best.template.name}" score=${best.score} (${best.reason})`
    );

    results.push({
      category_slug: cat.slug,
      category_name: cat.name,
      template: best.template,
      score: best.score,
      reason: best.reason,
    });
  }

  return results;
}
