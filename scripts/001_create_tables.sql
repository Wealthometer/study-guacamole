-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create subscription_tiers table
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_in_cents INTEGER NOT NULL,
  generations_per_month INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (id, name, price_in_cents, generations_per_month) VALUES
  ('free', 'Free', 0, 3),
  ('pro', 'Pro', 999, 50),
  ('unlimited', 'Unlimited', 2999, -1)
ON CONFLICT (id) DO NOTHING;

-- No RLS needed for subscription_tiers since it's read-only for all users

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id TEXT NOT NULL REFERENCES public.subscription_tiers(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- User subscriptions policies
CREATE POLICY "user_subscriptions_select_own"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_insert_own"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_subscriptions_update_own"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create flashcard_sets table
CREATE TABLE IF NOT EXISTS public.flashcard_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL, -- 'text' or 'pdf'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;

-- Flashcard sets policies
CREATE POLICY "flashcard_sets_select_own"
  ON public.flashcard_sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "flashcard_sets_insert_own"
  ON public.flashcard_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "flashcard_sets_update_own"
  ON public.flashcard_sets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "flashcard_sets_delete_own"
  ON public.flashcard_sets FOR DELETE
  USING (auth.uid() = user_id);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty INTEGER DEFAULT 0, -- 0 = new, 1 = easy, 2 = medium, 3 = hard
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Flashcards policies
CREATE POLICY "flashcards_select_own"
  ON public.flashcards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "flashcards_insert_own"
  ON public.flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "flashcards_update_own"
  ON public.flashcards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "flashcards_delete_own"
  ON public.flashcards FOR DELETE
  USING (auth.uid() = user_id);

-- Create usage_tracking table for AI generations
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  generations_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Usage tracking policies
CREATE POLICY "usage_tracking_select_own"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "usage_tracking_insert_own"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_tracking_update_own"
  ON public.usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);
