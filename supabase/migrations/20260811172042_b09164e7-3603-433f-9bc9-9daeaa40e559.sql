CREATE TABLE public.email_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text NOT NULL,
  result_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.email_leads TO anon;
GRANT INSERT, SELECT ON public.email_leads TO authenticated;
GRANT ALL ON public.email_leads TO service_role;

ALTER TABLE public.email_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an email lead"
ON public.email_leads FOR INSERT
WITH CHECK (
  length(email) BETWEEN 5 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(source) BETWEEN 1 AND 64
);

CREATE POLICY "Admins can view email leads"
ON public.email_leads FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can view email leads"
ON public.email_leads FOR SELECT
USING (has_role(auth.uid(), 'moderator'::app_role));

CREATE INDEX idx_email_leads_created_at ON public.email_leads (created_at DESC);