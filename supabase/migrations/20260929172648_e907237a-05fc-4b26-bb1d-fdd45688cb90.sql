ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS detected_kind text,
  ADD COLUMN IF NOT EXISTS detected_confidence real,
  ADD COLUMN IF NOT EXISTS detected_analysis text,
  ADD COLUMN IF NOT EXISTS detected_is_financial real,
  ADD COLUMN IF NOT EXISTS detected_usability real,
  ADD COLUMN IF NOT EXISTS detected_at timestamp with time zone;

COMMENT ON COLUMN public.documents.detected_kind IS 'Document kind chosen by the Jev typed-decision model (e.g. profit_loss, bank_statement).';
COMMENT ON COLUMN public.documents.detected_confidence IS 'Model confidence in detected_kind, 0-1.';
COMMENT ON COLUMN public.documents.detected_analysis IS 'Analysis mode recommended for this document.';
COMMENT ON COLUMN public.documents.detected_is_financial IS 'Probability the document holds usable financial figures, 0-1.';
COMMENT ON COLUMN public.documents.detected_usability IS 'Normalised 0-1 usability of the figures for analysis.';
COMMENT ON COLUMN public.documents.detected_at IS 'When detection last ran.';