/**
 * Coordinate conversion utilities for the template editor.
 *
 * The editor displays a scaled-down version of the template image on a canvas.
 * All stored coordinates are in original (full-size) image pixels.
 * These helpers convert between the two coordinate spaces.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type FitMode = "contain" | "cover" | "fill";
export type AlignX = "left" | "center" | "right";
export type AlignY = "top" | "center" | "bottom" | "upper-center" | "lower-center";

export interface EditorLogoArea {
  x: number;
  y: number;
  width: number;
  height: number;
  fit: FitMode;
  padding: number;
  alignX: AlignX;
  alignY: AlignY;
  rotation: number;
  opacity: number;
}

export interface TemplateDataPayload {
  mode: "manual";
  logoArea: EditorLogoArea;
}

export const FIT_OPTIONS: FitMode[] = ["contain", "cover", "fill"];
export const ALIGN_X_OPTIONS: AlignX[] = ["left", "center", "right"];
export const ALIGN_Y_OPTIONS: AlignY[] = ["top", "center", "bottom", "upper-center", "lower-center"];

// ─── Defaults ────────────────────────────────────────────────────────────────

export function getDefaultLogoArea(imgW: number, imgH: number): EditorLogoArea {
  const boxW = Math.round(imgW * 0.4);
  const boxH = Math.round(imgH * 0.35);
  return {
    x: Math.round((imgW - boxW) / 2),
    y: Math.round((imgH - boxH) / 2),
    width: boxW,
    height: boxH,
    fit: "contain",
    padding: 20,
    alignX: "center",
    alignY: "center",
    rotation: 0,
    opacity: 1,
  };
}

export function logoAreaFromTemplateData(
  templateData: any,
  imgW: number,
  imgH: number
): EditorLogoArea {
  const raw = templateData?.logoArea;
  const defaults = getDefaultLogoArea(imgW, imgH);
  if (!raw) return defaults;

  return {
    x: raw.x ?? defaults.x,
    y: raw.y ?? defaults.y,
    width: raw.width ?? defaults.width,
    height: raw.height ?? defaults.height,
    fit: raw.fit ?? defaults.fit,
    padding: raw.padding ?? defaults.padding,
    alignX: raw.alignX ?? defaults.alignX,
    alignY: raw.alignY ?? defaults.alignY,
    rotation: raw.rotation ?? defaults.rotation,
    opacity: raw.opacity ?? defaults.opacity,
  };
}

// ─── Coordinate conversion ───────────────────────────────────────────────────
//
// Contract:
//   - All persisted / parent-state values are in ORIGINAL IMAGE pixels.
//   - The canvas displays a scaled-down version of the image.
//   - `scale` = display pixels per original pixel (always ≤ 1).
//   - Use `scaleLogoAreaForDisplay` when going image → canvas (rendering).
//   - Use `normalizeLogoAreaForSave` when going canvas → image (saving / parent state).

export interface Point {
  x: number;
  y: number;
}

/**
 * Compute the scale factor to fit an image inside a container while
 * preserving aspect ratio.
 */
export function computeScale(
  imgW: number,
  imgH: number,
  containerW: number,
  containerH: number
): number {
  return Math.min(containerW / imgW, containerH / imgH);
}

/** Convert a point from original-image coordinates to canvas (display) coordinates. */
export function imageToCanvasCoords(pt: Point, scale: number): Point {
  return {
    x: Math.round(pt.x * scale),
    y: Math.round(pt.y * scale),
  };
}

/** Convert a point from canvas (display) coordinates back to original-image coordinates. */
export function canvasToImageCoords(pt: Point, scale: number): Point {
  return {
    x: Math.round(pt.x / scale),
    y: Math.round(pt.y / scale),
  };
}

/**
 * Convert an entire LogoArea from original-image coords to canvas coords
 * for rendering on the scaled display.
 */
export function scaleLogoAreaForDisplay(area: EditorLogoArea, scale: number): EditorLogoArea {
  return {
    ...area,
    x: Math.round(area.x * scale),
    y: Math.round(area.y * scale),
    width: Math.round(area.width * scale),
    height: Math.round(area.height * scale),
    padding: Math.round(area.padding * scale),
  };
}

/**
 * Convert an entire LogoArea from canvas (display) coords back to
 * original-image coords for persistence.
 */
export function normalizeLogoAreaForSave(area: EditorLogoArea, scale: number): EditorLogoArea {
  return {
    ...area,
    x: Math.round(area.x / scale),
    y: Math.round(area.y / scale),
    width: Math.round(area.width / scale),
    height: Math.round(area.height / scale),
    padding: Math.round(area.padding / scale),
  };
}

// ─── SQL fallback generator ──────────────────────────────────────────────────

/**
 * Generate a raw SQL UPDATE statement as a fallback when the Supabase
 * client update fails. The JSON is properly stringified and single-quotes
 * are escaped for safe pasting into the SQL editor.
 */
export function generateTemplateSQL(
  templateId: string,
  payload: TemplateDataPayload
): string {
  const json = JSON.stringify(payload, null, 2).replace(/'/g, "''");
  return `UPDATE public.mockup_templates\nSET template_data = '${json}'::jsonb\nWHERE id = '${templateId}';`;
}
