// Types for mockup templates, now used by Supabase data only

export type FitMode = "contain" | "cover" | "fill";
export type AlignX = "left" | "center" | "right";
export type AlignY = "top" | "center" | "bottom" | "upper-center" | "lower-center";

export interface LogoPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  fit?: FitMode;
  padding?: number;
  alignX?: AlignX;
  alignY?: AlignY;
  rotation?: number;
  opacity?: number;
}

export interface TemplateData {
  logoArea?: Partial<LogoPlacement>;
  backgroundMode?: "light" | "dark" | "auto";
  maxScale?: number;
  minPadding?: number;
  exportFormat?: "png" | "jpeg";
}

export interface MockupTemplateConfig {
  id: string;
  name: string;
  category_id: string;
  preview_url: string | null;
  asset_url: string | null;
  template_data: TemplateData | null;
  is_premium: boolean;
  created_at: string;
}
