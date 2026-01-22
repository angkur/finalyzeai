-- Fix Critical: Lock down prompt_templates to admin-only writes
DROP POLICY IF EXISTS "Anyone can insert prompt_templates" ON public.prompt_templates;
DROP POLICY IF EXISTS "Anyone can update prompt_templates" ON public.prompt_templates;

CREATE POLICY "Admins can insert prompt_templates" 
ON public.prompt_templates FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update prompt_templates" 
ON public.prompt_templates FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix Medium: Harden analytics_events to require valid session
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

CREATE POLICY "Valid session can insert analytics events"
ON public.analytics_events FOR INSERT
WITH CHECK (
  session_id IS NOT NULL 
  AND length(session_id) >= 10
);