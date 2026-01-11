-- Fix the security definer view issue by dropping it and using the table directly
-- The Stripe IDs are already protected by RLS - users can only see their own data
DROP VIEW IF EXISTS public.user_plans_safe;