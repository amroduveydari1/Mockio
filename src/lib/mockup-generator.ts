/**
 * Mockup Generator Utility
 * 
 * Client-side canvas-based image composition for generating mockups.
 * TODO: Integrate with real template images and logic.
 */

import { MockupTemplateConfig, LogoPlacement } from "./types/mockup-template";

export interface GenerationOptions {
  // Override template defaults
  scale?: number; // 0.1 - 2
  opacity?: number; // 0 - 1
  offsetX?: number; // -50 to 50 (percentage adjustment)
  offsetY?: number; // -50 to 50 (percentage adjustment)
  rotation?: number; // -180 to 180
}

export interface GenerationResult {
  success: boolean;
  dataUrl?: string;
  blob?: Blob;
  error?: string;
}

/**
 * Load an image from URL and return as HTMLImageElement
 */
export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// TODO: Remove placeholder base logic and use real template images from Supabase or assets.

/**
 * Calculate logo dimensions respecting aspect ratio
 */
function calculateLogoDimensions(
  logoWidth: number,
  logoHeight: number,
  targetWidth: number,
  targetHeight: number
): { width: number; height: number } {
  const logoAspect = logoWidth / logoHeight;
  const targetAspect = targetWidth / targetHeight;

  if (logoAspect > targetAspect) {
    // Logo is wider, fit to width
    return {
      width: targetWidth,
      height: targetWidth / logoAspect,
    };
  } else {
    // Logo is taller, fit to height
    return {
      width: targetHeight * logoAspect,
      height: targetHeight,
    };
  }
}

/**
 * Generate a mockup by compositing logo onto template
 */
export async function generateMockup(
  logoUrl: string,
  template: MockupTemplateConfig,
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  try {
    // Load the logo image
    const logoImg = await loadImage(logoUrl);

    // TODO: Load real template base image from Supabase or assets.
    // For now, create a blank canvas as a stub.
    const canvas = document.createElement("canvas");
    canvas.width = template.outputWidth;
    canvas.height = template.outputHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate logo placement
    const placement = template.logoPlacement;
    const scale = options.scale ?? 1;
    const opacity = options.opacity ?? placement.opacity ?? 1;
    const offsetX = options.offsetX ?? 0;
    const offsetY = options.offsetY ?? 0;
    const rotation = options.rotation ?? placement.rotation ?? 0;

    // Calculate target logo size
    const targetWidth = (template.outputWidth * placement.width * scale) / 100;
    const targetHeight = (template.outputHeight * placement.height * scale) / 100;

    // Calculate actual logo dimensions (respecting aspect ratio)
    const logoDims = calculateLogoDimensions(
      logoImg.width,
      logoImg.height,
      targetWidth,
      targetHeight
    );

    // Calculate center position
    const centerX =
      (template.outputWidth * (placement.x + offsetX)) / 100;
    const centerY =
      (template.outputHeight * (placement.y + offsetY)) / 100;

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.globalAlpha = opacity;

    // Set blend mode
    if (placement.blendMode) {
      ctx.globalCompositeOperation = placement.blendMode;
    }

    // Draw logo centered at origin (after translation)
    ctx.drawImage(
      logoImg,
      -logoDims.width / 2,
      -logoDims.height / 2,
      logoDims.width,
      logoDims.height
    );

    // Restore context state
    ctx.restore();

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to create blob"))),
        "image/png",
        1.0
      );
    });

    return {
      success: true,
      dataUrl: canvas.toDataURL("image/png"),
      blob,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}

/**
 * Generate a preview at lower resolution for performance
 */
export async function generatePreview(
  logoUrl: string,
  template: MockupTemplateConfig,
  options: GenerationOptions = {}
): Promise<GenerationResult> {
  // TODO: Implement real preview generation logic.
  return generateMockup(logoUrl, template, options);
}

/**
 * Download a generated mockup
 */
export function downloadMockup(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
