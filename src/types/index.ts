export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: "free" | "pro" | "enterprise";
  created_at: string;
}

export interface Logo {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface MockupCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  mockup_count: number;
}

export interface MockupTemplate {
  id: string;
  category_id: string;
  name: string;
  preview_url: string | null;
  asset_url: string | null;
  template_data: Record<string, any> | null;
  is_premium: boolean;
  created_at: string;
}

export interface GeneratedMockup {
  id: string;
  user_id: string;
  logo_id: string;
  template_id: string;
  result_url: string;
  created_at: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

// ─── Brand Set Types ─────────────────────────────────────────────────────────

export interface BrandSetItem {
  id: string;
  category_slug: string;
  category_name: string;
  template_name: string;
  result_url: string;
  thumbnail_url: string | null;
  error?: string;
}

export interface BrandSetResult {
  success: boolean;
  items: BrandSetItem[];
  errors: string[];
  brand_set_id: string;
  analysis?: {
    aspect: "wide" | "square" | "tall";
    colorType: "light" | "dark";
    complexity: "simple" | "detailed";
  };
}

export interface BrandSetMetadata {
  brand_set_id: string;
  category_slug: string;
  brandType: "minimal" | "bold";
  logoAspect: "wide" | "square" | "tall";
  logoColorType: "light" | "dark";
  complexity: "simple" | "detailed";
  templateScore: number;
  generatedAt: string;
}
