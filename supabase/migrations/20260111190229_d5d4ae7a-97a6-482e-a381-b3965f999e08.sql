-- Fix 1: Restrict active_sessions to authenticated users and their own sessions
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Anyone can update their session" ON public.active_sessions;
DROP POLICY IF EXISTS "Anyone can delete their session" ON public.active_sessions;

-- New policies that require authentication and ownership
CREATE POLICY "Authenticated users can insert their own sessions"
ON public.active_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions"
ON public.active_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own sessions"
ON public.active_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow anon users to only insert sessions with null user_id (for tracking before login)
CREATE POLICY "Anonymous can insert anonymous sessions"
ON public.active_sessions
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous can update anonymous sessions"
ON public.active_sessions
FOR UPDATE
TO anon
USING (user_id IS NULL);

-- Fix 2: Add rate limiting for contact_messages using a trigger
CREATE OR REPLACE FUNCTION public.check_contact_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check how many messages from this email in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.contact_messages
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Limit to 3 messages per hour per email
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS contact_rate_limit_trigger ON public.contact_messages;
CREATE TRIGGER contact_rate_limit_trigger
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_contact_rate_limit();

-- Fix 3: Hide sensitive Stripe fields from direct selection (create a view for safe access)
-- Users can still see their plan details but Stripe IDs are only accessible server-side
CREATE OR REPLACE VIEW public.user_plans_safe AS
SELECT 
  id,
  user_id,
  plan_name,
  upload_limit_mb,
  history_retention_days,
  daily_limit,
  monthly_limit,
  started_at,
  expires_at,
  created_at,
  updated_at,
  -- Only show if subscription exists, not the actual ID
  CASE WHEN stripe_subscription_id IS NOT NULL THEN true ELSE false END AS has_subscription,
  CASE WHEN stripe_customer_id IS NOT NULL THEN true ELSE false END AS has_customer
FROM public.user_plans;