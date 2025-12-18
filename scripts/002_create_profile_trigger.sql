-- Auto-create profile and free subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email)
  VALUES (
    new.id,
    new.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert free subscription by default
  INSERT INTO public.user_subscriptions (user_id, tier_id, status, current_period_start, current_period_end)
  VALUES (
    new.id,
    'free',
    'active',
    NOW(),
    NOW() + INTERVAL '1 year'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
