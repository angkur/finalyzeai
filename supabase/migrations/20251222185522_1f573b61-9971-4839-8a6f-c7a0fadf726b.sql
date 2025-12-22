-- Add new columns to document_chunks for better metadata and embeddings
ALTER TABLE public.document_chunks 
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'text',
ADD COLUMN IF NOT EXISTS chunk_position TEXT DEFAULT 'middle',
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sentence_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC DEFAULT 0;

-- Add index for faster searches
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_type ON public.document_chunks(document_type);
CREATE INDEX IF NOT EXISTS idx_document_chunks_user_document ON public.document_chunks(user_id, document_id);

-- Create function for hybrid search with confidence scoring
CREATE OR REPLACE FUNCTION public.hybrid_search_documents(
  query_embedding vector(1536),
  search_keywords TEXT[],
  match_threshold DOUBLE PRECISION DEFAULT 0.5,
  match_count INTEGER DEFAULT 10,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  document_type TEXT,
  chunk_position TEXT,
  similarity DOUBLE PRECISION,
  keyword_score INTEGER,
  combined_score DOUBLE PRECISION,
  confidence_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH vector_scores AS (
    SELECT
      dc.id,
      dc.document_id,
      dc.content,
      dc.metadata,
      dc.document_type,
      dc.chunk_position,
      dc.confidence_score,
      CASE 
        WHEN dc.embedding IS NOT NULL THEN 1 - (dc.embedding <=> query_embedding)
        ELSE 0
      END AS semantic_similarity
    FROM public.document_chunks dc
    WHERE (p_user_id IS NULL OR dc.user_id = p_user_id)
  ),
  keyword_scores AS (
    SELECT
      vs.*,
      (
        SELECT COUNT(*)::INTEGER
        FROM unnest(search_keywords) AS kw
        WHERE LOWER(vs.content) LIKE '%' || LOWER(kw) || '%'
      ) AS kw_score
    FROM vector_scores vs
  )
  SELECT
    ks.id,
    ks.document_id,
    ks.content,
    ks.metadata,
    ks.document_type,
    ks.chunk_position,
    ks.semantic_similarity AS similarity,
    ks.kw_score AS keyword_score,
    -- Combined score: 70% semantic + 30% keyword (normalized)
    (ks.semantic_similarity * 0.7) + 
    (CASE WHEN array_length(search_keywords, 1) > 0 
      THEN (ks.kw_score::DOUBLE PRECISION / array_length(search_keywords, 1)) * 0.3
      ELSE 0 
    END) AS combined_score,
    ks.confidence_score
  FROM keyword_scores ks
  WHERE ks.semantic_similarity > match_threshold OR ks.kw_score > 0
  ORDER BY 
    (ks.semantic_similarity * 0.7) + 
    (CASE WHEN array_length(search_keywords, 1) > 0 
      THEN (ks.kw_score::DOUBLE PRECISION / array_length(search_keywords, 1)) * 0.3
      ELSE 0 
    END) DESC
  LIMIT match_count;
END;
$$;