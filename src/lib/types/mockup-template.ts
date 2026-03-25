// Types for mockup templates, now used by Supabase data only

export interface LogoPlacement {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export interface MockupTemplateConfig {
  id: string;
  name: string;
  category: string; // Now string, matches Supabase
  baseImageUrl: string;
  thumbnailUrl: string;
  logoPlacement: LogoPlacement;
  outputWidth: number;
  outputHeight: number;
  isPremium: boolean;
}
