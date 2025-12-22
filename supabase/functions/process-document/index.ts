import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sentence-aware text splitting with semantic boundaries
function splitIntoSentences(text: string): string[] {
  // Split on sentence boundaries while preserving the delimiter
  const sentencePattern = /[^.!?]+[.!?]+[\s]*/g;
  const sentences = text.match(sentencePattern) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

// Create semantic chunks from sentences
function createSemanticChunks(
  text: string, 
  targetWordsPerChunk = 400, 
  overlapSentences = 2
): { content: string; wordCount: number; sentenceCount: number; position: string }[] {
  const sentences = splitIntoSentences(text);
  const chunks: { content: string; wordCount: number; sentenceCount: number; position: string }[] = [];
  
  if (sentences.length === 0) {
    return [{
      content: text,
      wordCount: text.split(/\s+/).length,
      sentenceCount: 1,
      position: 'only'
    }];
  }

  let currentChunkSentences: string[] = [];
  let currentWordCount = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceWordCount = sentence.split(/\s+/).length;
    
    currentChunkSentences.push(sentence);
    currentWordCount += sentenceWordCount;
    
    // Check if we should create a chunk
    if (currentWordCount >= targetWordsPerChunk || i === sentences.length - 1) {
      const chunkContent = currentChunkSentences.join(' ');
      const position = chunks.length === 0 ? 'beginning' : 
                       i === sentences.length - 1 ? 'end' : 'middle';
      
      chunks.push({
        content: chunkContent,
        wordCount: currentWordCount,
        sentenceCount: currentChunkSentences.length,
        position
      });
      
      // Keep overlap sentences for next chunk
      const overlapStart = Math.max(0, currentChunkSentences.length - overlapSentences);
      currentChunkSentences = currentChunkSentences.slice(overlapStart);
      currentWordCount = currentChunkSentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0);
    }
  }
  
  // Update first chunk position if only one chunk
  if (chunks.length === 1) {
    chunks[0].position = 'only';
  }
  
  return chunks;
}

// Parse CSV content with table awareness
function parseCSVContent(content: string): { content: string; wordCount: number; sentenceCount: number; position: string }[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headerLine = lines[0];
  const dataLines = lines.slice(1);
  const chunks: { content: string; wordCount: number; sentenceCount: number; position: string }[] = [];
  
  // Create chunks of ~20 rows each, always including header
  const rowsPerChunk = 20;
  for (let i = 0; i < dataLines.length; i += rowsPerChunk) {
    const chunkRows = dataLines.slice(i, i + rowsPerChunk);
    const chunkContent = [headerLine, ...chunkRows].join('\n');
    const position = i === 0 ? 'beginning' : 
                     i + rowsPerChunk >= dataLines.length ? 'end' : 'middle';
    
    chunks.push({
      content: `[CSV Table Data]\nHeaders: ${headerLine}\n\n${chunkContent}`,
      wordCount: chunkContent.split(/\s+/).length,
      sentenceCount: chunkRows.length,
      position
    });
  }
  
  if (chunks.length === 1) {
    chunks[0].position = 'only';
  }
  
  return chunks;
}

// Detect document type from file name and content
function detectDocumentType(fileName: string, content: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  
  if (ext === 'csv' || content.includes(',') && content.split('\n')[0]?.split(',').length > 2) {
    return 'csv';
  }
  if (ext === 'pdf') return 'pdf';
  if (ext === 'json') return 'json';
  if (ext === 'md' || ext === 'markdown') return 'markdown';
  
  // Content-based detection
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('balance sheet') || lowerContent.includes('income statement') || 
      lowerContent.includes('cash flow') || lowerContent.includes('revenue')) {
    return 'financial';
  }
  if (lowerContent.includes('§') || lowerContent.includes('article') || lowerContent.includes('clause')) {
    return 'legal';
  }
  
  return 'text';
}

// Extract key entities from content (simple extraction)
function extractEntities(content: string): string[] {
  const entities: Set<string> = new Set();
  
  // Extract monetary values
  const moneyPattern = /\$[\d,]+\.?\d*|\d+\.?\d*\s*(million|billion|USD|EUR|GBP)/gi;
  const moneyMatches = content.match(moneyPattern) || [];
  moneyMatches.slice(0, 5).forEach(m => entities.add(m.trim()));
  
  // Extract percentages
  const percentPattern = /\d+\.?\d*\s*%/g;
  const percentMatches = content.match(percentPattern) || [];
  percentMatches.slice(0, 5).forEach(m => entities.add(m.trim()));
  
  // Extract dates
  const datePattern = /\b(Q[1-4]\s*\d{4}|\d{4}|January|February|March|April|May|June|July|August|September|October|November|December)\b/gi;
  const dateMatches = content.match(datePattern) || [];
  dateMatches.slice(0, 5).forEach(m => entities.add(m.trim()));
  
  return Array.from(entities).slice(0, 10);
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string, openaiApiKey: string): Promise<number[] | null> {
  try {
    // Truncate text to ~8000 tokens (roughly 32000 chars)
    const truncatedText = text.slice(0, 32000);
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: truncatedText,
      }),
    });

    if (!response.ok) {
      console.error('Embedding API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { documentId, content, fileName, userId } = await req.json();
    
    console.log(`Processing document: ${documentId}, file: ${fileName}, user: ${userId || 'anonymous'}`);

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // Detect document type
    const documentType = detectDocumentType(fileName, content);
    console.log(`Detected document type: ${documentType}`);

    // Create chunks based on document type
    let chunks: { content: string; wordCount: number; sentenceCount: number; position: string }[];
    
    if (documentType === 'csv') {
      chunks = parseCSVContent(content);
    } else {
      chunks = createSemanticChunks(content, 400, 2);
    }
    
    console.log(`Created ${chunks.length} semantic chunks`);

    // Limit chunks for very large documents
    const maxChunks = 200;
    const chunksToProcess = chunks.slice(0, maxChunks);
    if (chunks.length > maxChunks) {
      console.log(`Document too large, processing first ${maxChunks} chunks out of ${chunks.length}`);
    }

    // Process chunks with embeddings
    const chunkInserts = [];
    
    for (let i = 0; i < chunksToProcess.length; i++) {
      const chunk = chunksToProcess[i];
      const entities = extractEntities(chunk.content);
      
      // Generate embedding if OpenAI key is available
      let embedding = null;
      if (openaiApiKey) {
        embedding = await generateEmbedding(chunk.content, openaiApiKey);
        // Small delay to avoid rate limiting
        if (i < chunksToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      chunkInserts.push({
        document_id: documentId,
        chunk_index: i,
        content: chunk.content,
        embedding: embedding,
        user_id: userId || null,
        document_type: documentType,
        chunk_position: chunk.position,
        word_count: chunk.wordCount,
        sentence_count: chunk.sentenceCount,
        entities: entities,
        confidence_score: embedding ? 1.0 : 0.5, // Higher confidence if we have embeddings
        metadata: {
          file_name: fileName,
          chunk_index: i,
          total_chunks: chunksToProcess.length,
          truncated: chunks.length > maxChunks,
          document_type: documentType,
          has_embedding: !!embedding,
        },
      });
    }

    // Insert all chunks
    const { error: insertError } = await supabase
      .from('document_chunks')
      .insert(chunkInserts);

    if (insertError) {
      throw insertError;
    }

    // Update document status to completed
    await supabase
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', documentId);

    const embeddingsGenerated = chunkInserts.filter(c => c.embedding !== null).length;
    console.log(`Successfully processed document ${documentId}: ${chunksToProcess.length} chunks, ${embeddingsGenerated} embeddings`);

    return new Response(JSON.stringify({ 
      success: true, 
      chunksCreated: chunksToProcess.length,
      embeddingsGenerated,
      totalChunks: chunks.length,
      documentType,
      truncated: chunks.length > maxChunks
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error processing document:", error);
    
    // Try to update document status to failed
    try {
      const { documentId } = await req.json().catch(() => ({}));
      if (documentId) {
        await supabase
          .from('documents')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', documentId);
      }
    } catch {}

    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to process document" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
