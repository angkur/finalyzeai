-- Create user_plans table to track subscriptions and plan limits
CREATE TABLE public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_name TEXT NOT NULL DEFAULT 'free' CHECK (plan_name IN ('free', 'mini', 'starter', 'pro')),
  upload_limit_mb INTEGER NOT NULL DEFAULT 5,
  history_retention_days INTEGER NOT NULL DEFAULT 7,
  daily_limit INTEGER NOT NULL DEFAULT 5,
  monthly_limit INTEGER NOT NULL DEFAULT 5,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own plan"
  ON public.user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan"
  ON public.user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all plans"
  ON public.user_plans FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all plans"
  ON public.user_plans FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert plans"
  ON public.user_plans FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create free plan for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_plans (user_id, plan_name, upload_limit_mb, history_retention_days, daily_limit, monthly_limit)
  VALUES (NEW.id, 'free', 5, 7, 5, 5);
  RETURN NEW;
END;
$$;

-- Trigger to create plan when user signs up
CREATE TRIGGER on_auth_user_created_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_plan();

-- Enable pg_cron and pg_net extensions for scheduled cleanup
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;