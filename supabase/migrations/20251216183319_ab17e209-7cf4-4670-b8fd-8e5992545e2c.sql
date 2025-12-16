-- Create interactions table to log all Q&A pairs with ratings
CREATE TABLE public.interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  analysis_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert and view interactions (public demo)
CREATE POLICY "Anyone can insert interactions" ON public.interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view interactions" ON public.interactions FOR SELECT USING (true);
CREATE POLICY "Anyone can update interactions" ON public.interactions FOR UPDATE USING (true);

-- Create few_shot_examples table for storing high-quality Q&A pairs
CREATE TABLE public.few_shot_examples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  embedding vector(768),
  quality_score NUMERIC DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.few_shot_examples ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view and insert few-shot examples
CREATE POLICY "Anyone can view few_shot_examples" ON public.few_shot_examples FOR SELECT USING (true);
CREATE POLICY "Anyone can insert few_shot_examples" ON public.few_shot_examples FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update few_shot_examples" ON public.few_shot_examples FOR UPDATE USING (true);

-- Create prompt_templates table for versioned prompts
CREATE TABLE public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_type TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  template TEXT NOT NULL,
  performance_score NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(analysis_type, version)
);

-- Enable RLS
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view prompt templates
CREATE POLICY "Anyone can view prompt_templates" ON public.prompt_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert prompt_templates" ON public.prompt_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update prompt_templates" ON public.prompt_templates FOR UPDATE USING (true);

-- Create function to match few-shot examples by vector similarity
CREATE OR REPLACE FUNCTION public.match_few_shot_examples(
  query_embedding vector(768),
  match_threshold double precision DEFAULT 0.5,
  match_count integer DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  topic text,
  question text,
  answer text,
  quality_score numeric,
  similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fse.id,
    fse.topic,
    fse.question,
    fse.answer,
    fse.quality_score,
    1 - (fse.embedding <=> query_embedding) AS similarity
  FROM public.few_shot_examples fse
  WHERE fse.embedding IS NOT NULL
    AND 1 - (fse.embedding <=> query_embedding) > match_threshold
  ORDER BY fse.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add trigger for updated_at on few_shot_examples
CREATE TRIGGER update_few_shot_examples_updated_at
  BEFORE UPDATE ON public.few_shot_examples
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on prompt_templates
CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for vector similarity search on few_shot_examples
CREATE INDEX ON public.few_shot_examples USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);