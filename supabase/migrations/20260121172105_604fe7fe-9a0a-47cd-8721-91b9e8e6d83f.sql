-- Drop the overly permissive INSERT and UPDATE policies on few_shot_examples
DROP POLICY IF EXISTS "Anyone can insert few_shot_examples" ON public.few_shot_examples;
DROP POLICY IF EXISTS "Anyone can update few_shot_examples" ON public.few_shot_examples;

-- Create new policies that restrict INSERT and UPDATE to admins only
CREATE POLICY "Admins can insert few_shot_examples"
ON public.few_shot_examples
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update few_shot_examples"
ON public.few_shot_examples
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));