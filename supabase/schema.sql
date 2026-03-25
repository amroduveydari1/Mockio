-- Mockio Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  mockups_generated INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logos table
CREATE TABLE public.logos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mockup categories table
create table if not exists public.mockup_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  display_order integer default 0,
  created_at timestamptz not null default now()
);

-- Insert default categories
insert into public.mockup_categories (name, slug, description, display_order)
values
  ('Business Cards', 'business-card', 'Business card mockups', 1),
  ('Signage', 'signage', 'Signage and outdoor branding', 2),
  ('Apparel', 'apparel', 'T-shirts, hats, and other apparel', 3),
  ('Packaging', 'packaging', 'Product packaging mockups', 4),
  ('Digital Screen', 'digital-screen', 'Screens, devices, and digital displays', 5),
  ('Stationary', 'stationary', 'Letterheads, envelopes, and office stationary', 6)
  on conflict (slug) do nothing;

-- Mockup templates table
CREATE TABLE public.mockup_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.mockup_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  preview_url TEXT NOT NULL,
  template_data JSONB,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated mockups table
CREATE TABLE public.generated_mockups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  logo_id UUID REFERENCES public.logos(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.mockup_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  result_url TEXT NOT NULL,
  result_path TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mockup_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mockup_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_mockups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for logos
CREATE POLICY "Users can view their own logos"
  ON public.logos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logos"
  ON public.logos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logos"
  ON public.logos FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for mockup_categories (public read)
CREATE POLICY "Anyone can view mockup categories"
  ON public.mockup_categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS Policies for mockup_templates (public read)
CREATE POLICY "Anyone can view mockup templates"
  ON public.mockup_templates FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- RLS Policies for generated_mockups
CREATE POLICY "Users can view their own generated mockups"
  ON public.generated_mockups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generated mockups"
  ON public.generated_mockups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated mockups"
  ON public.generated_mockups FOR DELETE
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sample data: Mockup categories
INSERT INTO public.mockup_categories (name, slug, description, display_order) VALUES
  ('Business Cards', 'business-cards', 'Professional card presentations', 1),
  ('Signage', 'signage', 'Indoor & outdoor signs', 2),
  ('Apparel', 'apparel', 'T-shirts, hoodies & more', 3),
  ('Packaging', 'packaging', 'Boxes, bags & containers', 4),
  ('Digital Screens', 'digital', 'Phone, tablet & laptop screens', 5),
  ('Stationery', 'stationery', 'Letterheads & envelopes', 6),
  ('Print', 'print', 'Posters, flyers & brochures', 7),
  ('Social Media', 'social-media', 'Profile pics & banners', 8);

-- =====================================================
-- STORAGE SETUP
-- Run these commands in the Supabase Dashboard > Storage
-- or via the Supabase CLI
-- =====================================================

-- Create storage bucket for logos (public read for serving images)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Create storage bucket for generated mockups
-- INSERT INTO storage.buckets (id, name, public) VALUES ('mockups', 'mockups', true);

-- Storage RLS Policies for logos bucket
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own logos
CREATE POLICY "Users can update their own logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own logos
CREATE POLICY "Users can delete their own logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access to logos (for displaying in mockups)
CREATE POLICY "Public can view logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'logos');

-- Storage RLS Policies for mockups bucket
CREATE POLICY "Users can upload mockups"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'mockups' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own mockups"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'mockups' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can view mockups"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'mockups');

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================

-- Subscriptions table for billing/payment tracking
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to sync subscription tier to profile
CREATE OR REPLACE FUNCTION public.sync_subscription_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    subscription_tier = NEW.plan_id,
    monthly_limit = CASE 
      WHEN NEW.plan_id = 'free' THEN 10
      WHEN NEW.plan_id = 'pro' THEN 100
      WHEN NEW.plan_id = 'enterprise' THEN 1000
      ELSE 10
    END,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync subscription changes to profile
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_subscription_to_profile();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Logos indexes
CREATE INDEX idx_logos_user_id ON public.logos(user_id);
CREATE INDEX idx_logos_created_at ON public.logos(created_at DESC);

-- Generated mockups indexes
CREATE INDEX idx_generated_mockups_user_id ON public.generated_mockups(user_id);
CREATE INDEX idx_generated_mockups_logo_id ON public.generated_mockups(logo_id);
CREATE INDEX idx_generated_mockups_template_id ON public.generated_mockups(template_id);
CREATE INDEX idx_generated_mockups_created_at ON public.generated_mockups(created_at DESC);
CREATE INDEX idx_generated_mockups_user_created ON public.generated_mockups(user_id, created_at DESC);

-- Mockup templates indexes
CREATE INDEX idx_mockup_templates_category_id ON public.mockup_templates(category_id);
CREATE INDEX idx_mockup_templates_is_active ON public.mockup_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_mockup_templates_is_premium ON public.mockup_templates(is_premium);

-- Mockup categories index
CREATE INDEX idx_mockup_categories_slug ON public.mockup_categories(slug);
CREATE INDEX idx_mockup_categories_display_order ON public.mockup_categories(display_order);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_current_period_end ON public.subscriptions(current_period_end);

-- Profiles index for email lookup
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user can generate more mockups
CREATE OR REPLACE FUNCTION public.can_generate_mockup(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_generated INTEGER;
  v_limit INTEGER;
  v_period_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user's subscription period start (or beginning of current month for free users)
  SELECT COALESCE(s.current_period_start, date_trunc('month', NOW()))
  INTO v_period_start
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON s.user_id = p.id
  WHERE p.id = p_user_id;

  -- Count mockups generated in current period
  SELECT COUNT(*)
  INTO v_generated
  FROM public.generated_mockups
  WHERE user_id = p_user_id
    AND created_at >= v_period_start;

  -- Get user's monthly limit
  SELECT monthly_limit INTO v_limit
  FROM public.profiles
  WHERE id = p_user_id;

  RETURN v_generated < COALESCE(v_limit, 10);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's mockup usage stats
CREATE OR REPLACE FUNCTION public.get_mockup_usage(p_user_id UUID)
RETURNS TABLE(
  generated_count INTEGER,
  monthly_limit INTEGER,
  remaining INTEGER,
  subscription_tier TEXT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.generated_mockups gm
      WHERE gm.user_id = p_user_id
        AND gm.created_at >= COALESCE(s.current_period_start, date_trunc('month', NOW()))
    ), 0) as generated_count,
    p.monthly_limit,
    GREATEST(0, p.monthly_limit - COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.generated_mockups gm
      WHERE gm.user_id = p_user_id
        AND gm.created_at >= COALESCE(s.current_period_start, date_trunc('month', NOW()))
    ), 0)) as remaining,
    p.subscription_tier,
    COALESCE(s.current_period_start, date_trunc('month', NOW())) as period_start,
    COALESCE(s.current_period_end, date_trunc('month', NOW()) + INTERVAL '1 month') as period_end
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON s.user_id = p.id
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
