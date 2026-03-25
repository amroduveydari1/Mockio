/**
 * Server-side mockup renderer using sharp.
 *
 * Features:
 * - Smart auto-fitting when template_data is missing
 * - Aspect-ratio-preserving resize (contain / cover / fill)
 * - Configurable padding, alignment, rotation, opacity
 * - Portrait / landscape / square aware auto-placement
 * - Production-ready error handling & logging
 */
import sharp from "sharp";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FitMode = "contain" | "cover" | "fill";
export type AlignX = "left" | "center" | "right";
export type AlignY = "top" | "center" | "bottom" | "upper-center" | "lower-center";

/** Describes how and where to place a logo on a template. */
export interface LogoArea {
  x: number;
  y: number;
  width: number;
  height: number;
  fit?: FitMode;          // default: "contain"
  padding?: number;       // px inset on each side before sizing (default: 0)
  alignX?: AlignX;        // default: "center"
  alignY?: AlignY;        // default: "center"
  rotation?: number;      // degrees clockwise (default: 0)
  opacity?: number;       // 0–1 (default: 1)
}

/** Optional extra metadata stored alongside logoArea in template_data. */
export interface TemplateMetadata {
  logoArea?: Partial<LogoArea>;
  backgroundMode?: "light" | "dark" | "auto";
  maxScale?: number;      // max scale multiplier (e.g. 1.0 = never upscale)
  minPadding?: number;    // absolute min padding in px
  exportFormat?: "png" | "jpeg";
}

export interface ImageMeta {
  width: number;
  height: number;
  format: string | undefined;
  channels: number | undefined;
}

export interface RenderMockupInput {
  backgroundBuffer: Buffer;
  logoBuffer: Buffer;
  templateData?: TemplateMetadata | null;  // raw template_data from DB
}

export interface RenderMockupResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: "png" | "jpeg";
  logoArea: LogoArea;     // the area that was actually used (useful for debugging)
}

// ─── Auto-placement config ───────────────────────────────────────────────────

interface AutoAreaConfig {
  /** Fraction of image width the logo box occupies (0–1). */
  widthRatio: number;
  /** Fraction of image height the logo box occupies (0–1). */
  heightRatio: number;
  /** Minimum padding in px applied to the auto-generated box. */
  padding: number;
}

const AUTO_LANDSCAPE: AutoAreaConfig = { widthRatio: 0.40, heightRatio: 0.30, padding: 24 };
const AUTO_PORTRAIT:  AutoAreaConfig = { widthRatio: 0.50, heightRatio: 0.35, padding: 20 };
const AUTO_SQUARE:    AutoAreaConfig = { widthRatio: 0.45, heightRatio: 0.35, padding: 22 };

// ─── Helper: getImageMetadata ────────────────────────────────────────────────

/** Read width, height, format, channels from a buffer via sharp. */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMeta> {
  const meta = await sharp(buffer).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format,
    channels: meta.channels,
  };
}

// ─── Helper: getAutoLogoArea ─────────────────────────────────────────────────

/**
 * Generate a sensible centered logo placement box based purely on the
 * template image dimensions.
 *
 * Algorithm:
 *  1. Classify the image as landscape, portrait, or square.
 *  2. Pick width/height ratios for that class (wider images get a narrower
 *     logo box so the logo doesn't dominate).
 *  3. Center the box horizontally and vertically.
 *  4. Apply a default padding so the logo never touches the box edges.
 */
export function getAutoLogoArea(imgW: number, imgH: number): LogoArea {
  const aspect = imgW / imgH;
  const config =
    aspect > 1.15 ? AUTO_LANDSCAPE :
    aspect < 0.85 ? AUTO_PORTRAIT :
    AUTO_SQUARE;

  const boxW = Math.round(imgW * config.widthRatio);
  const boxH = Math.round(imgH * config.heightRatio);
  const x = Math.round((imgW - boxW) / 2);
  const y = Math.round((imgH - boxH) / 2);

  return {
    x,
    y,
    width: boxW,
    height: boxH,
    fit: "contain",
    padding: config.padding,
    alignX: "center",
    alignY: "center",
  };
}

// ─── Helper: normalizeLogoArea ───────────────────────────────────────────────

/**
 * Merge template_data with auto-generated defaults.
 * If template_data.logoArea exists and has valid dimensions, use it.
 * Otherwise fall back to the auto-generated area.
 */
export function normalizeLogoArea(
  templateData: TemplateMetadata | null | undefined,
  imgW: number,
  imgH: number
): LogoArea {
  const auto = getAutoLogoArea(imgW, imgH);
  const raw = templateData?.logoArea;

  if (!raw || !raw.width || !raw.height) {
    console.log("[renderer] No valid logoArea in template_data — using auto-fit");
    return auto;
  }

  // Merge: raw values win, auto values fill gaps
  return {
    x: raw.x ?? auto.x,
    y: raw.y ?? auto.y,
    width: raw.width,
    height: raw.height,
    fit: raw.fit ?? auto.fit ?? "contain",
    padding: raw.padding ?? templateData?.minPadding ?? auto.padding,
    alignX: raw.alignX ?? auto.alignX ?? "center",
    alignY: raw.alignY ?? auto.alignY ?? "center",
    rotation: raw.rotation ?? 0,
    opacity: raw.opacity ?? 1,
  };
}

// ─── Helper: fitLogoIntoArea ─────────────────────────────────────────────────

/**
 * Compute the pixel dimensions the logo should be resized to so it fits
 * inside the given area (after padding) according to the fit mode.
 *
 * - contain: scale down to fit entirely inside (never clips, never stretches)
 * - cover:   scale to fill the box (may clip edges)
 * - fill:    stretch to exactly match the box (ignores aspect ratio)
 *
 * Adaptive padding: very wide logos (>3:1) or very tall logos (>1:3) get extra
 * padding so they don't look jammed edge-to-edge.
 *
 * maxScale caps how much a tiny logo can be enlarged (default: Infinity).
 */
export function fitLogoIntoArea(
  logoW: number,
  logoH: number,
  areaW: number,
  areaH: number,
  fit: FitMode = "contain",
  padding: number = 0,
  maxScale: number = Infinity
): { resizeW: number; resizeH: number } {
  // Adaptive padding: extreme aspect ratios get proportionally more breathing room
  const logoAspect = logoW / logoH;
  let effectivePadding = padding;
  if (logoAspect > 3 || logoAspect < 1 / 3) {
    // Very wide or very tall: add 40% extra padding
    effectivePadding = Math.round(padding * 1.4);
  } else if (logoAspect > 2.2 || logoAspect < 1 / 2.2) {
    // Moderately extreme: add 15% extra
    effectivePadding = Math.round(padding * 1.15);
  }

  const innerW = Math.max(1, areaW - effectivePadding * 2);
  const innerH = Math.max(1, areaH - effectivePadding * 2);

  if (fit === "fill") {
    return { resizeW: innerW, resizeH: innerH };
  }

  const scaleX = innerW / logoW;
  const scaleY = innerH / logoH;
  let scale = fit === "contain"
    ? Math.min(scaleX, scaleY)
    : Math.max(scaleX, scaleY);

  // Clamp to maxScale so small logos aren't blown up excessively
  scale = Math.min(scale, maxScale);

  return {
    resizeW: Math.max(1, Math.round(logoW * scale)),
    resizeH: Math.max(1, Math.round(logoH * scale)),
  };
}

// ─── Helper: computeAlignedPosition ──────────────────────────────────────────

/**
 * Given the placement area and the rendered logo size, return the
 * absolute left/top position on the full background image.
 *
 * upper-center: 25% from top of the inner box
 * lower-center: 75% from top of the inner box
 */
export function computeAlignedPosition(
  area: LogoArea,
  renderedW: number,
  renderedH: number
): { left: number; top: number } {
  const pad = area.padding ?? 0;
  const innerW = Math.max(1, area.width - pad * 2);
  const innerH = Math.max(1, area.height - pad * 2);
  const alignX = area.alignX ?? "center";
  const alignY = area.alignY ?? "center";

  let offsetX: number;
  if (alignX === "left") offsetX = 0;
  else if (alignX === "right") offsetX = innerW - renderedW;
  else offsetX = (innerW - renderedW) / 2;  // center

  let offsetY: number;
  if (alignY === "top") {
    offsetY = 0;
  } else if (alignY === "bottom") {
    offsetY = innerH - renderedH;
  } else if (alignY === "upper-center") {
    offsetY = (innerH - renderedH) * 0.25;
  } else if (alignY === "lower-center") {
    offsetY = (innerH - renderedH) * 0.75;
  } else {
    // center
    offsetY = (innerH - renderedH) / 2;
  }

  return {
    left: Math.round(area.x + pad + offsetX),
    top: Math.round(area.y + pad + offsetY),
  };
}

// ─── Main: generateMockupFromTemplate ────────────────────────────────────────

/**
 * Full rendering pipeline:
 *
 *  1. Read both images' metadata.
 *  2. Normalize the logo area (template_data → auto-fallback → merged).
 *  3. Compute resize dimensions (fitLogoIntoArea).
 *  4. Resize the logo with sharp.
 *  5. Apply rotation if requested.
 *  6. Apply opacity if < 1.
 *  7. Compute aligned position.
 *  8. Composite onto the background.
 *  9. Export as PNG or JPEG.
 */
export async function renderMockup(
  input: RenderMockupInput
): Promise<RenderMockupResult> {
  const { backgroundBuffer, logoBuffer, templateData } = input;

  // ── 1. Metadata ──
  const bgMeta = await getImageMetadata(backgroundBuffer);
  if (!bgMeta.width || !bgMeta.height) {
    throw new Error("Could not read template image dimensions");
  }
  console.log(`[renderer] Background: ${bgMeta.width}x${bgMeta.height} (${bgMeta.format})`);

  const logoMeta = await getImageMetadata(logoBuffer);
  if (!logoMeta.width || !logoMeta.height) {
    throw new Error("Could not read logo image dimensions");
  }
  console.log(`[renderer] Logo native: ${logoMeta.width}x${logoMeta.height} (${logoMeta.format})`);

  // ── 2. Normalize logo area ──
  const area = normalizeLogoArea(templateData, bgMeta.width, bgMeta.height);
  console.log(`[renderer] LogoArea: x=${area.x} y=${area.y} ${area.width}x${area.height} fit=${area.fit} pad=${area.padding} align=${area.alignX},${area.alignY}`);

  // ── 3. Fit logo ──
  const maxScale = templateData?.maxScale ?? Infinity;
  const { resizeW, resizeH } = fitLogoIntoArea(
    logoMeta.width,
    logoMeta.height,
    area.width,
    area.height,
    area.fit,
    area.padding,
    maxScale
  );
  console.log(`[renderer] Fit result: ${resizeW}x${resizeH}`);

  // ── 4. Resize ──
  let logoPipeline = sharp(logoBuffer).resize({
    width: resizeW,
    height: resizeH,
    fit: area.fit === "fill" ? "fill" : "fill",  // dimensions are pre-computed
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  // ── 5. Rotation ──
  const rotation = area.rotation ?? 0;
  if (rotation !== 0) {
    logoPipeline = logoPipeline.rotate(rotation, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    console.log(`[renderer] Rotation: ${rotation}°`);
  }

  const resizedBuf = await logoPipeline.png().toBuffer({ resolveWithObject: true });
  let logoInput: Buffer = resizedBuf.data;
  const finalW = resizedBuf.info.width;
  const finalH = resizedBuf.info.height;
  console.log(`[renderer] Resized logo: ${finalW}x${finalH}`);

  // ── 6. Opacity ──
  const opacity = area.opacity ?? 1;
  if (opacity < 1 && opacity > 0) {
    const raw = await sharp(logoInput).ensureAlpha().raw().toBuffer();
    for (let i = 3; i < raw.length; i += 4) {
      raw[i] = Math.round(raw[i] * opacity);
    }
    logoInput = await sharp(raw, {
      raw: { width: finalW, height: finalH, channels: 4 },
    })
      .png()
      .toBuffer();
    console.log(`[renderer] Opacity: ${opacity}`);
  }

  // ── 7. Alignment ──
  const { left, top } = computeAlignedPosition(area, finalW, finalH);
  const safeLeft = Math.max(0, Math.min(left, bgMeta.width - 1));
  const safeTop = Math.max(0, Math.min(top, bgMeta.height - 1));
  console.log(`[renderer] Position: left=${safeLeft}, top=${safeTop}`);

  // ── 8. Composite ──
  const exportFormat = templateData?.exportFormat ?? "png";
  let pipeline = sharp(backgroundBuffer).composite([
    { input: logoInput, left: safeLeft, top: safeTop },
  ]);

  // ── 9. Export ──
  let outputBuf: Buffer;
  let outputInfo: sharp.OutputInfo;

  if (exportFormat === "jpeg") {
    // Flatten transparency for JPEG
    pipeline = pipeline.flatten({ background: { r: 255, g: 255, b: 255 } });
    const out = await pipeline.jpeg({ quality: 92 }).toBuffer({ resolveWithObject: true });
    outputBuf = out.data;
    outputInfo = out.info;
  } else {
    const out = await pipeline.png().toBuffer({ resolveWithObject: true });
    outputBuf = out.data;
    outputInfo = out.info;
  }

  console.log(`[renderer] Output: ${outputInfo.width}x${outputInfo.height}, ${exportFormat}, ${outputBuf.length} bytes`);

  return {
    buffer: outputBuf,
    width: outputInfo.width,
    height: outputInfo.height,
    format: exportFormat,
    logoArea: area,
  };
}

// ─── Thumbnail ───────────────────────────────────────────────────────────────

export async function generateThumbnail(
  imageBuffer: Buffer,
  maxWidth = 400
): Promise<Buffer> {
  const thumb = await sharp(imageBuffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png({ quality: 80 })
    .toBuffer();
  console.log(`[renderer] Thumbnail: ${thumb.length} bytes`);
  return thumb;
}
