/**
 * Brand Intelligence Layer — Logo Analysis
 *
 * Analyzes an uploaded logo to extract:
 * - Aspect ratio classification (wide / square / tall)
 * - Color type (light / dark)
 * - Complexity estimation (simple / detailed)
 * - Dominant color channels
 *
 * This metadata drives smart template selection, padding, and scale logic.
 */
import sharp from "sharp";

export type LogoAspect = "wide" | "square" | "tall";
export type LogoColorType = "light" | "dark";
export type LogoComplexity = "simple" | "detailed";

export interface LogoAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  aspect: LogoAspect;
  colorType: LogoColorType;
  complexity: LogoComplexity;
  avgLuminance: number;
  hasTransparency: boolean;
  /** Recommended padding multiplier based on analysis (0.8–1.6) */
  paddingMultiplier: number;
  /** Recommended scale cap (0.6–1.0) */
  scaleCap: number;
}

/**
 * Analyze a logo buffer and return intelligence metadata.
 */
export async function analyzeLogo(logoBuffer: Buffer): Promise<LogoAnalysis> {
  const meta = await sharp(logoBuffer).metadata();
  const width = meta.width ?? 1;
  const height = meta.height ?? 1;
  const aspectRatio = width / height;
  const hasTransparency = (meta.channels ?? 3) === 4;

  // ── Aspect classification ──
  let aspect: LogoAspect;
  if (aspectRatio > 1.6) aspect = "wide";
  else if (aspectRatio < 0.625) aspect = "tall";
  else aspect = "square";

  // ── Color analysis: sample a 64x64 thumbnail for speed ──
  const sampleSize = 64;
  const sample = await sharp(logoBuffer)
    .resize(sampleSize, sampleSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer();

  let totalLuminance = 0;
  let opaquePixels = 0;
  let uniqueColors = new Set<string>();

  for (let i = 0; i < sample.length; i += 4) {
    const r = sample[i];
    const g = sample[i + 1];
    const b = sample[i + 2];
    const a = sample[i + 3];

    if (a < 20) continue; // skip transparent pixels

    opaquePixels++;
    // Perceived luminance (ITU-R BT.709)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    totalLuminance += lum;

    // Track unique colors at reduced precision (bucket to 32 levels)
    const cr = Math.floor(r / 8);
    const cg = Math.floor(g / 8);
    const cb = Math.floor(b / 8);
    uniqueColors.add(`${cr},${cg},${cb}`);
  }

  const avgLuminance = opaquePixels > 0 ? totalLuminance / opaquePixels : 128;
  const colorType: LogoColorType = avgLuminance > 140 ? "light" : "dark";

  // ── Complexity estimation ──
  // Simple logos have fewer unique color buckets and less edge detail
  const colorCount = uniqueColors.size;
  const complexity: LogoComplexity = colorCount > 120 ? "detailed" : "simple";

  // ── Adaptive padding ──
  let paddingMultiplier = 1.0;
  if (aspect === "wide") {
    // Wide logos need more vertical breathing room
    paddingMultiplier = aspectRatio > 3 ? 1.6 : aspectRatio > 2.2 ? 1.3 : 1.1;
  } else if (aspect === "tall") {
    // Tall logos need more horizontal breathing room
    const invAspect = 1 / aspectRatio;
    paddingMultiplier = invAspect > 3 ? 1.6 : invAspect > 2.2 ? 1.3 : 1.1;
  }
  if (complexity === "detailed") {
    paddingMultiplier *= 1.1; // detailed logos need slightly more room
  }

  // ── Scale cap ──
  let scaleCap = 1.0;
  if (aspect === "wide") scaleCap = 0.85;
  else if (aspect === "tall") scaleCap = 0.85;
  if (complexity === "simple") scaleCap = Math.min(scaleCap, 0.95);

  console.log(`[analyzeLogo] ${width}x${height} aspect=${aspect} (${aspectRatio.toFixed(2)}) color=${colorType} lum=${avgLuminance.toFixed(0)} complexity=${complexity} colors=${colorCount} padding=${paddingMultiplier.toFixed(2)} scale=${scaleCap}`);

  return {
    width,
    height,
    aspectRatio,
    aspect,
    colorType,
    complexity,
    avgLuminance,
    hasTransparency,
    paddingMultiplier,
    scaleCap,
  };
}
